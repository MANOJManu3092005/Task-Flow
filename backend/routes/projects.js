const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');

router.get('/', auth, getProjects);
router.get('/:id', auth, getProject);
router.post('/', auth, createProject);
router.put('/:id', auth, updateProject);
router.delete('/:id', auth, deleteProject);

module.exports = router;
