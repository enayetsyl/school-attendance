'use client'

import { Loader2 } from 'lucide-react'

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center h-full p-6">
      <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
    </div>
  )
}
