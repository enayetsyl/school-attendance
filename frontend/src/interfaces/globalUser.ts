export interface IGlobalUser {
  email: string;
  password: string;
  username?: string;
  role?: string;
  isActive?: boolean;
  _id: string;
}