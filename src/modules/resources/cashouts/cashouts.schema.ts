import mongoose from 'mongoose'
import MongooseDelete from 'mongoose-delete'
const { ObjectId } = mongoose.Schema.Types

export const CashoutSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true
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
