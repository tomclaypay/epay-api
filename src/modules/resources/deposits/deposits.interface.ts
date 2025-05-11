import { Document } from 'mongoose'
import { OrderStatus } from '../../common/dto/general.dto'

export interface Deposit extends Document {
  amount: number
  actualAmount: number
  code: string
  ref: string
  refXendit: string
  mt5Id: string
  hashId: string
  callback: string
  transaction: string
  transactions: string[]
  virtualTransactions: string[]
  status: OrderStatus
  fee: number
  note: string
  isManual: boolean
  manualBy: string
  manualAt: string
  createdAt: string
  updatedAt: string
}
