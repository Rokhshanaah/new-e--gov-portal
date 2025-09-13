import { Router } from 'express';
import { query } from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'citizen', department_id = null } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const hash = await bcrypt.hash(password, 10);
    const r = await query(
      `INSERT INTO users(name,email,password_hash,role,department_id)
       VALUES($1,$2,$3,$4,$5) RETURNING id,name,email,role,department_id`,
      [name, email, hash, role, department_id]
    );
    return res.json(r.rows[0]);
  } catch (e) {
    console.error('REGISTER ERROR:', e.code, e.detail || e.message);
    if (e.code === '23505') return res.status(400).json({ error: 'Email already exists' });
    if (e.code === '42P01') return res.status(500).json({ error: 'Users table missing. Run: npm run db:setup' });
    if (e.code === '28P01') return res.status(500).json({ error: 'DB password wrong. Fix DATABASE_URL in .env' });
    return res.status(400).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const r = await query(`SELECT * FROM users WHERE email=$1`, [email]);
    const user = r.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, department_id: user.department_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (e) {
    console.error('LOGIN ERROR:', e.code, e.detail || e.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
