import mongoose from 'mongoose'
import { VirtualServiceCode, VirtualTransactionStatus } from './dto/general.dto'
import MongooseDelete from 'mongoose-delete'
const { ObjectId } = mongoose.Schema.Types

export const VirtualTransactionSchema = new mongoose.Schema(
  {
    depositOrder: {
      type: ObjectId,
      ref: 'Deposit',
      required: true,
      unique: true
    },
    refId: {
      type: String,
      required: false
    },
    status: {
      type: String,
      enum: VirtualTransactionStatus,
      required: true,
      default: VirtualTransactionStatus.PENDING
    },
    serviceCode: {
      type: String,
      enum: VirtualServiceCode,
      required: false
    },
    amount: {
      type: Number,
      required: true
    },
    paidAmount: {
      type: Number,
      required: false
    },
    transferAmount: {
      type: Number,
      required: false
    },
    orderExpiryTime: {
      type: Number,
      required: false
    },
    isBankAccountEnabled: {
      type: Boolean,
      require: false,
      default: true
    },
    bankCode: {
      type: String,
      required: false
    },
    bankName: {
      type: String,
      required: false
    },
    bankAccountNo: {
      type: String,
      required: false
    },
    bankAccountName: {
      type: String,
      required: false
    },
    qrUrl: {
      type: String,
      required: false
    },
    returnUrl: {
      type: String,
      required: false
    },
    cancelUrl: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true
  }
)

VirtualTransactionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id
    delete ret.__v
  }
})

VirtualTransactionSchema.plugin(MongooseDelete, {
  deletedAt: true,
  deletedBy: true,
  deletedByType: ObjectId,
  overrideMethods: 'all'
})
