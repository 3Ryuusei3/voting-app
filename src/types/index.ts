export interface User {
  id: string
  email: string
  created_at: string
}

export interface Word {
  id: number
  word: string
  created_at: string
}

export interface Vote {
  id: number
  user_id: string
  word_id: number
  difficult: 'easy' | 'difficult' | 'not_exist'
  created_at: string
}

export interface VoteHistory extends Word {
  difficulty: 'easy' | 'difficult' | 'not_exist'
}
