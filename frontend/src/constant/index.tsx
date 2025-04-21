import { INavLink } from "@/interfaces/Navbar";
import { Role } from "./roles";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
export const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID!;

/**
 * All allowed class values, including nursery & KG.
 */
export const classOptions = [
  'Nursery',
  'KG',
  '1','2','3','4','5','6','7','8','9','10','11','12',
] as const;

/**
 * Keys of CreateStudentDTO.contactInfo promoted to top‑level form fields.
 */
export const contactFields = [
  'fatherName',
  'motherName',
  'fatherPhone',
  'motherPhone',
  'email',
  'presentAddress',
  'permanentAddress',
] as const;

/**
 * Human‑readable labels for each contact field.
 */
export const contactFieldLabels: Record<
  typeof contactFields[number],
  string
> = {
  fatherName:   "Father's Name",
  motherName:   "Mother's Name",
  fatherPhone:  "Father's Phone",
  motherPhone:  "Mother's Phone",
  email:        "Email",
  presentAddress:  "Present Address",
  permanentAddress: "Permanent Address",
};


export const NAV_LINKS: INavLink[] = [
  {
    label: 'Attendance',
    href: '/dashboard/attendance',
    allowed: [Role.Admin, Role.Coordinator, Role.Principal, Role.Operator],
  },
  {
    label: 'Students',
    href: '/dashboard/students',
    allowed: [Role.Admin, Role.Coordinator, Role.Principal, Role.Operator],
  },
  {
    label: 'Reports',
    href: '/dashboard/report',
    allowed: [Role.Admin, Role.Coordinator, Role.Principal],
  },
]