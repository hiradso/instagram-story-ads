export type UserRole = 'admin' | 'advertiser' | 'ambassador'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  level: number
  status: 'active' | 'suspended'
}
