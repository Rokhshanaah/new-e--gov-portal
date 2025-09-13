import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth.js';
import deptRoutes from './routes/departments.js';
import serviceRoutes from './routes/services.js';
import requestRoutes from './routes/requests.js';
import reportRoutes from './routes/reports.js';

const app = express();
app.use(helmet());
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

app.get('/', (req, res) => res.json({ ok: true, service: 'egov-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/departments', deptRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/reports', reportRoutes);

const port = process.env.BACKEND_PORT || process.env.PORT || 5000;
app.listen(port, () => console.log('Backend running on port', port));
