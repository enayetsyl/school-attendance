// src/controllers/attendance.controller.ts
import { RequestHandler } from 'express';
import { Attendance } from '../models/attendance.model';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendResponse } from '../utils/sendResponse';

// GET /attendance?date=...
export const getAttendanceByDate: RequestHandler<
  {},             // no URL params
  any,            // response body
  any,            // request body
  { date: string } // req.query has a `date: string`
> = asyncHandler(async (req, res) => {
  // 1) Extract the raw value
  const raw = req.query.date;
  // 2) If Express parsed it as an array, grab the first item
  const dateStr = Array.isArray(raw) ? raw[0] : raw;
  if (typeof dateStr !== 'string') {
    sendResponse({
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
    sendResponse({
      res,
      statusCode: 400,
      success: false,
      message: 'Invalid date format, expected YYYY‑MM‑DD',
    });
    return;
  }

  // 4) Fetch your attendance entries
  const entries = await Attendance.find({ date }).populate(
    'student',
    'name currentClass currentSection'
  );

  // 5) Send them back
  sendResponse({ res, data: entries });
  // ← no `return sendResponse(...)`, just `sendResponse(...)` and exit
});

// POST /attendance
export const createAttendance: RequestHandler = asyncHandler(async (req, res) => {
  const { date, entries } = req.body as { date: Date; entries: any[] };
  const saved: any[] = [];
  for (const e of entries) {
    const doc = await Attendance.findOneAndUpdate(
      { student: e.student, date },
      {
        $set: {
          present:      e.present,
          absent:       e.absent,
          lateEntry:    e.lateEntry,
          earlyLeave:   e.earlyLeave,
          comment:      e.comment,
          entryTimestamp: new Date(),
        },
      },
      { upsert: true, new: true }
    );
    saved.push(doc);
  }
  sendResponse({ res, data: saved });
});

// PUT /attendance/:id
export const updateAttendance: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await Attendance.findByIdAndUpdate(
    id,
    {
      $set: {
        present:    req.body.present,
        absent:     req.body.absent,
        lateEntry:  req.body.lateEntry,
        earlyLeave: req.body.earlyLeave,
        comment:    req.body.comment,
      },
    },
    { new: true }
  );
  if (!updated) {
    sendResponse({ res, statusCode: 404, success: false, message: 'Attendance not found' });
    return;
  }
  sendResponse({ res, data: updated });
});
