'use client';
export const dynamic = 'force-dynamic';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from '@/components/ui/pagination';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Student } from '@/interfaces/student';

interface StudentsResponse {
  data: Student[];
  meta: { page: number; pageSize: number; total: number };
}

export default function StudentsPage() {
  const search = useSearchParams();
  const page = parseInt(search.get('page') ?? '1', 10);
  const pageSize = 10;

  const { data, isLoading } = useQuery<StudentsResponse, Error>({
    queryKey: ['students', page],
    queryFn: () =>
      api
        .get<StudentsResponse>('/students', {
          params: { page, limit: pageSize },
        })
        .then((r) => r.data),
  });

  if (isLoading) return <p>Loading…</p>;

  const items = data?.data ?? [];
  const { total } = data!.meta;
  const pageCount = Math.ceil(total / pageSize);

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Students</h1>
        <Link href="/dashboard/students/create">
          <Button>Create Student</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Enroll #</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Admitted</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((st) => (
              <TableRow key={st._id}>
                <TableCell>
                  <Link href={`/dashboard/students/${st._id}`}>
                    {st.name}
                  </Link>
                </TableCell>
                <TableCell>{st.enrollmentNumber}</TableCell>
                <TableCell>
                  {st.currentClass === -1
                    ? 'Nursery'
                    : st.currentClass === 0
                    ? 'KG'
                    : st.currentClass}
                </TableCell>
                <TableCell>{st.currentSection ?? '-'}</TableCell>
                <TableCell>
                  {new Date(st.admissionDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{st.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={page > 1 ? `/dashboard/students?page=${page - 1}` : '#'}
              className={page <= 1 ? 'opacity-50 pointer-events-none' : ''}
            />
          </PaginationItem>

          {Array.from({ length: pageCount }, (_, i) => i + 1).map((num) => (
            <PaginationItem key={num}>
              <PaginationLink href={`/dashboard/students?page=${num}`}>
                {num}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              href={page < pageCount ? `/dashboard/students?page=${page + 1}` : '#'}
              className={page >= pageCount ? 'opacity-50 pointer-events-none' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
