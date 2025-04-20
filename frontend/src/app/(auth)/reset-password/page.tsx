// app/reset-password/page.tsx
'use client';

import ResetPasswordForm from '@/components/reset-password/ResetPasswordForm';
import { Suspense } from 'react';


export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
