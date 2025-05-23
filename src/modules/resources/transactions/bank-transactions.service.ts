import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  CreateTransactionDto,
  GetTransactionsQueriesDto
} from './dto/bank-transactions-request.dto'
import { BankTransaction } from '@/modules/resources/transactions/bank-transactions.interface'

@Injectable()
export class BankTransactionsService {
  constructor(
    @InjectModel('BankTransaction')
    private transactionModel: Model<BankTransaction>
  ) {}

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    try {
      const newTx = new this.transactionModel(createTransactionDto)
      return await newTx.save()
    } catch (error) {
      return false
    }
  }

  async getTransactionsForAdmin(
    getTransactionsQueriesDto: GetTransactionsQueriesDto
  ) {
    const offset = getTransactionsQueriesDto.offset || 0
    const limit = getTransactionsQueriesDto.limit || 10

    const options = {
      skip: offset,
      limit,
      sort: {
        createdAt: -1
      }
    }

    const queries = {}

    if (getTransactionsQueriesDto?.type) {
      queries['transactionType'] = getTransactionsQueriesDto.type
    }

    const total = await this.transactionModel.countDocuments(queries)

    const transactions = await this.transactionModel.find(
      queries,
      null,
      options
    )

    return {
      total,
      offset,
      limit,
      data: transactions
    }
  }
  async getTransactionDetailForAdmin(transactionId: string) {
    const transaction = await this.transactionModel.findOne({
      _id: transactionId
    })

    if (!transaction) {
      throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND)
    }

    return transaction
  }

  async getTransactionByOrderId(orderId: string) {
    return this.transactionModel.findOne({
      deposit: orderId
    })
  }

  async transactionListing(
    isCounting = false,
    keyword = null,
    type = '-1',
    isMatched = '-1',
    startDate = null,
    endDate = null,
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

      if (type !== '-1') {
        filter['transactionType'] = type
      }

      if (isMatched !== '-1') {
        filter['isMatched'] = isMatched === '1'
      }

      if (startDate) {
        filter['created_time'] = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }

      console.log(filter)

      if (isCounting) {
        return await this.transactionModel.countDocuments(filter)
      }

      const sortObj = {}
      sortObj[sortBy] = sortType

      if (length === -1) {
        return await this.transactionModel
          .find(filter)
          .populate('deposit')
          .populate('withdrawal')
          .sort(sortObj)
      }
      const list = await this.transactionModel
        .find(filter)
        .populate('deposit')
        .populate('withdrawal')
        .sort(sortObj)
        .limit(length)
        .skip(start)

      return list.map((item) => {
        return {
          ...item.toJSON(),
          display: `${item.reference} - ${item.bankName} - ${item.bankAccount}`
        }
      })
    } catch (e) {
      throw e
    }
  }

  async deleteTransaction(transactionId: string, userId: string) {
    const transaction = await this.transactionModel.findByIdAndDelete(
      transactionId
    )
    if (!transaction) {
      throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND)
    }
    return transaction.updateOne({
      deleted: true,
      deletedAt: new Date(),
      deletedBy: userId
    })
  }
}
