// src/routes/proyectos.routes.ts
import { Router } from 'express';
import { simularCalculo, guardarProyecto } from '../controllers/proyecto.controller';
import authenticateToken from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  datosFormularioProyectoSchema,
  proyectoCompletoParaGuardarSchema,
} from '../schemas/proyecto.schema';

const router = Router();

// Endpoint para simular/verificar un proyecto
router.post(
  '/simular',
  authenticateToken,
  validate(datosFormularioProyectoSchema),
  simularCalculo,
);

// Endpoint para guardar un proyecto ya verificado
router.post(
  '/guardar',
  authenticateToken,
  validate(proyectoCompletoParaGuardarSchema),
  guardarProyecto,
);

export default router;