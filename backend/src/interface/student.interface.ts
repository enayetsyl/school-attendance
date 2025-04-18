// src/models/student.interface.ts
import { Document } from 'mongoose';

export interface IClassHistory {
  academicYear: string;      // e.g. "2024-2025"
  classLevel: string;        // numeric class (e.g. 3)
  section?: string;          // optional (e.g. "A")
  startDate: Date;           // when they entered this class
  endDate?: Date;            // when they left (optional)
}

export interface IContactInfo {
  fatherName?: string;
  motherName?: string;
  fatherPhone?: string;
  motherPhone?: string;
  email?: string;
  presentAddress?: string;
  permanentAddress?: string;
}

export interface IStudent extends Document {
  name: string;
  enrollmentNumber: string;
  dateOfBirth?: Date;
  gender?: 'M' | 'F';

  contactInfo: IContactInfo;

  admissionDate: Date;
  graduationDate?: Date;

  currentClass: number;
  currentSection?: string;

  status: 'active' | 'inactive';

  classHistory: IClassHistory[];

  // mongoose timestamps
  createdAt: Date;
  updatedAt: Date;
}
