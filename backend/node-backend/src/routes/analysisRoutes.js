import express from 'express';
import { 
  checkHealth, 
  analyzeText, 
  getHistory, 
  deleteHistory 
} from '../controllers/analysisController.js';

const router = express.Router();

router.get('/health', checkHealth);
router.post('/analyze', analyzeText);
router.get('/history', getHistory);
router.delete('/history/:id', deleteHistory);

export default router;