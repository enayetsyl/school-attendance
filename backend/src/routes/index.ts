// src/routes/index.ts
import { Router } from 'express';

// import each feature router
// import authRoutes from './auth';
// import studentRoutes from './students';
import attendanceRoutes from './attendance/attendanceRoute';
import studentRoutes from './student/student.routes';
// import reportRoutes from './reports';

const router = Router();

// define a small config for looping
const featureRouters: Array<{ path: string; handler: Router }> = [
  // { path: '/auth', handler: authRoutes },
  // { path: '/students', handler: studentRoutes },
  // { path: '/reports', handler: reportRoutes },
  { path: '/attendance', handler: attendanceRoutes },
  { path: '/students', handler: studentRoutes },
];

// mount each feature under its path
featureRouters.forEach(({ path, handler }) => {
  router.use(path, handler);
});

// health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default router;
