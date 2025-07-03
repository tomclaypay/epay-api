import mongoose from 'mongoose'
import MongooseDelete from 'mongoose-delete'
const { ObjectId } = mongoose.Schema.Types

export const WithdrawalSchema = new mongoose.Schema(
  {
    bankNameSrc: {
      type: String,
      required: false
    },
    bankAccountSrc: {
      type: String,
      required: false
    },
    bankNameDest: {
      type: String,
      required: false
    },
    bankAccountNumberDest: {
      type: String,
      required: false
    },
    bankAccountNameDest: {
      type: String,
      required: false
    },
    amount: {
      type: Number,
      required: true
    },
    customerWallet: {
      type: ObjectId,
      ref: 'CustomerWallet',
      required: false
    },
    exchangeRate: {
      type: Number,
      required: false
    },
    usdtAmount: {
      type: Number,
      required: false
    },
    toAddress: {
      type: String,
      required: false
    },
    chainName: {
      type: String,
      required: false
    },
    txHash: {
      type: String,
      required: false
    },
    fee: {
      type: Number,
      required: false
    },
    usdtFee: {
      type: Number,
      required: false
    },
    code: {
      type: String,
      required: false
    },
    upayOrderRef: {
      type: String,
      required: false
    },
    ref: {
      type: String,
      required: true
    },
    mt5Id: {
      type: String,
      required: false
    },
    callback: {
      type: String,
      required: true
    },
    transaction: {
      type: ObjectId,
      ref: 'VirtualTransaction',
      required: false
    },
    virtualTransactions: {
      type: [ObjectId],
      ref: 'VirtualTransaction',
      required: false
    },
    isManual: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      required: true,
      default: 'PENDING'
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

WithdrawalSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id
    delete ret.__v
  }
})

WithdrawalSchema.plugin(MongooseDelete, {
  deletedAt: true,
  deletedBy: true,
  deletedByType: ObjectId,
  overrideMethods: 'all'
})
