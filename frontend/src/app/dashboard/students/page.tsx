// app/dashboard/students/page.tsx
export const dynamic = 'force-dynamic'

import StudentsPage from '@/components/student/StudentComponent'
import React, { Suspense } from 'react'


export default function Page() {
  return (
    <Suspense fallback={<div>Loading students…</div>}>
      <StudentsPage/>
    </Suspense>
  )
}
