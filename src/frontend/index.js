import express from 'express';
import session from 'express-session';
import morgan from 'morgan';
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: process.env.SESSION_SECRET || 'secret', resave: false, saveUninitialized: false }));

const api = axios.create({ baseURL: process.env.BACKEND_URL || 'http://localhost:5000' });

function auth(req, res, next) {
  if (!req.session.token) return res.redirect('/login');
  next();
}

app.get('/', (req, res) => res.redirect('/dashboard'));
app.get('/login', (req, res) => res.render('login', { error: null }));
app.post('/login', async (req, res) => {
  try {
    const { data } = await api.post('/api/auth/login', { email: req.body.email, password: req.body.password });
    req.session.token = data.token;
    req.session.user = data.user;
    res.redirect('/dashboard');
  } catch {
    res.render('login', { error: 'Invalid credentials' });
  }
});

app.get('/register', (req, res) => res.render('register', { error: null }));
app.post('/register', async (req, res) => {
  try {
    await api.post('/api/auth/register', {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    });
    res.redirect('/login');
  } catch (e) {
    const msg = e.response?.data?.error || e.message || 'Registration failed';
    res.render('register', { error: msg });
  }
});

app.get('/logout', (req, res) => { req.session.destroy(() => res.redirect('/login')); });

app.get('/dashboard', auth, async (req, res) => {
  const user = req.session.user;
  const token = req.session.token;
  const headers = { Authorization: 'Bearer ' + token };
  if (user.role === 'citizen') {
    const { data: services } = await api.get('/api/services', { headers });
    const { data: requests } = await api.get('/api/requests', { headers });
    return res.render('citizen/dashboard', { user, services, requests });
  }
  if (user.role === 'officer' || user.role === 'deptHead') {
    const { data: requests } = await api.get('/api/requests', { headers });
    return res.render('officer/dashboard', { user, requests });
  }
  const { data: summary } = await api.get('/api/reports/summary', { headers });
  return res.render('admin/dashboard', { user, summary });
});

app.post('/citizen/apply', auth, async (req, res) => {
  const headers = { Authorization: 'Bearer ' + req.session.token };
  await api.post('/api/requests', { service_id: req.body.service_id, details: req.body.details }, { headers });
  res.redirect('/dashboard');
});

app.post('/officer/requests/:id/status', auth, async (req, res) => {
  const headers = { Authorization: 'Bearer ' + req.session.token };
  await api.patch('/api/requests/' + req.params.id + '/status', { status: req.body.status }, { headers });
  res.redirect('/dashboard');
});

const port = process.env.FRONTEND_PORT || 3000;
app.listen(port, () => console.log('Frontend running on', port));
