"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStudent = exports.updateStudent = exports.getStudent = exports.getStudents = exports.createStudent = void 0;
const student_model_1 = require("../models/student.model");
const asyncHandler_1 = require("../middleware/asyncHandler");
const sendResponse_1 = require("../utils/sendResponse");
exports.createStudent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const student = await student_model_1.Student.create(req.body);
    (0, sendResponse_1.sendResponse)({ res, statusCode: 201, message: 'Student created', data: student });
});
exports.getStudents = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // 1) parse paging params
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    // 2) build filter
    const filter = { status: 'active' };
    if (req.query.class)
        filter.currentClass = Number(req.query.class);
    if (req.query.section)
        filter.currentSection = req.query.section;
    // 3) fetch both the slice and the total count
    const [items, total] = await Promise.all([
        student_model_1.Student.find(filter)
            .sort({ name: 1 })
            .skip(skip)
            .limit(limit),
        student_model_1.Student.countDocuments(filter),
    ]);
    // 4) send back items + meta
    (0, sendResponse_1.sendResponse)({
        res,
        data: items,
        meta: { page, pageSize: limit, total },
    });
});
exports.getStudent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const student = await student_model_1.Student.findById(req.params.id);
    if (!student) {
        (0, sendResponse_1.sendResponse)({
            res,
            statusCode: 404,
            success: false,
            message: 'Student not found',
        });
        return;
    }
    if (student.status === 'inactive') {
        (0, sendResponse_1.sendResponse)({
            res,
            statusCode: 404,
            success: false,
            message: 'Student is inactive',
        });
        return;
    }
    (0, sendResponse_1.sendResponse)({ res, data: student });
});
exports.updateStudent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const existing = await student_model_1.Student.findById(req.params.id);
    if (!existing || existing.status === 'inactive') {
        (0, sendResponse_1.sendResponse)({
            res,
            statusCode: 404,
            success: false,
            message: 'Student not found or inactive',
        });
        return;
    }
    const updated = await student_model_1.Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    (0, sendResponse_1.sendResponse)({ res, message: 'Student updated', data: updated });
});
exports.deleteStudent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const existing = await student_model_1.Student.findById(req.params.id);
    if (!existing || existing.status === 'inactive') {
        (0, sendResponse_1.sendResponse)({
            res,
            statusCode: 404,
            success: false,
            message: 'Student not found or already inactive',
        });
        return;
    }
    await student_model_1.Student.findByIdAndUpdate(req.params.id, { status: 'inactive' }, { new: true });
    (0, sendResponse_1.sendResponse)({ res, message: 'Student marked inactive' });
});
