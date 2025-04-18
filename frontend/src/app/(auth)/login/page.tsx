'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

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
import { toast } from 'sonner';
import Link from 'next/link';
import api from '@/lib/api';
import { IGlobalUser } from '@/interfaces/globalUser';
import { AxiosError } from 'axios';

// 1) Zod schema for login
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
type LoginFormData = z.infer<typeof loginSchema>;

// 2) Define the shape of your API’s error payload
interface ApiError {
  message: string;
}


export default function LoginPage() {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // 3) Mutation to call backend + console.log token
  const mutation = useMutation<
  { accessToken: string; refreshToken: string; globalUser: IGlobalUser },
  AxiosError<ApiError>,
  LoginFormData 
>({
    mutationFn: async (data: LoginFormData) => {
      const { data: tokens } = await api.post('/auth/login', data);
      return tokens as { accessToken: string; refreshToken: string, globalUser:IGlobalUser };
    },
    onSuccess: ({ accessToken, refreshToken, globalUser }) => {
      // 3) Store in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('globalUser', JSON.stringify(globalUser));

      // 4) Notify & redirect
      toast.success('Login successful!');
    },
    onError: (err) => {
      // `err` is now an AxiosError<ApiError>, not `any`
      const msg = err.response?.data?.message ?? err.message;
      toast.error(`Login failed: ${msg}`);
    },
  });

  const onSubmit = (data: LoginFormData) => mutation.mutate(data);

  // 4) Render form
  return (
    <div className="max-w-md mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
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

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
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
            {mutation.isPending ? 'Logging in...' : 'Login'}
          </Button>

            {/* ← Add this link under the button */}
            <div className="text-center mt-2">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline cursor-pointer"
            >
              Forgot Password?
            </Link>
            </div>
        </form>
      </Form>
    </div>
  );
}
