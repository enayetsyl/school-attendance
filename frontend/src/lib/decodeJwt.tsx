// lib/decodeJwt.ts
export function decodeJwt<T>(token: string): T {
  // grab the middle section
  const base64Url = token.split('.')[1] || ''
  // base64url → base64
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  // atob is available in the browser
  const json = atob(base64)
  return JSON.parse(json) as T
}
