'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';
import { StudentDetail } from '@/interfaces/student';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  error: {
    message: string;
  };
}

export default function StudentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: student, isLoading } = useQuery<StudentDetail, Error>({
    queryKey: ['student', id],
    queryFn: () =>
      api.get(`/students/${id}`).then((r) => r.data.data),
  });


  const del = useMutation<void, AxiosError<ApiErrorResponse>>({
    mutationFn: () => api.delete(`/students/${id}`),
    onSuccess: () => {
      toast.success('Deleted');
      qc.invalidateQueries({ queryKey: ['students'] });
      router.push('/dashboard/students');
    },
    onError: (e) =>
      toast.error(e.response?.data?.error?.message || 'Delete failed'),
  });

  if (isLoading) return <p>Loading…</p>;
  if (!student) return <p>Not found</p>;

  // helper to display class label
  const classLabel = (c: number) =>
    c === -1 ? 'Nursery' : c === 0 ? 'KG' : c;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{student.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="font-semibold">Enrollment #</h2>
          <p>{student.enrollmentNumber}</p>
        </div>
        <div>
          <h2 className="font-semibold">Date of Birth</h2>
          <p>
            {student.dateOfBirth
              ? new Date(student.dateOfBirth).toLocaleDateString()
              : '—'}
          </p>
        </div>
        <div>
          <h2 className="font-semibold">Gender</h2>
          <p>{student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : '—'}</p>
        </div>
        <div>
          <h2 className="font-semibold">Admission Date</h2>
          <p>{new Date(student.admissionDate).toLocaleDateString()}</p>
        </div>
        <div>
          <h2 className="font-semibold">Graduation Date</h2>
          <p>
            {student.graduationDate
              ? new Date(student.graduationDate).toLocaleDateString()
              : '—'}
          </p>
        </div>
        <div>
          <h2 className="font-semibold">Class & Section</h2>
          <p>
            {classLabel(student.currentClass)} / {student.currentSection || '—'}
          </p>
        </div>
        <div>
          <h2 className="font-semibold">Status</h2>
          <p className={student.status === 'active' ? 'text-green-600' : 'text-red-600'}>
            {student.status}
          </p>
        </div>
      </div>

      {student.contactInfo && Object.keys(student.contactInfo).length > 0 ? (
  <div>
    <h2 className="text-xl font-semibold">Contact Information</h2>
    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(student.contactInfo).map(([key, val]) => (
        <div key={key}>
          <h3 className="font-medium">
            {key.replace(/([A-Z])/g, ' $1')}
          </h3>
          <p>{val || '—'}</p>
        </div>
      ))}
    </div>
  </div>
) : null}


      {student.classHistory?.length ? (
        <div>
          <h2 className="text-xl font-semibold">Class History</h2>
          <table className="w-full mt-2 table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1 text-left">Year</th>
                <th className="border px-2 py-1 text-left">Class</th>
                <th className="border px-2 py-1 text-left">Section</th>
                <th className="border px-2 py-1 text-left">Start Date</th>
                <th className="border px-2 py-1 text-left">End Date</th>
              </tr>
            </thead>
            <tbody>
              {student.classHistory.map((h, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{h.academicYear}</td>
                  <td className="border px-2 py-1">{classLabel(Number(h.classLevel))}</td>
                  <td className="border px-2 py-1">{h.section || '—'}</td>
                  <td className="border px-2 py-1">
                    {new Date(h.startDate).toLocaleDateString()}
                  </td>
                  <td className="border px-2 py-1">
                    {h.endDate ? new Date(h.endDate).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="space-x-2">
        <Link href={`/dashboard/students/${id}/edit`}>
          <Button>Edit</Button>
        </Link>
        <Button
          variant="destructive"
          onClick={() => del.mutate()}
          disabled={del.isPending}
        >
          {del.isPending ? 'Deleting…' : 'Delete'}
        </Button>
      </div>
    </div>
  );
}
