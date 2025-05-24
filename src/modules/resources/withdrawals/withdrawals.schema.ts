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
      required: true
    },
    bankAccountNumberDest: {
      type: String,
      required: true
    },
    bankAccountNameDest: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    fee: {
      type: Number,
      required: false
    },
    code: {
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
    virtualTransaction: {
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
