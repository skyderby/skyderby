export interface User {
  id: number
  email: string
  provider: 'facebook' | null
  uid: string | null
}
