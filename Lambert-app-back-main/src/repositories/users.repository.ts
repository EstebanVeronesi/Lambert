import { pool } from '../../db';
import logger from '../utils/logger';

export interface UserRow {
  id: number;
  dni: string;
  nombre: string;
  email: string;
  rol: string;
}

export class UsersRepository {
  static async findAll(): Promise<UserRow[]> {
    try {
      const query = `
        SELECT dni AS id, dni, nombre, email, rol
        FROM users
        ORDER BY nombre;
      `;
      const result = await pool.query(query);
      return result.rows;
    } catch (error: unknown) {
      logger.error("Error al buscar usuarios:", error);
      throw new Error("No se pudo obtener la lista de usuarios.");
    }
  }

  static async delete(dni: string): Promise<void> {
    try {
      const query = `DELETE FROM users WHERE dni = $1`;
      await pool.query(query, [dni]);
    } catch (error: unknown) {
      logger.error("Error al eliminar usuario:", error);
      throw new Error("No se pudo eliminar el usuario.");
    }
  }
}
