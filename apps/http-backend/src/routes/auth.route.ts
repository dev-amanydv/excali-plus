import { Router } from "express";
import { handleGoogleSession, handleLogin, handleMe, handleSignup } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.post('/signup', handleSignup);
router.post('/login', handleLogin);
router.post('/google', handleGoogleSession);
router.get('/me', authMiddleware, handleMe);

export default router;