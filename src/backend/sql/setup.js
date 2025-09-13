import { query } from '../db.js';
import fs from 'fs';
import path from 'path';
const schema = fs.readFileSync(path.join(process.cwd(), 'src/backend/sql/schema.sql')).toString();
async function run(){
  await query(schema);
  await query(`INSERT INTO departments(name) VALUES ('Interior'),('Commerce'),('Housing') ON CONFLICT DO NOTHING;`);
  const servicesCount = await query('SELECT COUNT(*) FROM services');
  if(Number(servicesCount.rows[0].count) === 0){
    await query(`INSERT INTO services(name, department_id, fee)
      SELECT 'Passport Renewal', d.id, 20 FROM departments d WHERE d.name='Interior';`);
    await query(`INSERT INTO services(name, department_id, fee)
      SELECT 'Business License', d.id, 50 FROM departments d WHERE d.name='Commerce';`);
  }
  console.log('Database ready.');
  process.exit(0);
}
run().catch(e=>{console.error(e); process.exit(1);});
