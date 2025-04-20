// src/routes/report.routes.ts
import { Router } from 'express';
import {
  baseReportSchema,
  studentReportSchema
} from '../../validation/studentAttendanceReport.validation'
import {
  getSchoolReport,
  getClassReport,
  getSectionReport,
  getStudentReport
} from '../../controllers/studentAttendanceReport.controller'
import { authenticate } from '../../middleware/authToken';
import { authorize } from '../../middleware/authorizeRole';
import { validateRequest } from '../../middleware/validateRequest';
import { Role } from '../../constant/roles';

const router = Router();
router.use(authenticate)



// School‑wide attendance
router.get(
  '/school',
  authorize(Role.Admin,Role.Coordinator,Role.Principal),
  validateRequest(baseReportSchema),
  getSchoolReport
);

// Class‑wise attendance
router.get(
  '/class',
  authorize(Role.Admin,Role.Coordinator,Role.Principal),
  validateRequest(baseReportSchema),
  getClassReport
);

// Section‑wise attendance
router.get(
  '/section',
  authorize(Role.Admin,Role.Coordinator,Role.Principal),
  validateRequest(baseReportSchema),
  getSectionReport
);

// Student‑specific (guardians + staff)
router.get(
  '/student/:id',
  authorize(Role.Admin,Role.Coordinator,Role.Principal),
  validateRequest(studentReportSchema),
  getStudentReport
);

export default router;
