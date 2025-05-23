import { Document } from 'mongoose'
import { DepositOrderType, OrderStatus } from '../../common/dto/general.dto'

export interface Deposit extends Document {
  amount: number
  actualAmount: number
  code: string
  ref: string
  refXendit: string
  mt5Id: string
  hashId: string
  callback: string
  bankTransactions: string[]
  virtualTransactions: string[]
  status: OrderStatus
  orderType: DepositOrderType
  fee: number
  note: string
  isManual: boolean
  manualBy: string
  manualAt: string
  createdAt: string
  updatedAt: string
}
