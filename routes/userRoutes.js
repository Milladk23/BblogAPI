import express from 'express';
import {signup, login, updatePassword, protect} from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/updateMyPassword', protect, updatePassword);

export default router;