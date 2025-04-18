// src/routes/student.routes.ts
import { Router } from 'express';
import { authenticate } from '../../middleware/authToken';
import { authorize } from '../../middleware/authorizeRole';
import { validateRequest } from '../../middleware/validateRequest';

import {
  createStudentSchema,
  getStudentsSchema,
  updateStudentSchema,
  deleteStudentSchema,
  getStudentSchema,
} from '../../validation/student.validation';

import {
  createStudent,
  getStudents,
  updateStudent,
  deleteStudent,
  getStudent,
} from '../../controllers/student.controller';
import { Role } from '../../constant/roles';


const router = Router();

router.use(authenticate);

router
  .route('/')
  .post(
    authorize(Role.Admin, Role.Coordinator, Role.Operator, Role.Principal),
    validateRequest(createStudentSchema),
    createStudent
  )
  .get(
    authorize(
      Role.Admin,
      Role.Coordinator,
      Role.Operator,
      Role.Principal,
    ),
    validateRequest(getStudentsSchema),
    getStudents
  );

router
  .route('/:id')
  .get(authorize(Role.Admin, Role.Coordinator, Role.Operator, Role.Principal), validateRequest(getStudentSchema), getStudent)
  .put(
    authorize(Role.Admin, Role.Coordinator,Role.Operator, Role.Principal),
    validateRequest(updateStudentSchema),
    updateStudent
  )
  .delete(
    authorize(Role.Admin, Role.Principal, Role.Coordinator),
    validateRequest(deleteStudentSchema),
    deleteStudent
  );

export default router;
