'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { z } from 'zod';
import { toast } from 'sonner';
import Link from 'next/link';

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
import { API_BASE, TENANT_ID } from '@/constant';


// 1) Zod schema
const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
});
type ForgotFormData = z.infer<typeof forgotSchema>;

// define the shape of your API’s error response
interface ApiError {
  message: string
}

type Variables = { email: string; redirectUrl?: string }

export default function ForgotPasswordPage() {
  const form = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  // 2) Mutation calls your POST /auth/password-reset
  const mutation = useMutation<
  void,                     // what your mutationFn returns
  AxiosError<ApiError>,     // the error type
  Variables
>({
    mutationFn: async ({ email, redirectUrl }: { email: string; redirectUrl?: string }) => {
      return axios.post(
        `${API_BASE}/auth/password-reset`,
        { email, redirectUrl },
        { headers: { "X-Tenant-ID": TENANT_ID } }
      );
    },
    onSuccess: () => {
      toast(
        'If that email is in our system, you’ll receive a reset link shortly.'
      );
    },
    onError: (err) => {
      // err is now an AxiosError<ApiError>, no more `any`
      const msg = err.response?.data?.message ?? err.message
      toast.error(`Request failed: ${msg}`)
    },
  });

  const onSubmit = (data: ForgotFormData) => {
    mutation.mutate({
      email: data.email,
      redirectUrl: window.location.origin, // or some other dynamic value
    });
  }

  return (
    <div className="max-w-md mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Forgot Password</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    {...field}
                  />
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
            {mutation.isPending ? 'Sending…' : 'Send Reset Link'}
          </Button>

          {/* Back to login */}
          <div className="text-center mt-2">
            <Link
              href="/login"
              className="text-sm text-blue-600 hover:underline"
            >
              ← Back to Login
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
