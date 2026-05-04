// src/controllers/proyecto.controller.ts
import { Request, Response } from 'express';
import { ProyectoService } from '../services/proyecto.service';
import { DatosFormularioProyecto, ProyectoCompletoParaGuardar } from '../types/proyecto.types';
import logger from '../utils/logger';

const proyectoService = new ProyectoService();

export const simularCalculo = async (req: Request, res: Response) => {
  try {
    const datosDeEntrada: DatosFormularioProyecto = req.body;
    const resultadoSimulacion = await proyectoService.generarSimulacion(datosDeEntrada);
    res.status(200).json(resultadoSimulacion);
  } catch (error: unknown) {
    logger.error('Error en simularCalculo:', error);
    const message = error instanceof Error ? error.message : 'Error desconocido';
    res.status(400).json({ error: message });
  }
};

export const guardarProyecto = async (req: Request, res: Response) => {
  try {
    const proyectoCompleto: ProyectoCompletoParaGuardar = req.body;
    const resultadoGuardado = await proyectoService.guardarProyectoCompleto(proyectoCompleto);
    res.status(201).json(resultadoGuardado);
  } catch (error: unknown) {
    logger.error('Error en guardarProyecto:', error);
    const message = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ error: message });
  }
};