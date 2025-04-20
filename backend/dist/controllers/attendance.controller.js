"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAttendance = exports.createAttendance = exports.getAttendanceByDate = void 0;
const attendance_model_1 = require("../models/attendance.model");
const asyncHandler_1 = require("../middleware/asyncHandler");
const sendResponse_1 = require("../utils/sendResponse");
// GET /attendance?date=...
exports.getAttendanceByDate = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // 1) Extract the raw value
    const raw = req.query.date;
    // 2) If Express parsed it as an array, grab the first item
    const dateStr = Array.isArray(raw) ? raw[0] : raw;
    if (typeof dateStr !== 'string') {
        (0, sendResponse_1.sendResponse)({
            res,
            statusCode: 400,
            success: false,
            message: 'Missing or invalid `date` query parameter',
        });
        return;
    }
    // 3) Parse into a Date
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        (0, sendResponse_1.sendResponse)({
            res,
            statusCode: 400,
            success: false,
            message: 'Invalid date format, expected YYYY‑MM‑DD',
        });
        return;
    }
    // 4) Fetch your attendance entries
    const entries = await attendance_model_1.Attendance.find({ date }).populate('student', 'name currentClass currentSection');
    // 5) Send them back
    (0, sendResponse_1.sendResponse)({ res, data: entries });
    // ← no `return sendResponse(...)`, just `sendResponse(...)` and exit
});
// POST /attendance
exports.createAttendance = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { date, entries } = req.body;
    const saved = [];
    for (const e of entries) {
        const doc = await attendance_model_1.Attendance.findOneAndUpdate({ student: e.student, date }, {
            $set: {
                present: e.present,
                absent: e.absent,
                lateEntry: e.lateEntry,
                earlyLeave: e.earlyLeave,
                comment: e.comment,
                entryTimestamp: new Date(),
            },
        }, { upsert: true, new: true });
        saved.push(doc);
    }
    (0, sendResponse_1.sendResponse)({ res, data: saved });
});
// PUT /attendance/:id
exports.updateAttendance = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const updated = await attendance_model_1.Attendance.findByIdAndUpdate(id, {
        $set: {
            present: req.body.present,
            absent: req.body.absent,
            lateEntry: req.body.lateEntry,
            earlyLeave: req.body.earlyLeave,
            comment: req.body.comment,
        },
    }, { new: true });
    if (!updated) {
        (0, sendResponse_1.sendResponse)({ res, statusCode: 404, success: false, message: 'Attendance not found' });
        return;
    }
    (0, sendResponse_1.sendResponse)({ res, data: updated });
});
