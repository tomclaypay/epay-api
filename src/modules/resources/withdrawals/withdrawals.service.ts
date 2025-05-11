import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import fetch from 'node-fetch'
import { Model } from 'mongoose'
import { OrderStatus } from '../../common/dto/general.dto'
import { Withdrawal } from './withdrawals.interface'
import { fibonacci, generateCode, sleep } from '@/utils/common'
import {
  CreateWithdrawalOrderDto,
  GetWithdrawalsQueriesDto,
  UpdateWithdrawalOrderDto
} from './dto/withdrawal-request.dto'
import { find, pick, sumBy } from 'lodash'
import { SettingsService } from '../settings/settings.service'
import { ConfigService } from '@nestjs/config'
import { GetSummaryQueriesDto } from '../../aggregators/admins/dto/admin-request.dto'
import { NotificationsService } from '@/modules/shared/notifications/notifications.service'

@Injectable()
export class WithdrawalsService implements OnModuleInit {
  constructor(
    @InjectModel('Withdrawal') private withdrawalModel: Model<Withdrawal>,
    private readonly settingsService: SettingsService,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService
  ) {}

  async onModuleInit() {}

  async createWithdrawalOrder(
    createWithdrawalOrderDto: CreateWithdrawalOrderDto
  ) {
    const settings = await this.settingsService.getSettings()
    //Delete tab and space in bank account name and number
    createWithdrawalOrderDto.bankAccountNameDest =
      createWithdrawalOrderDto.bankAccountNameDest.replace(/\s+/g, ' ').trim()
    createWithdrawalOrderDto.bankAccountNumberDest =
      createWithdrawalOrderDto.bankAccountNumberDest.replace(/\s+/g, ' ').trim()
    //

    //Round the withdrawal amount
    createWithdrawalOrderDto.amount = Math.floor(
      createWithdrawalOrderDto.amount
    )

    if (
      createWithdrawalOrderDto.amount < settings.minWithdrawalAmount ||
      createWithdrawalOrderDto.amount > settings.maxWithdrawalAmount
    )
      throw new HttpException(
        `Withdrawal amount not valid. Amount must be greater than ${settings.minWithdrawalAmount} and less than ${settings.maxWithdrawalAmount}.`,
        HttpStatus.BAD_REQUEST
      )

    let attempts = 0
    while (attempts < 3) {
      try {
        const code = await generateCode()
        const newOrder = new this.withdrawalModel({
          ...createWithdrawalOrderDto,
          code
        })
        await newOrder.save()

        return newOrder
      } catch (error) {
        console.log(error.message)

        attempts += 1
      }
    }
    throw new HttpException(
      'Create wothdrawal order fail',
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }

  async updateWithdrawalOrder(
    orderId: string,
    updateWithdrawalOrderDto: UpdateWithdrawalOrderDto
  ) {
    return this.withdrawalModel.findByIdAndUpdate(
      orderId,
      updateWithdrawalOrderDto,
      { new: true }
    )
  }

  async getWithdrawalsForExternal(
    getWithdrawalsQueriesDto: GetWithdrawalsQueriesDto
  ) {
    const offset = getWithdrawalsQueriesDto.offset || 0
    const limit = getWithdrawalsQueriesDto.limit || 10

    const options = {
      skip: offset,
      limit,
      sort: {
        createdAt: -1
      }
    }

    const queries = pick(getWithdrawalsQueriesDto, 'status')

    const total = await this.withdrawalModel.countDocuments(queries)

    const withdrawals = await this.withdrawalModel
      .find(queries, null, options)
      .select('-bankNameSrc -bankAccountSrc -note -isManual -transaction -fee')

    return {
      total,
      offset,
      limit,
      data: withdrawals
    }
  }

  async getWithdrawalDetailForExternal(withdrawalId: string) {
    const withdrawal = await this.withdrawalModel
      .findById(withdrawalId)
      .select('-bankNameSrc -bankAccountSrc -note -isManual -transaction -fee')

    if (!withdrawal) {
      throw new HttpException(
        'Withdrawal order not found',
        HttpStatus.NOT_FOUND
      )
    }

    return withdrawal
  }

  async getWithdrawalDetailForAdmin(withdrawalId: string) {
    const withdrawal = await this.withdrawalModel.findById(withdrawalId)

    if (!withdrawal) {
      throw new HttpException('Withdrawal not found', HttpStatus.NOT_FOUND)
    }

    return withdrawal
  }

  async getWithdrawalOrderById(orderId: string) {
    return this.withdrawalModel.findById(orderId)
  }

  async getWithdrawalOrderByVirtualId(virtualId: string) {
    return this.withdrawalModel.findOne({ virtualTransaction: virtualId })
  }

  async manualWithdrawal(
    username: string,
    withdrawalId: string,
    transactionId: string,
    bankNameSrc: string,
    bankAccountSrc: string,
    actualAmount: number
  ) {
    const now = new Date()
    const note = `User ${username} cập nhật giao dịch thủ công vào lúc ${now.toLocaleString(
      'vi-VN'
    )}`

    const settings = await this.settingsService.getSettings()
    const fee =
      settings.withdrawFeeFlat + actualAmount * settings.withdrawFeePct

    const updateData = {
      bankNameSrc,
      bankAccountSrc,
      fee,
      transaction: transactionId,
      status: OrderStatus.Succeed,
      isManual: true,
      manualBy: username,
      manualAt: now,
      note
    }

    const withdrawal = await this.withdrawalModel.findOneAndUpdate(
      {
        _id: withdrawalId,
        status: OrderStatus.Pending
      },
      updateData,
      { new: true }
    )

    if (!withdrawal) {
      throw new HttpException('Cannot manual withdraw', HttpStatus.BAD_REQUEST)
    }

    this.sendWithdrawalCallback(
      withdrawal.callback,
      'WITHDRAWAL',
      withdrawal.id,
      withdrawal.ref,
      withdrawal.status,
      withdrawal.amount,
      withdrawal.note
    )

    const telegramMsg = `<b>[INFO] [WITHDRAWAL] [MANUAL]</b>%0A
    bankName: ${withdrawal.bankNameSrc}%0A
    bankAccount: ${withdrawal.bankAccountSrc}%0A
    code: ${withdrawal.code}%0A
    ref: ${withdrawal.ref}%0A
    amount: ${withdrawal.amount.toLocaleString()}%0A
    transaction: ${withdrawal.transaction}%0A
    username: ${username}`

    this.notificationsService.sendTelegramMessage(
      telegramMsg.replace(/  /g, '')
    )

    return withdrawal
  }

  async updateWithdrawalStatus(
    username: string,
    withdrawalId: string,
    status: string,
    note: string
  ) {
    const now = new Date()

    const updateData = {
      status,
      isManual: true,
      manualBy: username,
      manualAt: now,
      note
    }

    const withdrawal = await this.withdrawalModel.findOneAndUpdate(
      {
        _id: withdrawalId,
        status: { $ne: OrderStatus.Succeed }
      },
      updateData,
      { new: true }
    )

    if (!withdrawal) {
      throw new HttpException(
        'Cannot update withdraw status',
        HttpStatus.BAD_REQUEST
      )
    }

    this.sendWithdrawalCallback(
      withdrawal.callback,
      'WITHDRAWAL',
      withdrawal.id,
      withdrawal.ref,
      withdrawal.status,
      withdrawal.amount,
      withdrawal.note
    )

    const telegramMsg = `<b>[INFO] [WITHDRAWAL] [UPDATE-STATUS]</b>%0A
    code: ${withdrawal.code}%0A
    ref: ${withdrawal.ref}%0A
    status: ${withdrawal.status}%0A
    username: ${username}`

    this.notificationsService.sendTelegramMessage(
      telegramMsg.replace(/  /g, '')
    )

    return 'succeed'
  }

  async matchWithdrawOrder(
    txId: string,
    content: string,
    bankNameSrc: string,
    bankAccountSrc: string
  ) {
    const txs = await this.withdrawalModel.find({
      status: OrderStatus.Succeed
    })
    const tx = find(txs, function (tx) {
      return content.includes(tx.code)
    })
    if (tx) {
      const settings = await this.settingsService.getSettings()
      const fee = settings.withdrawFeeFlat + tx.amount * settings.withdrawFeePct

      tx.bankNameSrc = bankNameSrc
      tx.bankAccountSrc = bankAccountSrc

      tx.status = OrderStatus.Succeed
      tx.transaction = txId
      tx.fee = fee
      await tx.save()
      return tx
    }
    return false
  }

  async sendWithdrawalCallback(
    url: string,
    orderType: string,
    orderId: string,
    orderRef: string,
    orderStatus: string,
    orderAmount: number,
    reason: string = ''
  ) {
    const bodyData = {
      orderType,
      orderId,
      orderRef,
      orderStatus,
      orderAmount,
      reason,
      secretKey: this.configService.get('CALLBACK_SECRET_KEY')
    }
    const fibs = fibonacci(5)

    for (const key in fibs) {
      if (Object.prototype.hasOwnProperty.call(fibs, key)) {
        const fib = fibs[key]
        try {
          const resData = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyData),
            timeout: 10000
          })

          if (resData.ok) {
            console.log('Send callback succeed.')
            return
          }
        } catch (error) {
          console.log(error.message)
        }

        sleep(fib * 1000)
      }
    }
  }

  async resendWithdrawalCallback(withdrawalId: string) {
    const withdrawal = await this.withdrawalModel.findById(withdrawalId)

    if (!withdrawalId) {
      throw new HttpException(
        'Withdrawal Order not found',
        HttpStatus.NOT_FOUND
      )
    }
    this.sendWithdrawalCallback(
      withdrawal.callback,
      'WITHDRAWAL',
      withdrawal.id,
      withdrawal.ref,
      withdrawal.status,
      withdrawal.amount,
      withdrawal.note
    )
    return 'succeed'
  }

  async withdrawalListing(
    isCounting = false,
    keyword = null,
    isManual = '-1',
    status = '-1',
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
          { code: { $regex: new RegExp(`.*${keyword}.*`, 'i') } },
          { ref: { $regex: new RegExp(`.*${keyword}.*`, 'i') } },
          { mt5Id: { $regex: new RegExp(`.*${keyword}.*`, 'i') } }
        ]
      }

      if (status !== '-1') {
        filter['status'] = status
      }

      if (startDate) {
        filter['createdAt'] = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }

      if (isManual !== '-1') {
        filter['isManual'] = isManual === 'manual' ? true : false
      }

      console.log(filter)

      if (isCounting) {
        return await this.withdrawalModel.countDocuments(filter)
      }

      const sortObj = {}
      sortObj[sortBy] = sortType

      if (length === -1) {
        return await this.withdrawalModel
          .find(filter)
          .populate('transaction')
          .sort(sortObj)
      }
      return await this.withdrawalModel
        .find(filter)
        .populate('transaction')
        .sort(sortObj)
        .limit(length)
        .skip(start)
    } catch (e) {
      throw e
    }
  }

  async getSummaryForAdmin(getSummaryQueriesDto: GetSummaryQueriesDto) {
    // return Promise.all([
    //   this.getSucceedWithdrawalTotal(getSummaryQueriesDto),
    //   this.getPendingWithdrawalTotal(getSummaryQueriesDto),
    //   this.getSucceedWithdrawalTotalAmount(getSummaryQueriesDto),
    //   this.getSucceedWithdrawalTotalFee(getSummaryQueriesDto)
    // ])

    const withdrawals = await this.withdrawalModel.find({
      createdAt: {
        $gte: new Date(getSummaryQueriesDto.startDate),
        $lt: new Date(getSummaryQueriesDto.endDate)
      },
      status: {
        $in: [OrderStatus.Succeed, OrderStatus.Pending]
      }
    })

    const succeedWithdrawals = withdrawals.filter(
      (withdrawal) => withdrawal.status === OrderStatus.Succeed
    )

    const succeedWithdrawalTotalAmount =
      sumBy(succeedWithdrawals, 'amount') || 0

    const succeedWithdrawalTotalFee = sumBy(succeedWithdrawals, 'fee') || 0

    return [
      withdrawals.length,
      withdrawals.length - succeedWithdrawals.length,
      succeedWithdrawalTotalAmount,
      succeedWithdrawalTotalFee
    ]
  }

  async getSucceedWithdrawalTotal(getSummaryQueriesDto: GetSummaryQueriesDto) {
    return this.withdrawalModel.countDocuments({
      createdAt: {
        $gte: new Date(getSummaryQueriesDto.startDate),
        $lt: new Date(getSummaryQueriesDto.endDate)
      },
      status: OrderStatus.Succeed
    })
  }

  async getPendingWithdrawalTotal(getSummaryQueriesDto: GetSummaryQueriesDto) {
    return this.withdrawalModel.countDocuments({
      createdAt: {
        $gte: new Date(getSummaryQueriesDto.startDate),
        $lt: new Date(getSummaryQueriesDto.endDate)
      },
      status: OrderStatus.Pending
    })
  }

  async getSucceedWithdrawalTotalAmount(
    getSummaryQueriesDto: GetSummaryQueriesDto
  ) {
    const succeedWithdrawals = await this.withdrawalModel.find({
      createdAt: {
        $gte: new Date(getSummaryQueriesDto.startDate),
        $lt: new Date(getSummaryQueriesDto.endDate)
      },
      status: OrderStatus.Succeed
    })

    return sumBy(succeedWithdrawals, 'amount') || 0
  }

  async getSucceedWithdrawalTotalFee(
    getSummaryQueriesDto: GetSummaryQueriesDto
  ) {
    const succeedWithdrawals = await this.withdrawalModel.find({
      createdAt: {
        $gte: new Date(getSummaryQueriesDto.startDate),
        $lt: new Date(getSummaryQueriesDto.endDate)
      },
      status: OrderStatus.Succeed
    })

    return sumBy(succeedWithdrawals, 'fee') || 0
  }

  async getPendingWithdrawals() {
    return this.withdrawalModel.find({
      status: OrderStatus.Pending
    })
  }

  async getWithdrawalTotalBalance() {
    const succeedWithdrawals = await this.withdrawalModel.find({
      status: OrderStatus.Succeed
    })

    const amount = sumBy(succeedWithdrawals, 'amount') || 0
    const fee = sumBy(succeedWithdrawals, 'fee') || 0
    return amount + fee
  }

  async getWithdrawalTotalBalanceByDate(
    getSummaryQueriesDto: GetSummaryQueriesDto
  ) {
    const succeedWithdrawals = await this.withdrawalModel.find({
      updatedAt: {
        $gte: new Date(getSummaryQueriesDto.startDate),
        $lt: new Date(getSummaryQueriesDto.endDate)
      },
      status: OrderStatus.Succeed
    })

    const amount = sumBy(succeedWithdrawals, 'amount') || 0
    const fee = sumBy(succeedWithdrawals, 'fee') || 0
    return {
      balance: amount + fee,
      totalAmount: amount,
      totalFee: fee
    }
  }

  async deleteWithdrawal(id: string, userId: string) {
    const withdrawal = await this.withdrawalModel.findById(id)
    if (!withdrawal)
      throw new HttpException('Withdrawal not found', HttpStatus.NOT_FOUND)
    await withdrawal.updateOne({
      deleted: true,
      deletedBy: userId,
      deletedAt: new Date()
    })
  }
}
