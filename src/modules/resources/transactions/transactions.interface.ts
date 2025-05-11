import { Document, ObjectId } from 'mongoose'
import { TransactionType } from '../../common/dto/general.dto'

export interface Transaction extends Document {
  bankName: string
  bankAccount: string
  transactionType: TransactionType
  content: string
  reference: string
  txCode: string
  prefixCode: string
  suffixCode: string
  amount: number
  transactionTime: Date
  data: string
  deposit: ObjectId
  withdrawal: ObjectId
  isMatched: boolean
  isManual: boolean
  manualBy: string
  manualAt: string
  createdAt: Date
  updatedAt: Date
}
