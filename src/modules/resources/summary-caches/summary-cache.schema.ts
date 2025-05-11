import * as mongoose from 'mongoose'

export const SummaryCacheSchema = new mongoose.Schema({
  balance: {
    type: Number,
    required: false,
    default: 0
  },
  totalDepositAmount: {
    type: Number,
    required: false,
    default: 0
  },
  totalWithdrawalAmount: {
    type: Number,
    required: false,
    default: 0
  },
  totalCashoutAmount: {
    type: Number,
    required: false,
    default: 0
  },
  totalDepositFee: {
    type: Number,
    required: false,
    default: 0
  },
  totalWithdrawalFee: {
    type: Number,
    required: false,
    default: 0
  },
  totalCashoutFee: {
    type: Number,
    required: false,
    default: 0
  },
  cacheTime: {
    type: Date,
    required: true,
    unique: true
  }
})

SummaryCacheSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id
    delete ret.__v
  }
})
