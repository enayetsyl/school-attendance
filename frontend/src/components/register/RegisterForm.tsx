'use client';
export const dynamic = 'force-dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import api from '@/lib/api'; 
import { AxiosError } from 'axios';

// 1. Define roles as a const tuple so z.enum can infer literal types 
const roles = ['admin', 'principle', 'teacher', 'guardian', 'operator', 'co-ordinator'] as const;


// 2. Build the Zod schema, using `errorMap` to customize the enum error 
const registerSchema = z
  .object({
    username: z.string().min(1, 'Username is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.enum(roles, {
      errorMap: () => ({ message: 'Please select a role' }),
    })
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match',
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface ApiErrorResponse {
  message: string;
}

export default function RegisterForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useSearchParams();
  const [frontendUrl, setFrontendUrl] = useState<string>('');

  // on client only, compute fallback origin if none provided
  useEffect(() => {
    const q = params.get('frontendUrl');
    setFrontendUrl(q ?? window.location.origin);
  }, [params]);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: roles[0], 
     
    },
  });

  const mutation = useMutation<
  unknown,
  AxiosError<ApiErrorResponse>,
  RegisterFormData
>({
    mutationFn: async (data: RegisterFormData) => {
      if (!frontendUrl) 
        {
          toast.error("Missing frontend url please reload the page.")
          throw new Error('Missing frontendUrl');}
          const { data: resp } = await api.post('/auth/register', {
            username: data.username,
            email: data.email,
            password: data.password,
            role: data.role,
            frontendUrl,
          });
          return resp;
    },
    onSuccess: () => {
      toast.success('Account created! Check your email to verify.');
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      router.push('/login');
    },
    onError: (err) => {
      const msg = err?.response?.data?.message ?? err.message;
      toast.error(`Registration failed: ${msg}`);
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    console.log(data)
    mutation.mutate(data);
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Register</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Username */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
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

          {/* Role */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={mutation.isPending || !frontendUrl}
          >
            {mutation.isPending ? 'Registering...' : 'Register'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
