
import express from 'express';
import {
  getCommentsByNewsId,
  commentNews,
  deleteComment,
  toggleLikeComment,
  getAllComments,
  getCommentStats,
} from '../app/controllers/CommentController.js';
import { verifyToken, verifyAdmin } from '../middlewares/verify.js';

const router = express.Router();

router.get('/admin/stats', verifyAdmin, getCommentStats);

router.post('/', verifyToken, commentNews);
router.get('/all', verifyAdmin, getAllComments);
router.get('/:newsId', getCommentsByNewsId);
router.delete('/:commentId', verifyToken, deleteComment);
router.post('/like/:commentId', verifyToken, toggleLikeComment);

export default router;
