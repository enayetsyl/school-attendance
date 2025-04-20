// app/verify-email/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { AxiosError } from 'axios';

// 1) Shape of your API error response
interface ApiError {
  message: string;
}

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') ?? '';

  const verifyMutation = useMutation<
  void, 
  AxiosError<ApiError> 
>({
    mutationFn: async () => {
      await api.get('/auth/verify-email', {
        params: { token },
      });
    },
    onSuccess: () => {
      toast.success('Your email has been verified!');
    },
    onError: (err) => {
      // err is now typed, no `any`
      const msg = err.response?.data?.message ?? err.message;
      toast.error(`Verification failed: ${msg}`);
    },
  });

 
const hasCalled = useRef(false);

useEffect(() => {
  if (token && !hasCalled.current) {
    verifyMutation.mutate();
    hasCalled.current = true;
  }
}, [token, verifyMutation]);

// Extract a typed error message for render
const errorMsg =
verifyMutation.error?.response?.data?.message ??
'Something went wrong. Please try again.';

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <h1 className="text-2xl font-semibold mb-4">Verify Your Email</h1>

      {!token ? (
        <p className="text-red-600">No verification token provided.</p>
      ) : verifyMutation.isPending ? (
        <p>Verifying your email, please wait…</p>
      ) : verifyMutation.isError ? (
        <p className="text-red-600">
          {errorMsg}
        </p>
      ) : (
        <p className="mb-4">
          Your email has been verified! You can now log in.
        </p>
      )}

      {/* Retry / Resend Button */}
      {token && verifyMutation.isError && !verifyMutation.isPending && (
        <Button onClick={() => verifyMutation.mutate()} className="mb-2">
          Retry Verification
        </Button>
      )}

      {/* Go to Login Button on success */}
      {token && verifyMutation.isSuccess && (
        <Button 
        className='cursor-pointer'
        onClick={() => router.push('/login')}>
          Go to Login
        </Button>
      )}
    </div>
  );
}
