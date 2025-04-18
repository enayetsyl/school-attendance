'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Grab stored user; if none, role stays null
    const stored = localStorage.getItem('globalUser');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setRole(user.role || null);
      } catch {
        setRole(null);
      }
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <Link href="/login">
        <button className="px-4 py-2 bg-blue-600 text-white rounded">
          Login
        </button>
      </Link>

      {/* Only show register if role === 'admin' */}
      {role === 'admin' && (
        <Link href="/register">
          <button className="px-4 py-2 bg-green-600 text-white rounded">
            Register
          </button>
        </Link>
      )}
    </div>
  );
}
