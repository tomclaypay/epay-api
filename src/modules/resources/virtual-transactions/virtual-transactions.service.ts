import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { VirtualTransaction } from './virtual-transactions.interface'
import {
  CreateVirtualTransactionDto,
  UpdateVirtualTransactionDto
} from './dto/request.dto'
import { VirtualServiceCode, VirtualTransactionStatus } from './dto/general.dto'

@Injectable()
export class VirtualTransactionsService {
  constructor(
    @InjectModel('VirtualTransaction')
    private virtualTransactionModel: Model<VirtualTransaction>
  ) {}

  async getTransactionById(txId: string) {
    return this.virtualTransactionModel.findById(txId)
  }

  async getTransactionByRefId(refId: string) {
    return this.virtualTransactionModel.findOne({ refId })
  }

  async getTransactionByOrderId(orderId: string) {
    return this.virtualTransactionModel.findOne({ depositOrder: orderId })
  }

  async getVirtualTransactionByDepositId(depositId: string) {
    return this.virtualTransactionModel.findOne({
      depositOrder: depositId,
      status: VirtualTransactionStatus.PENDING
    })
  }

  async updateTransaction(
    transactionId: string,
    updateVirtualTransactionDto: UpdateVirtualTransactionDto
  ) {
    return this.virtualTransactionModel.findByIdAndUpdate(
      transactionId,
      updateVirtualTransactionDto,
      {
        new: true
      }
    )
  }

  async createTransaction(
    createVirtualTransactionDto: CreateVirtualTransactionDto
  ) {
    return this.virtualTransactionModel.create(createVirtualTransactionDto)
  }

  async getPendingTransactionPayCash() {
    return this.virtualTransactionModel.find({
      status: VirtualTransactionStatus.PENDING,
      serviceCode: VirtualServiceCode.PAYCASH
    })
  }

  // Admin
  async virtualTransactionListing(
    isCounting = false,
    keyword = null,
    start = 0,
    length = 10,
    sortBy = '_id',
    sortType = 'asc'
  ) {
    try {
      const filter = {}
      if (keyword) {
        filter['$or'] = [
          { reference: { $regex: new RegExp(`.*${keyword}.*`, 'i') } },
          { content: { $regex: new RegExp(`.*${keyword}.*`, 'i') } }
        ]
      }

      if (isCounting) {
        return await this.virtualTransactionModel.countDocuments(filter)
      }

      const sortObj = {}
      sortObj[sortBy] = sortType

      if (length === -1) {
        return await this.virtualTransactionModel
          .find(filter)
          .populate('depositOrder')
          .sort(sortObj)
      }
      const list = await this.virtualTransactionModel
        .find(filter)
        .populate('depositOrder')
        .sort(sortObj)
        .limit(length)
        .skip(start)

      return list
    } catch (e) {
      throw e
    }
  }

  async deleteVirtualTransaction(id: string, userId: string) {
    const virtualTransaction = await this.virtualTransactionModel.findById(id)

    if (!virtualTransaction)
      throw new HttpException(
        'Virtual Transaction not found.',
        HttpStatus.NOT_FOUND
      )
    return virtualTransaction.updateOne({
      deleted: true,
      deletedBy: userId,
      deletedAt: new Date()
    })
  }
}
