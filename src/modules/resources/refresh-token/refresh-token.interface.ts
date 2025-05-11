import { Document } from 'mongoose'

export interface RefreshTokens extends Document {
  token: string
  userId: string
  username: string
  expiresAt: Date
}
