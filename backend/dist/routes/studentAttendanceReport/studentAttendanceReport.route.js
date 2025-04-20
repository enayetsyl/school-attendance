"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/report.routes.ts
const express_1 = require("express");
const studentAttendanceReport_validation_1 = require("../../validation/studentAttendanceReport.validation");
const studentAttendanceReport_controller_1 = require("../../controllers/studentAttendanceReport.controller");
const authToken_1 = require("../../middleware/authToken");
const authorizeRole_1 = require("../../middleware/authorizeRole");
const validateRequest_1 = require("../../middleware/validateRequest");
const roles_1 = require("../../constant/roles");
const router = (0, express_1.Router)();
router.use(authToken_1.authenticate);
// School‑wide attendance
router.get('/school', (0, authorizeRole_1.authorize)(roles_1.Role.Admin, roles_1.Role.Coordinator, roles_1.Role.Principal), (0, validateRequest_1.validateRequest)(studentAttendanceReport_validation_1.baseReportSchema), studentAttendanceReport_controller_1.getSchoolReport);
// Class‑wise attendance
router.get('/class', (0, authorizeRole_1.authorize)(roles_1.Role.Admin, roles_1.Role.Coordinator, roles_1.Role.Principal), (0, validateRequest_1.validateRequest)(studentAttendanceReport_validation_1.baseReportSchema), studentAttendanceReport_controller_1.getClassReport);
// Section‑wise attendance
router.get('/section', (0, authorizeRole_1.authorize)(roles_1.Role.Admin, roles_1.Role.Coordinator, roles_1.Role.Principal), (0, validateRequest_1.validateRequest)(studentAttendanceReport_validation_1.baseReportSchema), studentAttendanceReport_controller_1.getSectionReport);
// Student‑specific (guardians + staff)
router.get('/student/:id', (0, authorizeRole_1.authorize)(roles_1.Role.Admin, roles_1.Role.Coordinator, roles_1.Role.Principal), (0, validateRequest_1.validateRequest)(studentAttendanceReport_validation_1.studentReportSchema), studentAttendanceReport_controller_1.getStudentReport);
exports.default = router;
