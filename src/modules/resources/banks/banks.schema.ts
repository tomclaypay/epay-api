import mongoose from 'mongoose'
import { BankName, BankAccountType, BankType } from './dto/general.dto'
import MongooseDelete from 'mongoose-delete'
const { ObjectId } = mongoose.Schema.Types

export const BankSchema = new mongoose.Schema(
  {
    bankName: {
      type: String,
      enum: BankName,
      required: true
    },
    bankFullname: {
      type: String,
      required: false
    },
    bankAccount: {
      type: String,
      required: true
    },
    bankAccountName: {
      type: String,
      required: true
    },
    bankAccountType: {
      type: String,
      enum: BankAccountType,
      required: true
    },
    bankType: {
      type: String,
      enum: BankType,
      required: true
    },
    balance: {
      type: Number,
      required: false
    },
    isEnabled: {
      type: Boolean,
      required: true,
      default: false
    },
    getTxLimit: {
      type: Number,
      default: 20,
      required: true
    }
  },
  {
    timestamps: true
  }
)

BankSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id
    delete ret.isDeleted
    delete ret.__v
  }
})

BankSchema.plugin(MongooseDelete, {
  deletedAt: true,
  deletedBy: true,
  deletedByType: ObjectId,
  overrideMethods: 'all'
})
