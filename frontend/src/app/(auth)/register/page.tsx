'use client';

import RegisterForm from '@/components/register/RegisterForm';
import { useGlobalContext } from '@/provider/GlobalContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProtectedRegisterPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean>(false);
  const { globalUser } = useGlobalContext()

  useEffect(() => {
    // If not logged in or not an admin, redirect to login
    if (!globalUser || globalUser.role !== 'admin') {
      router.replace('/login');
      return;
    }
    // User is admin, allow access
    setAllowed(true);
  }, [globalUser, router]);

  // while checking, or redirecting, render nothing (or a spinner)
  if (!allowed) {
    return null;
  }

  // once allowed, render your actual register form/page
  return <RegisterForm />;
}
