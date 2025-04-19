// app/dashboard/create-attendance/page.tsx
'use client';

import AttendanceForm from "@/components/attendance/AttendanceFrom";



export default function CreateAttendancePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create Attendance</h1>
      <AttendanceForm />
    </div>
  );
}
