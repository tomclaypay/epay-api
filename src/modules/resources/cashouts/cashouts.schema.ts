import { CashoutStatus } from '@/modules/common/dto/general.dto'
import mongoose from 'mongoose'
import MongooseDelete from 'mongoose-delete'
const { ObjectId } = mongoose.Schema.Types

export const CashoutSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true
    },
    chainName: {
      type: String,
      required: false
    },
    walletAddress: {
      type: String,
      required: false
    },
    vndPerUsdt: {
      // usdt = vnd / vndPerUsdt
      type: Number,
      required: false
    },
    actualAmountUsdt: {
      type: Number,
      required: false
    },
    fee: {
      type: Number,
      required: false
    },
    isCrypto: {
      type: Boolean,
      required: true,
      default: false
    },
    status: {
      type: String,
      enum: CashoutStatus,
      default: CashoutStatus.Completed
    },
    ref: {
      type: String,
      required: true
    },
    note: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true
  }
)

CashoutSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id
    delete ret.__v
  }
})

CashoutSchema.plugin(MongooseDelete, {
  deletedAt: true,
  deletedBy: true,
  deletedByType: ObjectId,
  overrideMethods: 'all'
})
