import { VirtualType } from '@/modules/resources/settings/dto/general.dto'
import mongoose from 'mongoose'

export const SettingSchema = new mongoose.Schema({
  isUnderMaintenance: {
    type: Boolean,
    required: true,
    default: false
  },
  isVpayEnabled: {
    type: Boolean,
    require: true,
    default: false
  },
  isVirtualEnabled: {
    type: Boolean,
    require: true,
    default: false
  },
  isCryptoEnabled: {
    type: Boolean,
    default: false
  },
  usdToUsdtRate: {
    type: Number
  },
  virtualType: {
    type: String,
    required: false,
    default: VirtualType.VIRTUAL
  },
  isXenditEnabled: {
    type: Boolean,
    default: false
  },
  isAutoWithdrawal: {
    type: Boolean,
    default: false
  },
  depositFeeFlat: {
    type: Number,
    required: true
  },
  depositFeePct: {
    type: Number,
    required: true
  },
  depositVirtualFeeFlat: {
    type: Number,
    required: true,
    default: 0
  },
  depositVirtualFeePct: {
    type: Number,
    required: true,
    default: 0
  },
  withdrawFeeFlat: {
    type: Number,
    required: true
  },
  withdrawFeePct: {
    type: Number,
    required: true
  },
  cashoutFeeFlat: {
    type: Number,
    required: true
  },
  cashoutFeePct: {
    type: Number,
    required: true
  },
  expiredTime: {
    type: Number,
    required: true
  },
  minDepositAmount: {
    type: Number,
    required: true
  },
  maxDepositAmount: {
    type: Number,
    required: true
  },
  minWithdrawalAmount: {
    type: Number,
    required: true
  },
  maxWithdrawalAmount: {
    type: Number,
    required: true
  },
  withdrawalBanks: {
    type: [String],
    required: true
  },
  withdrawalBanksVov5: {
    type: [String],
    required: false,
    default: []
  }
})

SettingSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id
    delete ret.__v
  }
})
