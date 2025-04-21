import { Role } from "@/constant/roles"

export interface INavLink  {
  label: string
  href: string
  allowed: Role[]
}