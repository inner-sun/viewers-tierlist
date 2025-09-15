export interface User {
  id: number
  name: string
  avatar: string
}

export interface Tier {
  id: string
  name: string
  color: string
  users: User[]
}