export interface User {
  id: string
  email: string
  created_at: string
  role: string
}

export interface Option {
  id: number
  option: string
  created_at: string
  poll_id: number
}

export interface Vote {
  id: number
  user_id: string
  option_id: number
  filter: 'easy' | 'difficult' | 'not_exist'
  created_at: string
}

export interface VoteHistory extends Option {
  filter: 'easy' | 'difficult' | 'not_exist'
}

export type DifficultyFilter = 'all' | 'easy' | 'difficult' | 'not_exist'
