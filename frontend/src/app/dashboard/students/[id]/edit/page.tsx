// src/app/dashboard/students/[id]/edit/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

import { StudentDetail, UpdateStudentDTO } from '@/interfaces/student';
import { classOptions, contactFieldLabels, contactFields } from '@/constant';
import axios from 'axios';

type ClassOption = typeof classOptions[number];
// 1) Use the same schema shape as CreateStudentPage
const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  // still include enrollmentNumber so RHF has it in formData
  enrollmentNumber: z.string(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['M', 'F']).optional(),

  // contact fields
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  fatherPhone: z.string().optional(),
  motherPhone: z.string().optional(),
  email: z.string().email('Invalid email').optional(),
  presentAddress: z.string().optional(),
  permanentAddress: z.string().optional(),

  admissionDate: z.string().min(1, 'Admission date is required'),
  graduationDate: z.string().optional(),

  // classOptions is a readonly tuple of strings
  currentClass: z.enum(classOptions, {
    errorMap: () => ({ message: 'Select a class' }),
  }),
  currentSection: z.string().optional(),

  status: z.enum(['active', 'inactive']),
});

type FormValues = z.infer<typeof schema>;

export default function EditStudentPage() {
  const { id } = useParams();
  const router = useRouter();
  const qc = useQueryClient();

  // fetch
  const { data: student, isLoading } = useQuery<StudentDetail, Error>({
    queryKey: ['student', id],
    queryFn: () => api.get(`/students/${id}`).then((r) => r.data.data),
  });

  // react-hook-form
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  // reset when student loads
  useEffect(() => {
    if (!student) return;

     // Convert numeric → one of the literal strings
  const asClass: ClassOption =
  student.currentClass === -1
    ? 'Nursery'
    : student.currentClass === 0
    ? 'KG'
    : (student.currentClass.toString() as ClassOption);

    form.reset({
      name: student.name,
      enrollmentNumber: student.enrollmentNumber,
      dateOfBirth: student.dateOfBirth?.slice(0, 10),
      gender: student.gender,
      fatherName: student.contactInfo?.fatherName,
      motherName: student.contactInfo?.motherName,
      fatherPhone: student.contactInfo?.fatherPhone,
      motherPhone: student.contactInfo?.motherPhone,
      email: student.contactInfo?.email,
      presentAddress: student.contactInfo?.presentAddress,
      permanentAddress: student.contactInfo?.permanentAddress,
      admissionDate: student.admissionDate.slice(0, 10),
      graduationDate: student.graduationDate?.slice(0, 10),
      currentClass:asClass,
      currentSection: student.currentSection,
      status: student.status,
    });
  }, [student, form]);

  // mutation
  const save = useMutation<
  unknown, 
  unknown, 
  FormValues 
>({
    mutationFn: (vals) => {
      const dto: UpdateStudentDTO = {
        name: vals.name,
        enrollmentNumber: vals.enrollmentNumber,
        dateOfBirth: vals.dateOfBirth,
        gender: vals.gender,
        contactInfo: {
          fatherName: vals.fatherName,
          motherName: vals.motherName,
          fatherPhone: vals.fatherPhone,
          motherPhone: vals.motherPhone,
          email: vals.email,
          presentAddress: vals.presentAddress,
          permanentAddress: vals.permanentAddress,
        },
        admissionDate: vals.admissionDate!,
        graduationDate: vals.graduationDate,
        currentClass:
          vals.currentClass === 'Nursery'
            ? -1
            : vals.currentClass === 'KG'
            ? 0
            : Number(vals.currentClass),
        currentSection: vals.currentSection,
        status: vals.status,
      };
      return api.put(`/students/${id}`, dto);
    },
    onSuccess: () => {
      toast.success('Student updated');
      qc.invalidateQueries({ queryKey: ['students'] });
      qc.invalidateQueries({ queryKey: ['student', id] });
      router.push(`/dashboard/students/${id}`);
    },
    onError: (error: unknown) => {
      // 1) narrow to AxiosError
      let message = 'Update failed';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.error?.message ?? message;
      }
      toast.error(message);
    },
  });

  if (isLoading) return <p>Loading…</p>;
  if (!student) return <p>Not found</p>;

  return (
    <form
      className="space-y-6 p-6"
      onSubmit={form.handleSubmit((v) => save.mutate(v))}
    >
      {/* Name */}
      <div>
        <label className="block font-medium">Name</label>
        <Input {...form.register('name')} />
      </div>

      {/* Enrollment Number (read-only) */}
      <div>
        <label className="block font-medium">Enrollment Number</label>
        <p className="mt-1">{student.enrollmentNumber}</p>
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block font-medium">Date of Birth</label>
        <Input type="date" {...form.register('dateOfBirth')} />
      </div>

      {/* Gender */}
      <div>
        <label className="block font-medium">Gender</label>
        <select
          className="mt-1 block w-full rounded border px-3 py-2"
          {...form.register('gender')}
        >
          <option value="">Select</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
        </select>
      </div>

      {/* Contact Info */}
      <fieldset className="border p-4 rounded space-y-4">
        <legend className="font-medium">Contact Info</legend>
        {contactFields.map((key) => (
          <div key={key}>
            <label className="block font-medium">
              {contactFieldLabels[key]}
            </label>
            <Input {...form.register(key)} />
          </div>
        ))}
      </fieldset>

      {/* Admission & Graduation */}
      <div>
        <label className="block font-medium">Admission Date</label>
        <Input type="date" {...form.register('admissionDate')} />
      </div>
      <div>
        <label className="block font-medium">Graduation Date</label>
        <Input type="date" {...form.register('graduationDate')} />
      </div>

      {/* Class */}
      <div>
        <label className="block font-medium">Class</label>
        <select
          className="mt-1 block w-full rounded border px-3 py-2"
          {...form.register('currentClass')}
        >
          <option value="">Select class</option>
          {classOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Section */}
      <div>
        <label className="block font-medium">Section</label>
        <Input {...form.register('currentSection')} />
      </div>

      {/* Status */}
      <div>
        <label className="block font-medium">Status</label>
        <select
          className="mt-1 block w-full rounded border px-3 py-2"
          {...form.register('status')}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <Button type="submit" disabled={save.isPending}>
        {save.isPending ? 'Saving…' : 'Save Changes'}
      </Button>
    </form>
  );
}
