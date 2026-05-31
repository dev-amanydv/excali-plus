import { Router } from "express";
import { handleCreateRoom } from "../controllers/room.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.post('/create',authMiddleware, handleCreateRoom);
export default router;