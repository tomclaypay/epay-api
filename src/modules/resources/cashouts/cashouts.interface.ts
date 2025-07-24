import { Document } from 'mongoose'

export interface Cashout extends Document {
  amount: number
  fee: number
  ref: string
  isCrypto: boolean
  note: string
  createdAt: string
  updatedAt: string
}
