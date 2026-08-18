const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Review', 'Done'],
      default: 'To Do'
    },
    dueDate: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', TaskSchema);
