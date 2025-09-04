import express from 'express';
import { getAllSales, createSale, getSalesStats } from '../controllers/salesController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Sales routes
router.get('/', getAllSales);
router.post('/', createSale);
router.get('/stats', getSalesStats);

export default router; 