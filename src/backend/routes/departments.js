import { Router } from 'express';
import { query } from '../db.js';
import { authRequired, allowRoles } from '../middleware/auth.js';
const router = Router();
router.get('/', authRequired, async (req,res)=>{ const r=await query('SELECT * FROM departments ORDER BY name'); res.json(r.rows); });
router.post('/', authRequired, allowRoles('admin'), async (req,res)=>{ const { name }=req.body; const r=await query('INSERT INTO departments(name) VALUES($1) RETURNING *',[name]); res.json(r.rows[0]); });
export default router;
