const Project = require('../models/Project');
const Task = require('../models/Task');

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user.id }, { members: req.user.id }]
    })
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const totalTasks = await Task.countDocuments({ project: project._id });
        const doneTasks = await Task.countDocuments({ project: project._id, status: 'Done' });
        const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

        return {
          ...project.toObject(),
          taskCount: totalTasks,
          progress
        };
      })
    );

    res.json(projectsWithStats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching projects.' });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) return res.status(404).json({ message: 'Project not found.' });

    const totalTasks = await Task.countDocuments({ project: project._id });
    const doneTasks = await Task.countDocuments({ project: project._id, status: 'Done' });
    const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

    res.json({ ...project.toObject(), taskCount: totalTasks, progress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching the project.' });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { name, description, dueDate, members } = req.body;

    if (!name) return res.status(400).json({ message: 'Project name is required.' });

    const project = await Project.create({
      name,
      description,
      dueDate,
      owner: req.user.id,
      members: members || []
    });

    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while creating the project.' });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { name, description, dueDate, members } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: 'Project not found.' });

    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (dueDate !== undefined) project.dueDate = dueDate;
    if (members !== undefined) project.members = members;

    await project.save();
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while updating the project.' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ message: 'Project deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while deleting the project.' });
  }
};
