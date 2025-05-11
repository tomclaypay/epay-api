import { Document } from 'mongoose'

export interface SummaryCache extends Document {
  balance: number
  totalDepositAmount: number
  totalWithdrawalAmount: number
  totalCashoutAmount: number
  totalDepositFee: number
  totalWithdrawalFee: number
  totalCashoutFee: number
  cacheTime: Date
  createdAt: string
  updatedAt: string
}
