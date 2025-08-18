import { Document } from 'mongoose'

export interface Cashout extends Document {
  amount: number
  fee: number
  ref: string
  isCrypto: boolean
  status: string
  chainName?: string
  walletAddress?: string
  vndPerUsdt?: number
  actualAmountUsdt?: number
  note: string
  createdAt: string
  updatedAt: string
}
