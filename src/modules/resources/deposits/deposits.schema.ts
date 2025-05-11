import mongoose from 'mongoose'
import { OrderStatus } from '../../common/dto/general.dto'
import MongooseDelete from 'mongoose-delete'
const { ObjectId } = mongoose.Schema.Types

export const DepositSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true
    },
    actualAmount: {
      type: Number,
      required: false
    },
    code: {
      type: String,
      required: true,
      unique: true
    },
    ref: {
      type: String,
      required: true
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
    callback: {
      type: String,
      required: true
    },
    transaction: {
      type: ObjectId,
      ref: 'Transaction',
      required: false
    },
    transactions: {
      type: [ObjectId],
      ref: 'Transaction',
      required: false
    },
    virtualTransactions: {
      type: [ObjectId],
      ref: 'VirtualTransaction',
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
