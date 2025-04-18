"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/index.ts
const express_1 = require("express");
// import each feature router
// import authRoutes from './auth';
// import studentRoutes from './students';
const attendanceRoute_1 = __importDefault(require("./attendance/attendanceRoute"));
const student_routes_1 = __importDefault(require("./student/student.routes"));
// import reportRoutes from './reports';
const router = (0, express_1.Router)();
// define a small config for looping
const featureRouters = [
    // { path: '/auth', handler: authRoutes },
    // { path: '/students', handler: studentRoutes },
    // { path: '/reports', handler: reportRoutes },
    { path: '/attendance', handler: attendanceRoute_1.default },
    { path: '/students', handler: student_routes_1.default },
];
// mount each feature under its path
featureRouters.forEach(({ path, handler }) => {
    router.use(path, handler);
});
// health check
router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});
exports.default = router;
