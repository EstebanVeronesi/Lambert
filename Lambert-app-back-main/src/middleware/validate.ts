// src/middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Datos inválidos',
          detalles: error.issues.map((e) => ({
            campo: e.path.join('.'),
            mensaje: e.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
}
