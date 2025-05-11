import { Document } from 'mongoose'
import { VirtualServiceCode, VirtualTransactionStatus } from './dto/general.dto'

export interface VirtualTransaction extends Document {
  id: string
  depositOrder: string
  refId: string
  status: VirtualTransactionStatus
  serviceCode: VirtualServiceCode
  amount: number
  paidAmount: number
  transferAmount: number
  orderExpiryTime: number
  isBankAccountEnabled: boolean
  bankCode: string
  bankName: string
  bankAccountNo: string
  bankAccountName: string
  qrUrl: string
  returnUrl: string
  cancelUrl: string
  createdAt: string
  updatedAt: string
}
