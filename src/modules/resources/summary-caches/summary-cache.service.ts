import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { SummaryCache } from './summary-cache.interface'
import { CreateSummaryCacheDto } from './dto/summary-cache.dto'
import moment from 'moment'

@Injectable()
export class SummaryCachesService {
  constructor(
    @InjectModel('SummaryCache') private summaryCacheModel: Model<SummaryCache>
  ) {}

  async getLastSummaryCache(cacheDate: Date) {
    const lastSummaryCacheData = await this.summaryCacheModel
      .findOne({ cacheTime: { $lt: cacheDate } })
      .sort({ createdAt: -1 })

    if (!lastSummaryCacheData) {
      return {
        balance: 0,
        totalDepositAmount: 0,
        totalWithdrawalAmount: 0,
        totalCashoutAmount: 0,
        totalDepositFee: 0,
        totalWithdrawalFee: 0,
        totalCashoutFee: 0,
        cacheTime: moment().subtract(5, 'years').toDate()
      }
    }
    return lastSummaryCacheData
  }

  async getSummaryCacheByCacheTime(cacheTime: Date) {
    return this.summaryCacheModel.findOne({ cacheTime })
  }

  async createSummaryCache(createSummaryCacheDto: CreateSummaryCacheDto) {
    return this.summaryCacheModel.create(createSummaryCacheDto)
  }
}
