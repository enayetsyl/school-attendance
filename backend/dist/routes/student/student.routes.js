"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/student.routes.ts
const express_1 = require("express");
const authToken_1 = require("../../middleware/authToken");
const authorizeRole_1 = require("../../middleware/authorizeRole");
const validateRequest_1 = require("../../middleware/validateRequest");
const student_validation_1 = require("../../validation/student.validation");
const student_controller_1 = require("../../controllers/student.controller");
const roles_1 = require("../../constant/roles");
const router = (0, express_1.Router)();
router.use(authToken_1.authenticate);
router
    .route('/')
    .post((0, authorizeRole_1.authorize)(roles_1.Role.Admin, roles_1.Role.Coordinator, roles_1.Role.Operator, roles_1.Role.Principal), (0, validateRequest_1.validateRequest)(student_validation_1.createStudentSchema), student_controller_1.createStudent)
    .get((0, authorizeRole_1.authorize)(roles_1.Role.Admin, roles_1.Role.Coordinator, roles_1.Role.Operator, roles_1.Role.Principal), (0, validateRequest_1.validateRequest)(student_validation_1.getStudentsSchema), student_controller_1.getStudents);
router
    .route('/:id')
    .get((0, authorizeRole_1.authorize)(roles_1.Role.Admin, roles_1.Role.Coordinator, roles_1.Role.Operator, roles_1.Role.Principal), (0, validateRequest_1.validateRequest)(student_validation_1.getStudentSchema), student_controller_1.getStudent)
    .put((0, authorizeRole_1.authorize)(roles_1.Role.Admin, roles_1.Role.Coordinator, roles_1.Role.Operator, roles_1.Role.Principal), (0, validateRequest_1.validateRequest)(student_validation_1.updateStudentSchema), student_controller_1.updateStudent)
    .delete((0, authorizeRole_1.authorize)(roles_1.Role.Admin, roles_1.Role.Principal, roles_1.Role.Coordinator), (0, validateRequest_1.validateRequest)(student_validation_1.deleteStudentSchema), student_controller_1.deleteStudent);
exports.default = router;
