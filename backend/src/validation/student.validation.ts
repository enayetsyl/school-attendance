// src/validation/student.validation.ts
import { z } from 'zod';

// —————————————————————————————————————————————
// 1) Helpers
// —————————————————————————————————————————————

// Turn "", null, or undefined → undefined; else try JS Date
const optionalDate = z.preprocess((val) => {
  if (val === '' || val == null) return undefined;
  if (val instanceof Date) return val;
  if (typeof val === 'string') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? val : d;
  }
  return val;
}, z.date().optional());

// Turn "Nursery" → -1, "KG" → 0, "1","2",… → numbers, else pass through
const toClassInt = z.preprocess((val) => {
  if (typeof val === 'string') {
    const s = val.trim();
    if (s === 'Nursery') return -1;
    if (s === 'KG') return 0;
    const n = parseInt(s, 10);
    return isNaN(n) ? val : n;
  }
  return val;
}, z.number().int().min(-1, { message: 'Invalid class' }));

// —————————————————————————————————————————————
// 2) Schemas
// —————————————————————————————————————————————

export const createStudentSchema = z.object({
  body: z.object({
    name:             z.string().min(1),
    enrollmentNumber: z.string().min(1),
    dateOfBirth:      optionalDate,
    gender:           z.enum(['M', 'F']).optional(),

    contactInfo: z
      .object({
        fatherName:      z.string().optional(),
        motherName:      z.string().optional(),
        fatherPhone:     z.string().optional(),
        motherPhone:     z.string().optional(),
        email:           z.string().email().optional(),
        presentAddress:  z.string().optional(),
        permanentAddress:z.string().optional(),
      })
      .optional(),

    admissionDate: optionalDate,
    graduationDate: optionalDate,

    // now accepts -1 (Nursery), 0 (KG), or 1…12
    currentClass: toClassInt,
    currentSection: z.string().optional(),

    status: z.enum(['active', 'inactive']).default('active'),

    classHistory: z
      .array(
        z.object({
          academicYear: z.string(),
          // classLevel same mapping
          classLevel:   toClassInt,
          section:      z.string().optional(),
          startDate:    optionalDate,
          endDate:      optionalDate,
        })
      )
      .optional(),
  }),
});

export const getStudentsSchema = z.object({
  query: z.object({
    class: z
      .string()
      .optional()
      .transform((s) => (s ? parseInt(s, 10) : undefined)),
    section: z.string().optional(),
  }),
});

export const getStudentSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID'),
  }),
});

export const updateStudentSchema = z
  .object({
    params: z.object({
      id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID'),
    }),
    body: z
      .object({
        name:             z.string().min(1).optional(),
        enrollmentNumber: z.string().min(1).optional(),
        dateOfBirth:      optionalDate.optional(),
        gender:           z.enum(['M', 'F']).optional(),

        contactInfo: z
          .object({
            fatherName:      z.string().optional(),
            motherName:      z.string().optional(),
            fatherPhone:     z.string().optional(),
            motherPhone:     z.string().optional(),
            email:           z.string().email().optional(),
            presentAddress:  z.string().optional(),
            permanentAddress:z.string().optional(),
          })
          .optional(),

        admissionDate:   optionalDate.optional(),
        graduationDate:  optionalDate.optional(),

        currentClass:    toClassInt.optional(),
        currentSection:  z.string().optional(),

        status:          z.enum(['active','inactive']).optional(),

        classHistory: z
          .array(
            z.object({
              academicYear: z.string(),
              classLevel:   toClassInt,
              section:      z.string().optional(),
              startDate:    optionalDate,
              endDate:      optionalDate,
            })
          )
          .optional(),
      })
      .partial(),
  })
  

export const deleteStudentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID'),
  }),
});
