const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

function generateToken(user) {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email: email.toLowerCase(), password: hashedPassword });
    const token = generateToken(user);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const projectCount = await Project.countDocuments({
      $or: [{ owner: user._id }, { members: user._id }]
    });
    const taskCount = await Task.countDocuments({ assignedTo: user._id });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      projectCount,
      taskCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching profile.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();

    await user.save();

    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while updating profile.' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('_id name email');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching users.' });
  }
};
