"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAttendanceSchema = exports.createAttendanceSchema = exports.getAttendanceSchema = exports.getAttendanceByDateSchema = void 0;
// src/validation/attendance.validation.ts
const zod_1 = require("zod");
// accept Date or ISO‐string → always transform to JS Date
const dateOrString = zod_1.z
    .union([zod_1.z.string(), zod_1.z.date()])
    .transform((v) => (v instanceof Date ? v : new Date(v)));
const timeString = zod_1.z
    .preprocess(val => (val === '' ? undefined : val), zod_1.z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/, 'Invalid time format, expected "HH:mm"'))
    .optional();
exports.getAttendanceByDateSchema = zod_1.z.object({
    query: zod_1.z.object({
        // leave it as string, just validate format
        date: zod_1.z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, expected YYYY‑MM‑DD'),
    }),
});
exports.getAttendanceSchema = zod_1.z.object({
    query: zod_1.z.object({
        date: dateOrString,
    }),
});
exports.createAttendanceSchema = zod_1.z.object({
    body: zod_1.z.object({
        date: dateOrString,
        entries: zod_1.z
            .array(zod_1.z.object({
            student: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID'),
            absent: zod_1.z.boolean(),
            lateEntry: timeString.optional(),
            earlyLeave: timeString.optional(),
            comment: zod_1.z.string().optional(),
        }))
            .nonempty({ message: 'At least one entry is required' }),
    }),
});
// src/validation/attendance.validation.ts
exports.updateAttendanceSchema = zod_1.z.object({
    params: zod_1.z.object({ id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID') }),
    body: zod_1.z
        .object({
        present: zod_1.z.boolean(),
        absent: zod_1.z.boolean(),
        lateEntry: timeString,
        earlyLeave: timeString,
        comment: zod_1.z.string(),
    })
        .partial() // <-- makes *all* of those keys optional
        .optional(), // <-- allows the `body` property itself to be missing
});
