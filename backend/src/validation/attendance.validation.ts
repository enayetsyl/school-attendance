// src/validation/attendance.validation.ts
import { z } from 'zod';

// accept Date or ISO‐string → always transform to JS Date
const dateOrString = z
  .union([ z.string(), z.date() ])
  .transform((v) => (v instanceof Date ? v : new Date(v)));

  const timeString = z
  .preprocess(
    val => (val === '' ? undefined : val),
    z.string().regex(
      /^([01]?\d|2[0-3]):[0-5]\d$/,
      'Invalid time format, expected "HH:mm"'
    )
  )
  .optional();


export const getAttendanceByDateSchema = z.object({
    query: z.object({
      // leave it as string, just validate format
      date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, expected YYYY‑MM‑DD'),
    }),
  });

export const getAttendanceSchema = z.object({
  query: z.object({
    date: dateOrString,
  }),
});

export const createAttendanceSchema = z.object({
  body: z.object({
    date: dateOrString,
    entries: z
      .array(
        z.object({
          student: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID'),
          absent: z.boolean(),
          lateEntry: timeString.optional(),
          earlyLeave: timeString.optional(),
          comment: z.string().optional(),
        })
      )
      .nonempty({ message: 'At least one entry is required' }),
  }),
});

// src/validation/attendance.validation.ts

export const updateAttendanceSchema = z.object({
  params: z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID') }),
  body: z
    .object({
      present:    z.boolean(),
      absent:     z.boolean(),
      lateEntry:  timeString,
      earlyLeave: timeString,
      comment:    z.string(),
    })
    .partial()            // <-- makes *all* of those keys optional
    .optional(),          // <-- allows the `body` property itself to be missing
});


