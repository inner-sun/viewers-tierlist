export interface User {
  id: number
  name: string
  avatar: string
  message: number
  watchtime: number
  chatColor
}

export interface Tier {
  id: string
  name: string
  color: string
  users: User[]
}