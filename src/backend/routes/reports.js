import { Router } from 'express';
import { query } from '../db.js';
import { authRequired, allowRoles } from '../middleware/auth.js';
const router = Router();
router.get('/summary', authRequired, allowRoles('admin'), async (req,res)=>{ const dept=await query(`SELECT d.id, d.name, COUNT(r.*) as total_requests, SUM(CASE WHEN r.status='approved' THEN 1 ELSE 0 END) as approved, SUM(CASE WHEN r.status='rejected' THEN 1 ELSE 0 END) as rejected, COALESCE(SUM(s.fee),0) as total_fees FROM departments d LEFT JOIN services s ON s.department_id=d.id LEFT JOIN requests r ON r.service_id=s.id GROUP BY d.id ORDER BY d.name`); res.json(dept.rows); });
export default router;
