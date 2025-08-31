export interface Tag {
  id: number
  name: string
  color: string
  count?: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
  status?: string
}

export interface LoginResponse {
  data: {
    personId: number
    token?: string
  }
  status: string
  message?: string
}

export interface TokenResponse {
  data: string | {
    token: string
  }
}

export type TagType = 'persons' | 'songs'

export interface BulkOperation {
  type: 'color' | 'delete'
  tagIds: number[]
  color?: string
}