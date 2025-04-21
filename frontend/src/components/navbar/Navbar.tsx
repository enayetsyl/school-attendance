'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu'
import { Role } from '@/constant/roles'
import { NAV_LINKS } from '@/constant'

export function NavBar({ role }: { role: Role }) {
  const pathname = usePathname()

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {NAV_LINKS
          .filter(link => link.allowed.includes(role))
          .map(link => (
            <NavigationMenuItem key={link.href}>
              <NavigationMenuLink asChild>
                <Link
                  href={link.href}
                  className={
                    pathname === link.href
                      ? 'text-primary'
                      : 'hover:text-gray-900'
                  }
                >
                  {link.label}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
