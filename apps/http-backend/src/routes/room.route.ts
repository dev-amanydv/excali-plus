import { Router } from "express";
import { handleCreateRoom, handleSaveElements } from "../controllers/room.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.post('/create', authMiddleware, handleCreateRoom);
router.post('/:roomId/elements', authMiddleware, handleSaveElements);
export default router;