import { Document } from 'mongoose'

export interface CustomerWallet extends Document {
  id: string
  mt5Id: string
  customerId: string
  tronAddress: string
  evmAddress: string
  callback: string
  createdAt: string
  updatedAt: string
}
