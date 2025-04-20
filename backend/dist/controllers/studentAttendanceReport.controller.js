"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentReport = exports.getSectionReport = exports.getClassReport = exports.getSchoolReport = void 0;
const attendance_model_1 = require("../models/attendance.model");
const asyncHandler_1 = require("../middleware/asyncHandler");
const sendResponse_1 = require("../utils/sendResponse");
const mongoose_1 = __importDefault(require("mongoose"));
// reuse or import your groupDateFormat helper
function groupDateFormat(period) {
    switch (period) {
        case 'day':
            return { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
        case 'week':
            return { year: { $isoWeekYear: '$date' }, week: { $isoWeek: '$date' } };
        case 'month':
            return { $dateToString: { format: '%Y-%m', date: '$date' } };
        case 'year':
            return { $dateToString: { format: '%Y', date: '$date' } };
    }
}
// ─────────────────────────────────────────────────────────────────────────────
// 1) School‑wide, 2) Class‑wise, 3) Section‑wise all share the same logic
// ─────────────────────────────────────────────────────────────────────────────
const makeGenericReport = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    console.log("▶ REPORT QUERY:", req.query);
    const { period, class: cls, section } = req.query;
    const classNum = typeof cls === "string"
        ? parseInt(cls, 10) // if it somehow came through as a string
        : Number(cls);
    // 1) coerce raw query params to a single string or undefined
    const rawStartParam = Array.isArray(req.query.startDate)
        ? req.query.startDate[0]
        : req.query.startDate;
    const rawEndParam = Array.isArray(req.query.endDate)
        ? req.query.endDate[0]
        : req.query.endDate;
    // 2) narrow to string | undefined
    const rawStart = typeof rawStartParam === "string" ? rawStartParam : undefined;
    const rawEnd = typeof rawEndParam === "string" ? rawEndParam : undefined;
    // 3) now safely build Date objects
    const startDate = rawStart ? new Date(rawStart) : undefined;
    const endDate = rawEnd ? new Date(rawEnd) : undefined;
    // 4) build your match stage
    const match = {};
    if (startDate)
        match.date = { $gte: startDate };
    if (endDate)
        match.date = { ...(match.date || {}), $lte: endDate };
    const pipeline = [{ $match: match }];
    // if filtering by class/section then lookup student
    if (cls !== undefined || section) {
        pipeline.push({
            $lookup: {
                from: 'students',
                localField: 'student',
                foreignField: '_id',
                as: 'student'
            }
        }, { $unwind: '$student' });
        if (!isNaN(classNum)) {
            pipeline.push({ $match: { 'student.currentClass': classNum } });
        }
        if (section)
            pipeline.push({ $match: { 'student.currentSection': section } });
    }
    const minuteValue = {
        $toInt: { $arrayElemAt: [{ $split: ['$lateEntry', ':'] }, 1] }
    };
    pipeline.push({
        $group: {
            _id: groupDateFormat(period),
            presentCount: { $sum: { $cond: ['$present', 1, 0] } },
            absentCount: { $sum: { $cond: ['$absent', 1, 0] } },
            lateWithin5: {
                $sum: {
                    $cond: [
                        {
                            $and: [
                                { $eq: ['$present', true] },
                                { $gt: ['$lateEntry', null] },
                                { $lte: [minuteValue, 5] }
                            ]
                        },
                        1,
                        0
                    ]
                }
            },
            lateAfter5: {
                $sum: {
                    $cond: [
                        {
                            $and: [
                                { $eq: ['$present', true] },
                                { $gt: ['$lateEntry', null] },
                                { $gt: [minuteValue, 5] }
                            ]
                        },
                        1,
                        0
                    ]
                }
            },
            totalCount: { $sum: 1 }
        }
    }, {
        $project: {
            period: '$_id',
            presentCount: 1,
            absentCount: 1,
            lateWithin5: 1,
            lateAfter5: 1,
            totalCount: 1,
            attendancePct: {
                $cond: [
                    { $gt: ['$totalCount', 0] },
                    { $multiply: [{ $divide: ['$presentCount', '$totalCount'] }, 100] },
                    0
                ]
            }
        }
    }, { $sort: { period: 1 } });
    const data = await attendance_model_1.Attendance.aggregate(pipeline);
    (0, sendResponse_1.sendResponse)({ res, data });
});
exports.getSchoolReport = makeGenericReport;
exports.getClassReport = makeGenericReport;
exports.getSectionReport = makeGenericReport;
// ─────────────────────────────────────────────────────────────────────────────
// 4) Student‑specific attendance
// ─────────────────────────────────────────────────────────────────────────────
exports.getStudentReport = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    // parse dates
    const rawStartParam = Array.isArray(req.query.startDate)
        ? req.query.startDate[0]
        : req.query.startDate;
    const rawEndParam = Array.isArray(req.query.endDate)
        ? req.query.endDate[0]
        : req.query.endDate;
    const rawStart = typeof rawStartParam === 'string' ? rawStartParam : undefined;
    const rawEnd = typeof rawEndParam === 'string' ? rawEndParam : undefined;
    const startDate = rawStart ? new Date(rawStart) : undefined;
    const endDate = rawEnd ? new Date(rawEnd) : undefined;
    // base match: student + optional date range
    const match = { student: new mongoose_1.default.Types.ObjectId(id) };
    if (startDate)
        match.date = { $gte: startDate };
    if (endDate)
        match.date = { ...(match.date || {}), $lte: endDate };
    // helper: grab the minutes part (index 1)
    const minuteValue = {
        $toInt: {
            $arrayElemAt: [
                { $split: ['$lateEntry', ':'] },
                1
            ]
        }
    };
    const pipeline = [
        { $match: match },
        {
            $group: {
                _id: groupDateFormat(req.query.period || 'day'),
                presentCount: { $sum: { $cond: ['$present', 1, 0] } },
                absentCount: { $sum: { $cond: ['$absent', 1, 0] } },
                lateWithin5: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ['$present', true] },
                                    { $gt: ['$lateEntry', null] },
                                    { $lte: [minuteValue, 5] }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },
                lateAfter5: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ['$present', true] },
                                    { $gt: ['$lateEntry', null] },
                                    { $gt: [minuteValue, 5] }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },
                totalCount: { $sum: 1 }
            }
        },
        {
            $project: {
                period: '$_id',
                presentCount: 1,
                absentCount: 1,
                lateWithin5: 1,
                lateAfter5: 1,
                totalCount: 1,
                attendancePct: {
                    $cond: [
                        { $gt: ['$totalCount', 0] },
                        { $multiply: [{ $divide: ['$presentCount', '$totalCount'] }, 100] },
                        0
                    ]
                }
            }
        },
        { $sort: { period: 1 } }
    ];
    const data = await attendance_model_1.Attendance.aggregate(pipeline);
    (0, sendResponse_1.sendResponse)({ res, data });
});
