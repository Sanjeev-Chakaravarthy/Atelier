const express = require('express');
const { body } = require('express-validator');
const {
  getTasks, createTask, getTask, updateTask, deleteTask, addComment, reorderTasks,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', getTasks);
router.post('/', [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('status').optional().isIn(['todo', 'in-progress', 'review', 'done']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
], createTask);

router.put('/reorder', reorderTasks);

router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.post('/:id/comments', [
  body('text').trim().notEmpty().withMessage('Comment text is required'),
], addComment);

module.exports = router;
