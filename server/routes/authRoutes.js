import express from 'express';
import { postLogin, postSignup } from '../controllers/user.js';

const router = express.Router();

// Auth routes
router.post('/signup', postSignup);
router.post('/login', postLogin);

export default router; 