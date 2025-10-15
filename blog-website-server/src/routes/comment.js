import express from 'express';
import {
  getCommentsByNewsId,
  commentNews,
  deleteComment,
  toggleLikeComment,
} from '../app/controllers/CommentController.js';
import { verifyToken } from '../middlewares/verify.js';

const router = express.Router();

router.post('/', verifyToken, commentNews);
router.get('/:newsId', getCommentsByNewsId);
router.delete('/:commentId', verifyToken, deleteComment);
router.post('/like/:commentId', verifyToken, toggleLikeComment);

export default router;
