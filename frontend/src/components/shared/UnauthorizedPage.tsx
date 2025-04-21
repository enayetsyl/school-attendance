// components/UnauthorizedPage.tsx

'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function UnauthorizedPage() {
  const router = useRouter()
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Access Denied</h1>
      <p>You do not have permission to view this page.</p>
      <Button onClick={() => router.push('/dashboard')}>
        Go Back
      </Button>
    </div>
  )
}
