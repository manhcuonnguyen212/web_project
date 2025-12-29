import express from 'express';
import {
  createReport,
  getAllReports,
  updateReportStatus,
  deleteReport,
} from '../app/controllers/ReportController.js';
import { verifyToken, verifyAdmin } from '../middlewares/verify.js';

const router = express.Router();

router.post('/', verifyToken, createReport);
router.get('/', verifyAdmin, getAllReports);
router.put('/:reportId', verifyAdmin, updateReportStatus);
router.delete('/:reportId', verifyAdmin, deleteReport);

export default router;
