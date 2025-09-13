import { Router } from 'express';
import { query } from '../db.js';
import { authRequired, allowRoles } from '../middleware/auth.js';
const router = Router();
router.get('/', authRequired, async (req,res)=>{ const r=await query(`SELECT s.*, d.name as department_name FROM services s JOIN departments d ON d.id=s.department_id ORDER BY d.name, s.name`); res.json(r.rows); });
router.post('/', authRequired, allowRoles('admin','deptHead'), async (req,res)=>{ const { name,department_id,fee=0 }=req.body; const r=await query(`INSERT INTO services(name,department_id,fee) VALUES($1,$2,$3) RETURNING *`,[name,department_id,fee]); res.json(r.rows[0]); });
export default router;
