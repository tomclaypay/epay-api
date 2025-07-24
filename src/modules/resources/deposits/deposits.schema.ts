import mongoose from 'mongoose'
import { DepositOrderType, OrderStatus } from '../../common/dto/general.dto'
import MongooseDelete from 'mongoose-delete'
const { ObjectId } = mongoose.Schema.Types

export const DepositSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true
    },
    customerWallet: {
      type: ObjectId,
      ref: 'CustomerWallet',
      required: false
    },
    upayOrderRef: {
      type: String,
      required: false
    },
    actualAmount: {
      type: Number,
      required: false
    },
    usdActualAmount: {
      type: Number,
      required: false
    },
    usdToUsdtRate: {
      type: Number,
      required: false
    },
    orderType: {
      type: String,
      enum: DepositOrderType,
      required: true
    },
    code: {
      type: String,
      required: true,
      unique: true
    },
    ref: {
      type: String,
      required: false
    },
    refXendit: {
      type: String,
      required: false
    },
    mt5Id: {
      type: String,
      required: false
    },
    hashId: {
      type: String,
      required: false,
      unique: true
    },
    txHash: {
      type: String,
      required: false
    },
    chainName: {
      type: String,
      required: false
    },
    callback: {
      type: String,
      required: true
    },
    transaction: {
      type: ObjectId,
      ref: 'BankTransaction',
      required: false
    },
    bankTransactions: {
      type: [ObjectId],
      ref: 'BankTransaction',
      required: false
    },
    virtualTransactions: {
      type: [ObjectId],
      ref: 'VirtualTransaction',
      required: false
    },
    usdFee: {
      type: Number,
      required: false
    },
    fee: {
      type: Number,
      required: false
    },
    isManual: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      required: true,
      enum: OrderStatus,
      default: OrderStatus.Pending
    },
    note: {
      type: String,
      required: false
    },
    manualBy: {
      type: String,
      required: false
    },
    manualAt: {
      type: Date,
      required: false
    }
  },
  {
    timestamps: true
  }
)

DepositSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id
    delete ret.__v
  }
})

DepositSchema.plugin(MongooseDelete, {
  deletedAt: true,
  deletedBy: true,
  deletedByType: ObjectId,
  overrideMethods: 'all'
})
