// src/interfaces/attendance.ts
// export interface AttendanceEntry {
//   studentId: string;
//   name: string;
//   currentClass: number;
//   currentSection?: string;
//   // new flag:
//   present: boolean;
//   absent: boolean;
//   lateEntry?: string;
//   earlyLeave?: string;
//   comment?: string;
// }

export interface AttendanceByDate {
  date: string;
  entries: AttendanceEntry[];
}


export type AttendanceEntry = {
  _id: string;
  student: {
    _id: string;
    name: string;
    currentClass: number;
    currentSection?: string;
  };
  present: boolean;
  absent: boolean;
  lateEntry?: string;
  earlyLeave?: string;
  comment?: string;
};

export type AttendanceUpdatePayload = {
  id: string;
  present: boolean;
  absent: boolean;
  lateEntry?: string;
  earlyLeave?: string;
  comment?: string;
};

export type AttendanceFormState = {
  present: boolean;
  absent: boolean;
  lateEntry: string;
  earlyLeave: string;
  comment: string;
};
