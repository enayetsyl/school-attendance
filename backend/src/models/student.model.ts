// src/models/student.model.ts
import mongoose, { Model, Schema } from 'mongoose';
import { IClassHistory, IStudent } from '../interface/student.interface';

const ClassHistorySchema = new Schema<IClassHistory>(
  {
    academicYear:   { type: String, required: true },
    classLevel:     { type: String, required: true },
    section:        String,
    startDate:      { type: Date,   required: true },
    endDate:        Date,
  },
  { _id: false }
);

const StudentSchema = new Schema<IStudent>(
  {
    name:             { type: String, required: true },
    enrollmentNumber: { type: String, required: true, unique: true },

    dateOfBirth: Date,
    gender:      { type: String, enum: ['M', 'F'] },

    contactInfo: {
      fatherName:   String,
      motherName:   String,
      fatherPhone:  String,
      motherPhone:  String,
      email:        String,
      presentAddress:  String,
      permanentAddress: String,
    },

    admissionDate:  { type: Date, required: true },
    graduationDate: Date,

    currentClass:   { type: Number, required: true },
    currentSection: String,

    status:         { type: String, enum: ['active','inactive'], default: 'active' },

    classHistory:   { type: [ClassHistorySchema], default: [] },
  },
  { timestamps: true }
);

export const Student: Model<IStudent> = mongoose.model<IStudent>(
  'Student',
  StudentSchema
);
