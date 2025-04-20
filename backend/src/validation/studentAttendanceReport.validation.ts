// src/validation/report.validation.ts
import { z } from 'zod';

// reuse your dateOrString helper from attendance.validation.ts
const dateOrString = z
  .union([ z.string(), z.date() ])
  .transform((v) => (v instanceof Date ? v : new Date(v)));

export const baseReportSchema = z.object({
  query: z.object({
    period: z.enum(['day', 'week', 'month', 'year']),
    startDate: dateOrString.optional(),
    endDate: dateOrString.optional(),
    // for class & section reports
    class: z
      .string()
      .optional()
      .transform(s => (s ? parseInt(s, 10) : undefined)),
    section: z.string().optional(),
  })
});

export const studentReportSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID'),
  }),
  query: baseReportSchema.shape.query
});
