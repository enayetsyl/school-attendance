// app/reset-password/page.tsx
'use client';

import VerifyEmailComponent from '@/components/verify-email/VerifyEmailComponent';
import { Suspense } from 'react';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
<VerifyEmailComponent/>
    </Suspense>
  );
}
