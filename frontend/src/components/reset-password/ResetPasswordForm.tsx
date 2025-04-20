// app/reset-password/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'sonner';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { AxiosError } from 'axios';

// 1) Zod schema: newPassword + confirmPassword must match
const resetSchema = z
  .object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match',
  });

type ResetFormData = z.infer<typeof resetSchema>;

// 2) Shape of your API error payload
interface ApiError {
  message: string;
}


export default function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';

  const form = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  // 3) Mutation: POST { token, newPassword } to backend
  const mutation = useMutation<
  void,   
  AxiosError<ApiError>, 
  ResetFormData
>({
    mutationFn: async (data) => {
      await api.post(
        '/auth/password-reset/confirm',
        {
          token,
          newPassword: data.newPassword,
        },
       
      );
    },
    onSuccess: () => {
      toast.success('Password reset successful! Please log in.');
      router.push('/login');
    },
    onError: (err) => {
      // err is now strongly typed, no more `any`
      const msg = err.response?.data?.message ?? err.message;
      toast.error(`Reset failed: ${msg}`);
    },
  });

  const onSubmit = (data: ResetFormData) => {
    if (!token) {
      toast.error('Reset token is missing.');
      return;
    }
    mutation.mutate(data);
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Set a New Password</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* New Password */}
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm Password */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Resetting…' : 'Reset Password'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
