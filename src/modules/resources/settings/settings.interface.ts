import { VirtualType } from '@/modules/resources/settings/dto/general.dto'
import { Document } from 'mongoose'

export interface Setting extends Document {
  isUnderMaintenance: boolean
  isVpayEnabled: boolean
  isVirtualEnabled: boolean
  isXenditEnabled: boolean
  isCryptoEnabled: boolean
  exchangeRate: number
  virtualType: VirtualType
  isAutoWithdrawal: boolean
  depositFeeFlat: number
  depositFeePct: number
  depositVirtualFeeFlat: number
  depositVirtualFeePct: number
  withdrawFeeFlat: number
  withdrawFeePct: number
  cashoutFeeFlat: number
  cashoutFeePct: number
  expiredTime: number
  minDepositAmount: number
  maxDepositAmount: number
  minWithdrawalAmount: number
  maxWithdrawalAmount: number
  withdrawalBanks: [string]
  withdrawalBanksVov5: [string]
}
