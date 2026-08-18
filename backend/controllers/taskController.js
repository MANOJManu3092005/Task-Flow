const Task = require('../models/Task');
const Comment = require('../models/Comment');

exports.getTasks = async (req, res) => {
  try {
    const filter = {};
    if (req.query.project) filter.project = req.query.project;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .sort({ createdAt: -1 });

    const tasksWithCommentCount = await Promise.all(
      tasks.map(async (task) => {
        const commentCount = await Comment.countDocuments({ task: task._id });
        return { ...task.toObject(), commentCount };
      })
    );

    res.json(tasksWithCommentCount);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching tasks.' });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('project', 'name');

    if (!task) return res.status(404).json({ message: 'Task not found.' });

    const commentCount = await Comment.countDocuments({ task: task._id });

    res.json({ ...task.toObject(), commentCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching the task.' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, priority, status, dueDate } = req.body;

    if (!title || !project) {
      return res.status(400).json({ message: 'Task title and project are required.' });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo: assignedTo || null,
      priority: priority || 'Medium',
      status: status || 'To Do',
      dueDate
    });

    const populated = await task.populate('assignedTo', 'name email');

    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while creating the task.' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, status, dueDate } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();
    const populated = await task.populate('assignedTo', 'name email');

    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while updating the task.' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    await Comment.deleteMany({ task: task._id });
    await task.deleteOne();

    res.json({ message: 'Task deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while deleting the task.' });
  }
};
