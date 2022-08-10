export interface User {
  id: number
  email: string
  provider: 'facebook' | null
  uid: string | null
}

export interface FullUser extends User {
  signInCount: number
  currentSignInIp: string
  lastSignInIp: string
  currentSignInAt: Date | null
  lastSignInAt: Date | null
  name: string
  country: string
  trackCount: number
}

export type SerializedUser = Omit<FullUser, 'currentSignInAt' | 'lastSignInAt'> & {
  currentSignInAt: string | null
  lastSignInAt: string | null
}

export const elementEndpoint = (id: number) => `/api/v1/users/${id}`
