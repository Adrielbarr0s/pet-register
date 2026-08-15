import { Router } from 'express';
import { authController } from '../controllers/authController.js';

const router = Router();

router.post('/google', authController.googleLogin);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/demo', authController.demoLogin);

export default router;
