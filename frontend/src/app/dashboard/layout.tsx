'use client'

import { ReactNode, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

import { Role } from '@/constant/roles'
import { decodeJwt } from '@/lib/decodeJwt'
import { UnauthorizedPage } from '@/components/shared/UnauthorizedPage'
import { LoadingPage } from '@/components/shared/LoadingPage'
import { NavBar } from '@/components/navbar/Navbar'


export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(null)
  const [forbidden, setForbidden] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Always clear forbidden on path change
    setForbidden(false)

    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/login')
      return
    }

    let payload: { role: Role }
    try {
      payload = decodeJwt<{ role: Role }>(token)
    } catch {
      router.push('/login')
      return
    }

    // If operator + hitting a reports route → forbidden
    if (
      payload.role === Role.Operator &&
      pathname.startsWith('/dashboard/report')
    ) {
      setForbidden(true)
      return
    }

    setRole(payload.role)
  }, [pathname, router])

  if (forbidden) {
    return <UnauthorizedPage />
  }

  if (role === null) {
    return <LoadingPage />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <NavBar role={role} />
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}
