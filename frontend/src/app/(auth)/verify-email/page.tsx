// app/verify-email/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { API_BASE, TENANT_ID } from '@/constant';

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') ?? '';

  const verifyMutation = useMutation({
    mutationFn: async () => {
      await axios.get(`${API_BASE}/auth/verify-email`, {
        params: { token },
        headers: { 'X-Tenant-ID': TENANT_ID },
      });
    },
    onSuccess: () => {
      toast.success('Your email has been verified!');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err.message;
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

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <h1 className="text-2xl font-semibold mb-4">Verify Your Email</h1>

      {!token ? (
        <p className="text-red-600">No verification token provided.</p>
      ) : verifyMutation.isPending ? (
        <p>Verifying your email, please wait…</p>
      ) : verifyMutation.isError ? (
        <p className="text-red-600">
          {(verifyMutation.error as any)?.response?.data?.message ??
            'Something went wrong. Please try again.'}
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
        <Button onClick={() => router.push('/login')}>
          Go to Login
        </Button>
      )}
    </div>
  );
}
