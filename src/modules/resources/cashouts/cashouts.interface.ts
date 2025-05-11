import { Document } from 'mongoose'

export interface Cashout extends Document {
  amount: number
  fee: number
  ref: string
  createdAt: string
  updatedAt: string
}
