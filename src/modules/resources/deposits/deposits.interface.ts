import { Document } from 'mongoose'
import { DepositOrderType, OrderStatus } from '../../common/dto/general.dto'

export interface Deposit extends Document {
  amount: number
  customerWallet: string
  upayOrderRef: string
  actualAmount: number
  usdtActualAmount: number
  exchangeRate: number
  chainName: string
  txHash: string
  usdtFee: number
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
