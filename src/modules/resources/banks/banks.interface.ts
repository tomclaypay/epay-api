import { Document } from 'mongoose'
import { BankName, BankAccountType, BankType } from './dto/general.dto'

export interface Bank extends Document {
  bankName: BankName
  bankFullname: string
  bankAccount: string
  bankAccountName: string
  bankAccountType: BankAccountType
  bankType: BankType
  balance: number
  getTxLimit: number
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}
