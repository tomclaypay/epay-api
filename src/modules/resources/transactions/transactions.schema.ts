import mongoose from 'mongoose'
import MongooseDelete from 'mongoose-delete'
const { ObjectId } = mongoose.Schema.Types

export const TransactionSchema = new mongoose.Schema(
  {
    bankName: {
      type: String,
      required: true
    },
    bankAccount: {
      type: String,
      required: true
    },
    transactionType: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true,
      unique: true
    },
    reference: {
      type: String,
      required: true
    },
    txCode: {
      type: String,
      required: false
    },
    prefixCode: {
      type: String,
      required: false
    },
    suffixCode: {
      type: String,
      required: false
    },
    amount: {
      type: Number,
      required: true
    },
    transactionTime: {
      type: Date,
      required: true
    },
    data: {
      type: String,
      required: false
    },
    deposit: {
      type: ObjectId,
      ref: 'Deposit',
      required: false
    },
    withdrawal: {
      type: ObjectId,
      ref: 'Withdrawal',
      required: false
    },
    isMatched: {
      type: Boolean,
      default: false
    },
    isManual: {
      type: Boolean,
      default: false
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
    timestamps: {
      createdAt: 'created_time',
      updatedAt: 'updated_time'
    }
  }
)

TransactionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id
    delete ret.__v
  }
})

TransactionSchema.plugin(MongooseDelete, {
  deletedAt: true,
  deletedBy: true,
  deletedByType: ObjectId,
  overrideMethods: 'all'
})
