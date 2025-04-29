// backend/src/routes/debateRoutes.js
import express from 'express';
import { debateController } from '../controllers/debateController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas de debates
router.get('/project/:projectId', debateController.getDebates);
router.get('/:id', debateController.getDebate);
router.post('/', debateController.createDebate);
router.post('/:id/next-turn', debateController.generateNextTurn);

export default router;
