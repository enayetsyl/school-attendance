// src/interfaces/attendance.interface.ts
import { Document, Types } from 'mongoose';

export interface IAttendanceRecord extends Document {
  student: Types.ObjectId;  // reference to Student._id
  date: Date;               // the day of the attendance
  lateEntry?: string;       // minutes late (optional)
  earlyLeave?: string;      // minutes left early (optional)
  present: boolean;            // explicitly marked present
  absent: boolean;          // true if absent
  comment?: string;         // any operator notes
  createdAt: Date;          // from mongoose timestamps
  updatedAt: Date;          // from mongoose timestamps
}
