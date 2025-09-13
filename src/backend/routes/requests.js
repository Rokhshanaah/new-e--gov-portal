import { Router } from 'express';
import { query } from '../db.js';
import { authRequired, allowRoles } from '../middleware/auth.js';
const router = Router();
router.post('/', authRequired, async (req,res)=>{ const { service_id, details }=req.body; const r=await query(`INSERT INTO requests(citizen_id, service_id, status, details) VALUES($1,$2,'submitted',$3) RETURNING *`,[req.user.id, service_id, details||'']); res.json(r.rows[0]); });
router.get('/', authRequired, async (req,res)=>{ const { role, department_id, id }=req.user; if(role==='citizen'){ const r=await query(`SELECT r.*, s.name as service_name FROM requests r JOIN services s ON s.id=r.service_id WHERE r.citizen_id=$1 ORDER BY r.created_at DESC`,[id]); return res.json(r.rows);} if(role==='officer'||role==='deptHead'){ const r=await query(`SELECT r.*, s.name as service_name, u.name as citizen_name FROM requests r JOIN services s ON s.id=r.service_id JOIN users u ON u.id=r.citizen_id WHERE s.department_id=$1 ORDER BY r.created_at DESC`,[department_id]); return res.json(r.rows);} const r=await query(`SELECT r.*, s.name as service_name, u.name as citizen_name FROM requests r JOIN services s ON s.id=r.service_id JOIN users u ON u.id=r.citizen_id ORDER BY r.created_at DESC`); res.json(r.rows); });
router.patch('/:id/status', authRequired, allowRoles('officer','deptHead','admin'), async (req,res)=>{ const { status }=req.body; const r=await query(`UPDATE requests SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,[status, req.params.id]); res.json(r.rows[0]); });
export default router;
