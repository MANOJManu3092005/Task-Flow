const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const { getComments, addComment } = require('../controllers/commentController');

router.get('/', auth, getTasks);
router.get('/:id', auth, getTask);
router.post('/', auth, createTask);
router.put('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);

// Nested comment routes: /api/tasks/:id/comments
router.get('/:id/comments', auth, getComments);
router.post('/:id/comments', auth, addComment);

module.exports = router;
