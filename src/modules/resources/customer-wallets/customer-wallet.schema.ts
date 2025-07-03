import mongoose from 'mongoose'

export const CustomerWalletSchema = new mongoose.Schema(
  {
    mt5Id: {
      type: String,
      required: false
    },
    customerId: {
      type: String,
      required: true
    },
    tronAddress: {
      type: String,
      required: false
    },
    evmAddress: {
      type: String,
      required: false
    },
    callback: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
)

CustomerWalletSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id
    delete ret.__v
  }
})
