"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/attendance.routes.ts
const express_1 = require("express");
const authToken_1 = require("../../middleware/authToken");
const authorizeRole_1 = require("../../middleware/authorizeRole");
const validateRequest_1 = require("../../middleware/validateRequest");
const attendance_validation_1 = require("../../validation/attendance.validation");
const attendance_controller_1 = require("../../controllers/attendance.controller");
const roles_1 = require("../../constant/roles");
const router = (0, express_1.Router)();
router.use(authToken_1.authenticate);
const roles = [
    roles_1.Role.Admin,
    roles_1.Role.Coordinator,
    roles_1.Role.Operator,
    roles_1.Role.Teacher,
    roles_1.Role.Principal,
];
router
    .route('/')
    .get((0, authorizeRole_1.authorize)(...roles), (0, validateRequest_1.validateRequest)(attendance_validation_1.getAttendanceSchema), attendance_controller_1.getAttendanceByDate)
    .post((0, authorizeRole_1.authorize)(...roles), (0, validateRequest_1.validateRequest)(attendance_validation_1.createAttendanceSchema), attendance_controller_1.createAttendance);
router
    .route('/:id')
    .put((0, authorizeRole_1.authorize)(...roles), (0, validateRequest_1.validateRequest)(attendance_validation_1.updateAttendanceSchema), attendance_controller_1.updateAttendance);
exports.default = router;
