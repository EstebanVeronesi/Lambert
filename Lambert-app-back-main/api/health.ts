import { VercelRequest, VercelResponse } from '@vercel/node';
import { pool } from '../db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM users');
    res.status(200).json({ status: 'ok', users: result.rows[0].count, db: 'connected' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ status: 'error', message, db: 'disconnected' });
  }
}
