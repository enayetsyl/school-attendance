"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStudentSchema = exports.updateStudentSchema = exports.getStudentSchema = exports.getStudentsSchema = exports.createStudentSchema = void 0;
// src/validation/student.validation.ts
const zod_1 = require("zod");
// —————————————————————————————————————————————
// 1) Helpers
// —————————————————————————————————————————————
// Turn "", null, or undefined → undefined; else try JS Date
const optionalDate = zod_1.z.preprocess((val) => {
    if (val === '' || val == null)
        return undefined;
    if (val instanceof Date)
        return val;
    if (typeof val === 'string') {
        const d = new Date(val);
        return isNaN(d.getTime()) ? val : d;
    }
    return val;
}, zod_1.z.date().optional());
// Turn "Nursery" → -1, "KG" → 0, "1","2",… → numbers, else pass through
const toClassInt = zod_1.z.preprocess((val) => {
    if (typeof val === 'string') {
        const s = val.trim();
        if (s === 'Nursery')
            return -1;
        if (s === 'KG')
            return 0;
        const n = parseInt(s, 10);
        return isNaN(n) ? val : n;
    }
    return val;
}, zod_1.z.number().int().min(-1, { message: 'Invalid class' }));
// —————————————————————————————————————————————
// 2) Schemas
// —————————————————————————————————————————————
exports.createStudentSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1),
        enrollmentNumber: zod_1.z.string().min(1),
        dateOfBirth: optionalDate,
        gender: zod_1.z.enum(['M', 'F']).optional(),
        contactInfo: zod_1.z
            .object({
            fatherName: zod_1.z.string().optional(),
            motherName: zod_1.z.string().optional(),
            fatherPhone: zod_1.z.string().optional(),
            motherPhone: zod_1.z.string().optional(),
            email: zod_1.z.string().email().optional(),
            presentAddress: zod_1.z.string().optional(),
            permanentAddress: zod_1.z.string().optional(),
        })
            .optional(),
        admissionDate: optionalDate,
        graduationDate: optionalDate,
        // now accepts -1 (Nursery), 0 (KG), or 1…12
        currentClass: toClassInt,
        currentSection: zod_1.z.string().optional(),
        status: zod_1.z.enum(['active', 'inactive']).default('active'),
        classHistory: zod_1.z
            .array(zod_1.z.object({
            academicYear: zod_1.z.string(),
            // classLevel same mapping
            classLevel: toClassInt,
            section: zod_1.z.string().optional(),
            startDate: optionalDate,
            endDate: optionalDate,
        }))
            .optional(),
    }),
});
exports.getStudentsSchema = zod_1.z.object({
    query: zod_1.z.object({
        class: zod_1.z
            .string()
            .optional()
            .transform((s) => (s ? parseInt(s, 10) : undefined)),
        section: zod_1.z.string().optional(),
    }),
});
exports.getStudentSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z
            .string()
            .regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID'),
    }),
});
exports.updateStudentSchema = zod_1.z
    .object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID'),
    }),
    body: zod_1.z
        .object({
        name: zod_1.z.string().min(1).optional(),
        enrollmentNumber: zod_1.z.string().min(1).optional(),
        dateOfBirth: optionalDate.optional(),
        gender: zod_1.z.enum(['M', 'F']).optional(),
        contactInfo: zod_1.z
            .object({
            fatherName: zod_1.z.string().optional(),
            motherName: zod_1.z.string().optional(),
            fatherPhone: zod_1.z.string().optional(),
            motherPhone: zod_1.z.string().optional(),
            email: zod_1.z.string().email().optional(),
            presentAddress: zod_1.z.string().optional(),
            permanentAddress: zod_1.z.string().optional(),
        })
            .optional(),
        admissionDate: optionalDate.optional(),
        graduationDate: optionalDate.optional(),
        currentClass: toClassInt.optional(),
        currentSection: zod_1.z.string().optional(),
        status: zod_1.z.enum(['active', 'inactive']).optional(),
        classHistory: zod_1.z
            .array(zod_1.z.object({
            academicYear: zod_1.z.string(),
            classLevel: toClassInt,
            section: zod_1.z.string().optional(),
            startDate: optionalDate,
            endDate: optionalDate,
        }))
            .optional(),
    })
        .partial(),
});
exports.deleteStudentSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID'),
    }),
});
