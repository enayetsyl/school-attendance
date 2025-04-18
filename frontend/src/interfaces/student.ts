// types/student.ts
export interface Student {
  _id: string;
  name: string;
  enrollmentNumber: string;
  currentClass: number;
  currentSection?: string;
  admissionDate: string;
  status: 'active' | 'inactive';
  classHistory?: ClassHistory[];
}

export interface ClassHistory {
  academicYear: string;      // e.g. "2024-2025"
  classLevel: number;        // numeric class (e.g. 3), or you can map -1 → Nursery, 0 → KG
  section?: string;          // optional (e.g. "A")
  startDate: string;         // ISO date
  endDate?: string;          // ISO date
  }
  

export interface StudentDetail extends Student {
  dateOfBirth?: string;
  gender?: 'M' | 'F';
  contactInfo: {
    fatherName?: string;
    motherName?: string;
    fatherPhone?: string;
    motherPhone?: string;
    email?: string;
    presentAddress?: string;
    permanentAddress?: string;
  };
  graduationDate?: string;
}

export interface ContactInfoDTO {
  fatherName?: string;
  motherName?: string;
  fatherPhone?: string;
  motherPhone?: string;
  email?: string;
  presentAddress?: string;
  permanentAddress?: string;
}

export interface CreateStudentDTO {
  name: string;
  enrollmentNumber: string;
  dateOfBirth?: string;      // ISO date string
  gender?: 'M' | 'F';
  contactInfo?: ContactInfoDTO;
  admissionDate: string;     // ISO date string
  graduationDate?: string;   // ISO date string
  currentClass: number;
  currentSection?: string;
  status: 'active' | 'inactive';
  classHistory?: ClassHistory[];
}

export type UpdateStudentDTO = CreateStudentDTO;
