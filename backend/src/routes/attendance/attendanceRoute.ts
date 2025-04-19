// src/routes/attendance.routes.ts
import { Router } from 'express';
import { authenticate } from '../../middleware/authToken';
import { authorize } from '../../middleware/authorizeRole';
import { validateRequest } from '../../middleware/validateRequest';

import {
  getAttendanceSchema,
  createAttendanceSchema,
  updateAttendanceSchema,
} from '../../validation/attendance.validation';

import {
  getAttendanceByDate,
  updateAttendance,
  createAttendance,
} from '../../controllers/attendance.controller';

import { Role } from '../../constant/roles';

const router = Router();
router.use(authenticate);

const roles = [
  Role.Admin,
  Role.Coordinator,
  Role.Operator,
  Role.Teacher,
  Role.Principal,
];

router
  .route('/')
  .get(
    authorize(...roles),
    validateRequest(getAttendanceSchema),
    getAttendanceByDate
  )
  .post(
    authorize(...roles),
    validateRequest(createAttendanceSchema),
    createAttendance
  );

router
  .route('/:id')
  .put(
    authorize(...roles),
    validateRequest(updateAttendanceSchema),
    updateAttendance
  );

export default router;
