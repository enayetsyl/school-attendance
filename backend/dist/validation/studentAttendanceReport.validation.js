"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentReportSchema = exports.baseReportSchema = void 0;
// src/validation/report.validation.ts
const zod_1 = require("zod");
// reuse your dateOrString helper from attendance.validation.ts
const dateOrString = zod_1.z
    .union([zod_1.z.string(), zod_1.z.date()])
    .transform((v) => (v instanceof Date ? v : new Date(v)));
exports.baseReportSchema = zod_1.z.object({
    query: zod_1.z.object({
        period: zod_1.z.enum(['day', 'week', 'month', 'year']),
        startDate: dateOrString.optional(),
        endDate: dateOrString.optional(),
        // for class & section reports
        class: zod_1.z
            .string()
            .optional()
            .transform(s => (s ? parseInt(s, 10) : undefined)),
        section: zod_1.z.string().optional(),
    })
});
exports.studentReportSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID'),
    }),
    query: exports.baseReportSchema.shape.query
});
