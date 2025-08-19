import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Cashout } from './cashouts.interface'
import {
  CreateCashoutOrderByUserDto,
  CreateCashoutOrderDto,
  UpdateCashoutOrderDto
} from './dto/cashout-request.dto'
import { SettingsService } from '../settings/settings.service'
import { GetSummaryQueriesDto } from '@/modules/aggregators/admins/dto/admin-request.dto'
import { sumBy } from 'lodash'
import { CashoutStatus } from '@/modules/common/dto/general.dto'

@Injectable()
export class CashoutsService implements OnModuleInit {
  constructor(
    @InjectModel('Cashout') private cashoutModel: Model<Cashout>,
    private readonly settingsService: SettingsService
  ) {}

  async onModuleInit() {}

  async cashoutListing(
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
        filter['ref'] = { $regex: new RegExp(`.*${keyword}.*`, 'i') }
      }

      if (isCounting) {
        return await this.cashoutModel.countDocuments(filter)
      }

      const sortObj = {}
      sortObj[sortBy] = sortType

      if (length === -1) {
        return await this.cashoutModel.find(filter).sort(sortObj)
      }
      return await this.cashoutModel
        .find(filter)
        .sort(sortObj)
        .limit(length)
        .skip(start)
    } catch (e) {
      throw e
    }
  }

  async createCashoutOrder(createCashoutOrderDto: CreateCashoutOrderDto) {
    const settings = await this.settingsService.getSettings()
    const fee = createCashoutOrderDto.isCrypto
      ? createCashoutOrderDto.fee || 0
      : settings.cashoutFeeFlat +
        createCashoutOrderDto.amount * settings.cashoutFeePct
    const newOrder = new this.cashoutModel({
      ...createCashoutOrderDto,
      fee,
      status: CashoutStatus.Canceled
    })
    return newOrder.save()
  }

  async createCashoutOrderByUser(
    createCashoutOrderByUserDto: CreateCashoutOrderByUserDto
  ) {
    const settings = await this.settingsService.getSettings()
    const fee =
      settings.cashoutFeeFlat +
      createCashoutOrderByUserDto.amount * settings.cashoutFeePct
    const newOrder = new this.cashoutModel({
      ...createCashoutOrderByUserDto,
      fee,
      status: CashoutStatus.Pending
    })
    return newOrder.save()
  }

  async updateCashoutOrder(
    cashoutId: string,
    updateCashoutOrderDto: UpdateCashoutOrderDto,
    userId: string
  ) {
    const fee = updateCashoutOrderDto.fee
    // if (updateCashoutOrderDto.amount && !updateCashoutOrderDto.isCrypto) {
    //   const settings = await this.settingsService.getSettings()
    //   fee =
    //     settings.cashoutFeeFlat +
    //     updateCashoutOrderDto.amount * settings.cashoutFeePct
    //     if(fee !==)
    // }
    return await this.cashoutModel.findOneAndUpdate(
      {
        _id: cashoutId
      },
      {
        ...updateCashoutOrderDto,
        fee,
        updatedBy: userId
      },
      { new: true }
    )
  }

  async getSummaryForAdmin(getSummaryQueriesDto: GetSummaryQueriesDto) {
    // return Promise.all([
    //   this.getCashoutTotal(getSummaryQueriesDto),
    //   this.getCashoutTotalAmount(getSummaryQueriesDto),
    //   this.getCashoutTotalFee(getSummaryQueriesDto)
    // ])

    const cashouts = await this.cashoutModel.find({
      createdAt: {
        $gte: new Date(getSummaryQueriesDto.startDate),
        $lt: new Date(getSummaryQueriesDto.endDate)
      },
      isCrypto: getSummaryQueriesDto.isCrypto,
      status: CashoutStatus.Completed
    })

    const cashoutsTotalAmount = sumBy(cashouts, 'amount') || 0

    const cashoutsTotalFee = sumBy(cashouts, 'fee') || 0
    return [cashouts.length, cashoutsTotalAmount, cashoutsTotalFee]
  }

  async getCashoutTotal(getSummaryQueriesDto: GetSummaryQueriesDto) {
    return this.cashoutModel.countDocuments({
      createdAt: {
        $gte: new Date(getSummaryQueriesDto.startDate),
        $lt: new Date(getSummaryQueriesDto.endDate)
      },
      isCrypto: getSummaryQueriesDto.isCrypto,
      status: CashoutStatus.Completed
    })
  }

  async getCashoutTotalFee(getSummaryQueriesDto: GetSummaryQueriesDto) {
    const cashouts = await this.cashoutModel.find({
      createdAt: {
        $gte: new Date(getSummaryQueriesDto.startDate),
        $lt: new Date(getSummaryQueriesDto.endDate)
      },
      isCrypto: getSummaryQueriesDto.isCrypto,
      status: CashoutStatus.Completed
    })

    return sumBy(cashouts, 'fee') || 0
  }

  async getCashoutTotalAmount(getSummaryQueriesDto: GetSummaryQueriesDto) {
    const cashouts = await this.cashoutModel.find({
      createdAt: {
        $gte: new Date(getSummaryQueriesDto.startDate),
        $lt: new Date(getSummaryQueriesDto.endDate)
      },
      isCrypto: getSummaryQueriesDto.isCrypto,
      status: CashoutStatus.Completed
    })

    return sumBy(cashouts, 'amount') || 0
  }

  async getCashoutTotalBalance(isCrypto: boolean) {
    const succeedCashouts = await this.cashoutModel.find({
      isCrypto: isCrypto,
      status: CashoutStatus.Completed
    })

    const amount = sumBy(succeedCashouts, 'amount') || 0
    const fee = sumBy(succeedCashouts, 'fee') || 0
    return amount + fee
  }

  async getCashoutTotalBalanceByDate(
    getSummaryQueriesDto: GetSummaryQueriesDto
  ) {
    const cashouts = await this.cashoutModel.find({
      updatedAt: {
        $gte: new Date(getSummaryQueriesDto.startDate),
        $lt: new Date(getSummaryQueriesDto.endDate)
      },
      isCrypto: getSummaryQueriesDto.isCrypto,
      status: CashoutStatus.Completed
    })

    const amount = sumBy(cashouts, 'amount') || 0
    const fee = sumBy(cashouts, 'fee') || 0
    return {
      balance: amount + fee,
      totalAmount: amount,
      totalFee: fee
    }
  }

  async deleteCashout(cashoutId: string, userId: string) {
    const cashout = await this.cashoutModel.findById(cashoutId)
    if (!cashout) {
      throw new HttpException('Cashout not found', HttpStatus.NOT_FOUND)
    }
    return cashout.updateOne({
      deleted: true,
      deletedAt: new Date(),
      deletedBy: userId
    })
  }
}
