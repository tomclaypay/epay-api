import { Document } from 'mongoose'
import { OrderStatus } from '../../common/dto/general.dto'

export interface Withdrawal extends Document {
  bankNameSrc: string
  bankAccountSrc: string
  bankNameDest: string
  bankAccountNumberDest: string
  bankAccountNameDest: string
  amount: number
  fee: number
  code: string
  ref: string
  mt5Id: string
  callback: string
  virtualTransactions: string[]
  transaction: string
  status: OrderStatus
  isManual: boolean
  manualBy: string
  manualAt: string
  note: string
  createdAt: string
  updatedAt: string
}
