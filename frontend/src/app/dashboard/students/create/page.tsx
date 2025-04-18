'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

import type { CreateStudentDTO } from '@/interfaces/student';
import { classOptions, contactFieldLabels, contactFields } from '@/constant';
import axios from 'axios';


// 1) Zod schema: currentClass as string enum
const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  enrollmentNumber: z.string().min(1, 'Enrollment # is required'),
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
  currentClass: z.enum(classOptions, { required_error: 'Select class' }),
  currentSection: z.string().optional(),
  status: z.enum(['active', 'inactive']),
});

type FormValues = z.infer<typeof schema>;

export default function CreateStudentPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const create = useMutation<
  unknown,       // return type
  unknown,       // error type
  FormValues     // vars type
>({
    mutationFn: (vals) => {
      const dto: CreateStudentDTO = {
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
        admissionDate: vals.admissionDate,
        graduationDate: vals.graduationDate,
        // convert class string into your numeric codes if needed
        currentClass:
          vals.currentClass === 'Nursery'
            ? -1
            : vals.currentClass === 'KG'
            ? 0
            : Number(vals.currentClass),
        currentSection: vals.currentSection,
        status: vals.status,
      };
      return api.post('/students', dto);
    },
    onSuccess: () => {
      toast.success('Student created');
      qc.invalidateQueries({ queryKey: ['students'] });
      router.push('/dashboard/students');
    },
    onError: (error: unknown) => {
      // default fallback
      let message = 'Creation failed';
  
      // if it's an Axios error, grab the server‑side message
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.error?.message ?? message;
      }
  
      toast.error(message);
    },
  });

  return (
    <form
      className="space-y-6 p-6"
      onSubmit={handleSubmit((v) => create.mutate(v))}
    >
      {/* --- Basic Info --- */}
      <div>
        <label className="block font-medium">Name</label>
        <Input {...register('name')} />
        {errors.name && (
          <p className="text-red-600 text-sm">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block font-medium">Enrollment #</label>
        <Input {...register('enrollmentNumber')} />
        {errors.enrollmentNumber && (
          <p className="text-red-600 text-sm">
            {errors.enrollmentNumber.message}
          </p>
        )}
      </div>

      <div>
        <label className="block font-medium">Date of Birth</label>
        <Input type="date" {...register('dateOfBirth')} />
      </div>

      <div>
        <label className="block font-medium">Gender</label>
        <select
          className="mt-1 block w-full rounded border px-3 py-2"
          {...register('gender')}
        >
          <option value="">Select</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
        </select>
      </div>

      {/* --- Contact Info Section --- */}
      <fieldset className="border p-4 rounded space-y-4">
        <legend className="font-medium">Contact Info (optional)</legend>
        {contactFields.map((key) => (
  <div key={key}>
    <label className="block font-medium">
      {contactFieldLabels[key]}
    </label>
    <Input {...register(key)} />
    {errors[key]?.message && (
      <p className="text-red-600 text-sm">
        {errors[key]?.message}
      </p>
    )}
  </div>
))}

      </fieldset>

      {/* --- Academic Info --- */}
      <div>
        <label className="block font-medium">Admission Date</label>
        <Input type="date" {...register('admissionDate')} />
        {errors.admissionDate && (
          <p className="text-red-600 text-sm">
            {errors.admissionDate.message}
          </p>
        )}
      </div>

      <div>
        <label className="block font-medium">Graduation Date</label>
        <Input type="date" {...register('graduationDate')} />
      </div>

      <div>
        <label className="block font-medium">Class</label>
        <select
          className="mt-1 block w-full rounded border px-3 py-2"
          {...register('currentClass')}
        >
          <option value="">Select class</option>
          {classOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {errors.currentClass && (
          <p className="text-red-600 text-sm">
            {errors.currentClass.message}
          </p>
        )}
      </div>

      <div>
        <label className="block font-medium">Section</label>
        <Input {...register('currentSection')} />
      </div>

      <div>
        <label className="block font-medium">Status</label>
        <select
          className="mt-1 block w-full rounded border px-3 py-2"
          {...register('status')}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating…' : 'Create Student'}
      </Button>
    </form>
  );
}
