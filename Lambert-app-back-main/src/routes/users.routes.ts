import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { getUsuarios, eliminarUsuario } from '../controllers/users.controller';
import authenticateToken from '../middleware/auth';
import { AuthenticatedRequest } from '../types/express.types';

type AsyncAuthHandler = (req: AuthenticatedRequest, res: Response) => Promise<unknown>;

const wrapAsync = (fn: AsyncAuthHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as AuthenticatedRequest, res)).catch(next);
  };

const router = Router();

router.get('/', authenticateToken, wrapAsync(getUsuarios));
router.delete('/:dni', authenticateToken, wrapAsync(eliminarUsuario));

export default router;
