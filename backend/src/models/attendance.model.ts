import mongoose, { Schema, Model } from 'mongoose';
import { IAttendanceRecord } from '../interface/attendance.interface';

const AttendanceSchema = new Schema<IAttendanceRecord>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    lateEntry: {
      type: String, 
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid time format, expected "HH:mm"'],
      default: undefined,
    },
    earlyLeave: {
      type: String,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid time format, expected "HH:mm"'],
      default: undefined,
    },
    absent: {
      type: Boolean,
      required: true,
      default: false,
    },
    present: {
      type: Boolean,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one record per student per date
AttendanceSchema.index({ student: 1, date: 1 }, { unique: true });

export const Attendance: Model<IAttendanceRecord> =
  mongoose.model<IAttendanceRecord>('Attendance', AttendanceSchema);
