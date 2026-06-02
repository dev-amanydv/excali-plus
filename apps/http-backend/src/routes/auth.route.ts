import { Router } from "express";
import { handleGoogleSession, handleLogin, handleSignup } from "../controllers/auth.controller.js";

const router: Router = Router();

router.post('/signup', handleSignup);
router.post('/login', handleLogin);
router.post('/google', handleGoogleSession);

export default router;