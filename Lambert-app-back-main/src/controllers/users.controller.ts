import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express.types';
import { UsersRepository } from '../repositories/users.repository';
import { pool } from '../../db';
import logger from '../utils/logger';

export const getUsuarios = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const usuarios = await UsersRepository.findAll();
    res.status(200).json(usuarios);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    logger.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: message });
  }
};

export const eliminarUsuario = async (req: AuthenticatedRequest, res: Response) => {
  const { dni } = req.params;
  const usuario = req.user;

  // 1. Solo admin puede eliminar
  if (usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Solo un administrador puede eliminar usuarios' });
  }

  // 2. No puede eliminarse a sí mismo
  if (String(usuario.dni) === String(dni)) {
    return res.status(400).json({ error: 'No podés eliminar tu propio usuario' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verificar último admin con lock
    const countResult = await client.query(
      "SELECT COUNT(*) FROM users WHERE rol = 'admin' FOR UPDATE"
    );
    const adminCount = parseInt(countResult.rows[0].count, 10);

    const userResult = await client.query(
      'SELECT rol FROM users WHERE dni = $1', [dni]
    );
    const rolTarget: string | undefined = userResult.rows[0]?.rol;

    if (rolTarget === 'admin' && adminCount <= 1) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No se puede eliminar el último administrador' });
    }

    // Eliminar
    await client.query('DELETE FROM users WHERE dni = $1', [dni]);
    await client.query('COMMIT');
    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    const message = error instanceof Error ? error.message : 'Error al eliminar usuario';
    logger.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: message });
  } finally {
    client.release();
  }
};
