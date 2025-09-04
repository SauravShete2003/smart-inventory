import express from 'express';
import { getInventory, postInventory, putInventory, deleteInventory } from '../controllers/inventory.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Inventory routes
router.get('/', getInventory);
router.post('/', authorizeRole(['admin', 'manager']), postInventory);
router.put('/:id', authorizeRole(['admin', 'manager']), putInventory);
router.delete('/:id', authorizeRole(['admin']), deleteInventory);

export default router; 