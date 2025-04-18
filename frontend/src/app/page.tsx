'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
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

  const checkHealth = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/health`
      );
      if (!res.ok) {
        console.error('Health check failed:', res.statusText);
        return;
      }
      const data = await res.json();
      console.log('Health response:', data);
    } catch (err) {
      console.error('Error calling health endpoint:', err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <Link href="/login">
        <button className="px-4 py-2 bg-blue-600 text-white rounded">
          Login
        </button>
      </Link>

      {role === 'admin' && (
        <Link href="/register">
          <button className="px-4 py-2 bg-green-600 text-white rounded">
            Register
          </button>
        </Link>
      )}

      {/* New Health‑Check Button */}
      <button
        onClick={checkHealth}
        className="px-4 py-2 bg-gray-600 text-white rounded"
      >
        Check API Health
      </button>
    </div>
  );
}
