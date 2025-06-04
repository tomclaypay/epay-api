import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import fetch from 'node-fetch'
import { randomInt } from 'crypto'
import * as CryptoJS from 'crypto-js'
import { pick, find, sumBy } from 'lodash'
import { Model } from 'mongoose'
import { Deposit } from './deposits.interface'
import {
  CreateDepositOrderDto,
  GetDepositsQueriesDto,
  UpdateDepositOrderDto
} from './dto/deposit-request.dto'
import {
  fibonacci,
  generateVietQRURL,
  sendTelegramMessage,
  sleep
} from '@/utils/common'
import moment from 'moment'
import { ConfigService } from '@nestjs/config'
import { DepositOrderType, OrderStatus } from '@/modules/common/dto/general.dto'
import { GetSummaryQueriesDto } from '@/modules/aggregators/admins/dto/admin-request.dto'
import { SettingsService } from '../settings/settings.service'
import { NotificationsService } from '@/modules/shared/notifications/notifications.service'
import { VirtualTransactionsService } from '../virtual-transactions/virtual-transactions.service'
import {
  VirtualServiceCode,
  VirtualTransactionStatus
} from '../virtual-transactions/dto/general.dto'
import { VicaAdaptersService } from '@/modules/adapters/vica-adapters/vica-adapters.service'
import { Setting } from '../settings/settings.interface'
import { VirtualType } from '@/modules/resources/settings/dto/general.dto'
import { BankTransactionsService } from '@/modules/resources/transactions/bank-transactions.service'

@Injectable()
export class DepositsService implements OnModuleInit {
  private merchantId = ''
  private encryptKey = ''
  private virtualBaseUrl = ''
  private virtualPartnerCode = ''
  private virtualApiKey = ''
  private virtualPublicKey = ''
  private virtualNotifyUrl = ''
  private virtualAccountName = ''
  private virtualBankCode = ''
  private xenditCustomerId = ''
  private xenditCallbackUrl = ''
  private xenditChannelCode = ''
  private xenditKey = ''

  private vov5CreateCallbackUrl = ''

  constructor(
    @InjectModel('Deposit') private depositOrderModel: Model<Deposit>,
    private readonly settingsService: SettingsService,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
    private readonly virtualTransactionsService: VirtualTransactionsService,
    private readonly vicaAdaptersService: VicaAdaptersService,
    private readonly bankTransactionsService: BankTransactionsService
  ) {}

  async onModuleInit() {
    this.merchantId = this.configService.get('MERCHANT_ID')
    this.encryptKey = this.configService.get('ENCRYPT_KEY')
    this.virtualBaseUrl = this.configService.get('VIRTUAL_BASE_URL')
    this.virtualApiKey = this.configService.get('VIRTUAL_API_KEY')
    this.virtualPartnerCode = this.configService.get('VIRTUAL_PARTNER_CODE')
    this.virtualPublicKey = this.configService.get('VIRTUAL_PUBLIC_KEY')
    this.virtualNotifyUrl = this.configService.get('VIRTUAL_NOTIFY_URL')
    this.virtualAccountName = this.configService.get('VIRTUAL_ACCOUNT_NAME')
    this.virtualBankCode = this.configService.get('VIRTUAL_BANK_CODE')
    this.xenditCustomerId = this.configService.get('XENDIT_CUSTOMER_ID')
    this.xenditCallbackUrl = this.configService.get('XENDIT_CALLBACK_URL')
    this.xenditChannelCode = this.configService.get('XENDIT_CHANNEL_CODE')
    this.xenditKey = this.configService.get('XENDIT_KEY')

    this.vov5CreateCallbackUrl = this.configService.get(
      'VOV5_CREATE_CALLBACK_URL'
    )
  }

  async getSucceedOrders() {
    return this.depositOrderModel.find({ status: OrderStatus.Succeed })
  }

  async getOrderById(orderId: string) {
    return this.depositOrderModel.findById(orderId)
  }

  async updateDepositOrder(
    orderId: string,
    updateDepositOrderDto: UpdateDepositOrderDto
  ) {
    return this.depositOrderModel.findByIdAndUpdate(
      orderId,
      updateDepositOrderDto,
      { new: true }
    )
  }

  //Admin
  async getDepositsForAdmin(getDepositsQueriesDto: GetDepositsQueriesDto) {
    const offset = getDepositsQueriesDto.offset || 0
    const limit = getDepositsQueriesDto.limit || 10

    const options = {
      skip: offset,
      limit,
      sort: {
        createdAt: -1
      }
    }

    const queries = pick(getDepositsQueriesDto, 'status')

    const total = await this.depositOrderModel.countDocuments(queries)

    const deposits = await this.depositOrderModel.find(queries, null, options)
    // .populate({
    //   path: 'transaction',
    //   select:
    //     '_id bankName bankAccount transactionType content code reference amount transactionTime'
    // })

    return {
      total,
      offset,
      limit,
      data: deposits
    }
  }

  async depositListing(
    isCounting = false,
    keyword = null,
    isManual = '-1',
    status = '-1',
    startDate = null,
    endDate = null,
    type = '-1',
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
      if (type !== '-1') {
        filter['orderType'] = type
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

      if (isCounting) {
        return await this.depositOrderModel.countDocuments(filter)
      }

      const sortObj = {}
      sortObj[sortBy] = sortType

      if (length === -1) {
        return await this.depositOrderModel
          .find(filter)
          .populate('transaction')
          .populate('bankTransactions')
          .sort(sortObj)
      }
      return await this.depositOrderModel
        .find(filter)
        .populate('transaction')
        .populate('bankTransactions')
        .sort(sortObj)
        .limit(length)
        .skip(start)
    } catch (e) {
      throw e
    }
  }

  async getDepositDetailForAdmin(depositId: string) {
    const deposit = await this.depositOrderModel.findById(depositId)

    if (!deposit) {
      throw new HttpException('Deposit not found', HttpStatus.NOT_FOUND)
    }

    return deposit
  }

  async getDepositDetailForSystem(orderCode: string) {
    const deposit = await this.depositOrderModel
      .findOne({ code: orderCode })
      .populate('virtualTransactions')
    return deposit
  }

  async resendDepositCallback(depositId: string) {
    const deposit = await this.depositOrderModel.findById(depositId)

    let transaction = null
    if (deposit.orderType === DepositOrderType.BANK) {
      transaction = await this.bankTransactionsService.getTransactionByOrderId(
        depositId
      )
    } else {
      transaction =
        await this.virtualTransactionsService.getTransactionByOrderId(depositId)
    }

    if (!deposit) {
      throw new HttpException('Deposit not found', HttpStatus.NOT_FOUND)
    }
    this.sendDepositCallback(
      deposit.callback,
      'DEPOSIT',
      deposit.id,
      deposit.ref,
      deposit.code,
      deposit.status,
      deposit.actualAmount,
      deposit.note,
      transaction?.bankAccountNo
        ? transaction?.bankAccountNo
        : transaction?.bankAccount
    )
    return {
      status: 'succeed'
    }
  }

  async manualDeposit(
    username: string,
    depositId: string,
    actualAmount: number,
    transactionId: string
  ) {
    const now = new Date()
    const note = `User ${username} cập nhật giao dịch thủ công vào lúc ${now.toLocaleString(
      'vi-VN'
    )}`

    const settings = await this.settingsService.getSettings()
    const fee = settings.depositFeeFlat + actualAmount * settings.depositFeePct

    const updateData = {
      actualAmount,
      fee,
      // transaction: transactionId,
      bankTransactions: [transactionId],
      status: OrderStatus.Succeed,
      isManual: true,
      manualBy: username,
      manualAt: now,
      note
    }

    const deposit = await this.depositOrderModel.findOneAndUpdate(
      {
        _id: depositId,
        status: { $ne: OrderStatus.Succeed }
      },
      updateData,
      { new: true }
    )

    if (!deposit) {
      throw new HttpException('Cannot manual deposit', HttpStatus.BAD_REQUEST)
    }

    const transaction =
      await this.bankTransactionsService.getTransactionByOrderId(depositId)

    this.sendDepositCallback(
      deposit.callback,
      'DEPOSIT',
      deposit.id,
      deposit.ref,
      deposit.code,
      deposit.status,
      deposit.actualAmount,
      deposit.note,
      transaction?.bankAccount
    )

    const telegramMsg = `<b>[INFO] [DEPOSIT] [MANUAL]</b>%0A
    code: ${deposit.code}%0A
    ref: ${deposit.ref}%0A
    amount: ${deposit.amount.toLocaleString()}%0A
    actualAmount: ${deposit.actualAmount.toLocaleString()}%0A
    username: ${username}`

    this.notificationsService.sendTelegramMessage(
      telegramMsg.replace(/  /g, '')
    )
    return deposit
  }

  async manualDepositWithManyTransactions(
    username: string,
    depositId: string,
    actualAmount: number,
    transactionIds: string[]
  ) {
    console.log(transactionIds)

    const now = new Date()
    const note = `User ${username} cập nhật giao dịch thủ công vào lúc ${now.toLocaleString(
      'vi-VN'
    )}`

    const settings = await this.settingsService.getSettings()
    const fee = settings.depositFeeFlat + actualAmount * settings.depositFeePct

    const updateData = {
      actualAmount,
      fee,
      bankTransactions: transactionIds,
      status: OrderStatus.Succeed,
      isManual: true,
      manualBy: username,
      manualAt: now,
      note
    }

    const deposit = await this.depositOrderModel.findOneAndUpdate(
      {
        _id: depositId,
        status: { $ne: OrderStatus.Succeed }
      },
      updateData,
      { new: true }
    )

    if (!deposit) {
      throw new HttpException('Cannot manual deposit', HttpStatus.BAD_REQUEST)
    }

    const transaction =
      await this.bankTransactionsService.getTransactionByOrderId(depositId)

    this.sendDepositCallback(
      deposit.callback,
      'DEPOSIT',
      deposit.id,
      deposit.ref,
      deposit.code,
      deposit.status,
      deposit.actualAmount,
      deposit.note,
      transaction.bankAccount
    )

    const telegramMsg = `<b>[INFO] [DEPOSIT] [MANUAL]</b>%0A
    code: ${deposit.code}%0A
    ref: ${deposit.ref}%0A
    amount: ${deposit.amount.toLocaleString()}%0A
    actualAmount: ${deposit.actualAmount.toLocaleString()}%0A
    username: ${username}`

    this.notificationsService.sendTelegramMessage(
      telegramMsg.replace(/  /g, '')
    )
    return deposit
  }

  async verifyDeposit(username: string, depositId: string) {
    const now = new Date()
    const note = `User ${username} xác minh giao dịch vào lúc ${now.toLocaleString(
      'vi-VN'
    )}`

    const updateData = {
      status: OrderStatus.Succeed,
      note
    }

    const deposit = await this.depositOrderModel.findOneAndUpdate(
      {
        _id: depositId
      },
      updateData,
      { new: true }
    )

    if (!deposit) {
      throw new HttpException('Cannot verify deposit', HttpStatus.BAD_REQUEST)
    }

    const telegramMsg = `<b>[INFO] [DEPOSIT] [VERIFY-ORDER]</b>%0A
    code: ${deposit.code}%0A
    ref: ${deposit.ref}%0A
    amount: ${deposit.amount.toLocaleString()}%0A
    actualAmount: ${deposit.actualAmount.toLocaleString()}%0A
    username: ${username}`

    this.notificationsService.sendTelegramMessage(
      telegramMsg.replace(/  /g, '')
    )
    this.sendDepositCallback(
      deposit.callback,
      'DEPOSIT',
      deposit.id,
      deposit.ref,
      deposit.code,
      deposit.status,
      deposit.actualAmount,
      deposit.note
    )
    return {
      status: 'succeed'
    }
  }

  // API
  async getDepositsForExternal(getDepositsQueriesDto: GetDepositsQueriesDto) {
    const offset = getDepositsQueriesDto.offset || 0
    const limit = getDepositsQueriesDto.limit || 10

    const options = {
      skip: offset,
      limit,
      sort: {
        createdAt: -1
      }
    }

    const queries = pick(getDepositsQueriesDto, 'status')

    const total = await this.depositOrderModel.countDocuments(queries)

    const deposits = await this.depositOrderModel
      .find(queries, null, options)
      .select('-note -isManual -transaction -fee')

    return {
      total,
      offset,
      limit,
      data: deposits
    }
  }

  async getDepositDetailForExternal(depositId: string) {
    const deposit = await this.depositOrderModel
      .findById(depositId)
      .select('-note -isManual -transaction -fee')

    if (!deposit) {
      throw new HttpException('Deposit not found', HttpStatus.NOT_FOUND)
    }

    return deposit
  }

  async createDepositOrderForExternal(
    createDepositOrderDto: CreateDepositOrderDto
  ) {
    try {
      const settings = await this.settingsService.getSettings()
      //Delete spaces
      createDepositOrderDto.mt5Id = createDepositOrderDto.mt5Id
        ? createDepositOrderDto.mt5Id?.trim().split('\t')[0]
        : null

      //Round the deposit amount
      createDepositOrderDto.amount = Math.floor(createDepositOrderDto.amount)
      if (
        createDepositOrderDto.amount < settings.minDepositAmount ||
        createDepositOrderDto.amount > settings.maxDepositAmount
      )
        throw new HttpException(
          `Deposit amount not valid. Amount must be greater than ${settings.minDepositAmount} and less than ${settings.maxDepositAmount}.`,
          HttpStatus.BAD_REQUEST
        )
      if (settings.isVirtualEnabled) {
        return this.createDepositOrderWithVA(createDepositOrderDto, settings)
      }
      return this.createDepositOrderWithBank(createDepositOrderDto)
    } catch (error) {
      console.log(error)
      return error
    }
  }

  async createDepositOrderWithBank(
    createDepositOrderDto: CreateDepositOrderDto
  ) {
    let attempts = 0
    while (attempts < 3) {
      try {
        const code = await this.generateCode()
        const hashId = encodeURIComponent(
          CryptoJS.AES.encrypt(
            `${this.merchantId},${code}`,
            this.encryptKey
          ).toString()
        )
        console.log('hashid', hashId)
        const newOrder = new this.depositOrderModel({
          ...createDepositOrderDto,
          code,
          hashId,
          orderType: DepositOrderType.BANK
        })

        await newOrder.save()
        return pick(
          newOrder,
          'id',
          'amount',
          'code',
          'status',
          'ref',
          'hashId',
          'createdAt',
          'updatedAt'
        )
      } catch (error) {
        console.log(error.message)

        attempts += 1
      }
    }
    throw new HttpException(
      'Create deposits order fail',
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }

  async createDepositOrderWithVA(
    createDepositOrderDto: CreateDepositOrderDto,
    settings: Setting
  ) {
    try {
      let newOrder = null
      let attempts = 0
      while (attempts < 3) {
        try {
          const code = await this.generateCode()
          const hashId = encodeURIComponent(
            CryptoJS.AES.encrypt(
              `${this.merchantId},${code}`,
              this.encryptKey
            ).toString()
          )

          newOrder = await this.depositOrderModel.create({
            code: code,
            hashId,
            orderType: DepositOrderType.VIRTUAL,
            ...createDepositOrderDto
          })
          attempts = 4
        } catch (error) {
          console.log(error.message)
          attempts += 1
        }
      }

      if (!newOrder) {
        throw new HttpException('Create order fail', HttpStatus.BAD_GATEWAY)
      }

      const newTransaction =
        await this.virtualTransactionsService.createTransaction({
          depositOrder: newOrder.id,
          refId: newOrder.ref,
          serviceCode: VirtualServiceCode.COLLECTCASH,
          amount: newOrder.amount,
          returnUrl: createDepositOrderDto.callback,
          cancelUrl: createDepositOrderDto.callback
        })

      const virtualTypeSelected = createDepositOrderDto.type
        ? createDepositOrderDto.type
        : settings.isXenditEnabled
        ? VirtualType.XENDIT
        : settings.virtualType

      let collectCashOrderData: {
        isSucceed: boolean
        msg: any
        data: any
      }

      switch (virtualTypeSelected) {
        case VirtualType.XENDIT:
          collectCashOrderData =
            await this.vicaAdaptersService.createPaymentOrder(
              'VND',
              newOrder.amount,
              this.xenditCustomerId,
              newTransaction.id,
              this.xenditCallbackUrl,
              this.xenditChannelCode,
              this.virtualAccountName,
              newOrder.code,
              this.xenditKey
            )
          break
        case VirtualType.VOV5:
          collectCashOrderData = await this.vicaAdaptersService.createVAVov5(
            newTransaction.id,
            this.virtualAccountName,
            newOrder.amount,
            this.vov5CreateCallbackUrl,
            newOrder.code
          )
          break

        case VirtualType.VIRTUAL:
          collectCashOrderData =
            await this.vicaAdaptersService.createVirtualCollectCashOrder(
              this.virtualBaseUrl,
              this.virtualApiKey,
              this.virtualPartnerCode,
              this.virtualPublicKey,
              this.virtualAccountName,
              this.virtualBankCode,
              this.virtualNotifyUrl,
              newTransaction.id,
              newOrder.code,
              newOrder.amount,
              newOrder.code
            )

          break

        default:
          collectCashOrderData =
            await this.vicaAdaptersService.createVirtualCollectCashOrder(
              this.virtualBaseUrl,
              this.virtualApiKey,
              this.virtualPartnerCode,
              this.virtualPublicKey,
              this.virtualAccountName,
              this.virtualBankCode,
              this.virtualNotifyUrl,
              newTransaction.id,
              newOrder.code,
              newOrder.amount,
              newOrder.code
            )
          break
      }

      if (!collectCashOrderData.isSucceed) {
        throw new HttpException('Create order fail', HttpStatus.BAD_GATEWAY)
      }

      if (!collectCashOrderData.data.viertQr) {
        collectCashOrderData.data.viertQr = generateVietQRURL(
          collectCashOrderData.data.bankCode,
          collectCashOrderData.data.bankAccountNo,
          createDepositOrderDto.amount,
          collectCashOrderData.data.bankAccountName
        )
      }

      const updatedTransaction =
        await this.virtualTransactionsService.updateTransaction(
          newTransaction.id,
          {
            status: VirtualTransactionStatus.INITIAL,
            bankCode: collectCashOrderData.data.bankCode,
            bankName: collectCashOrderData.data.bankName,
            bankAccountNo: collectCashOrderData.data.bankAccountNo,
            bankAccountName: collectCashOrderData.data.bankAccountName,
            qrUrl: collectCashOrderData.data.viertQr
          }
        )
      const updatedOrder = await this.depositOrderModel.findByIdAndUpdate(
        newOrder.id,
        {
          virtualTransactions: [updatedTransaction.id]
        }
      )

      return pick(
        updatedOrder,
        'id',
        'amount',
        'code',
        'status',
        'ref',
        'hashId',
        'createdAt',
        'updatedAt'
      )
    } catch (error) {
      console.log('error', error)
      return error
    }
  }

  async generateCode() {
    const prefixCode = this.configService.get('PREFIX_CODE')
    const suffixCode = this.configService.get('SUFFIX_CODE')
    const uuid = randomInt(100000, 999999)
    return `${prefixCode}${uuid.toString()}${suffixCode}`
  }

  async matchDepositOrder(txId: string, content: string, amount: number) {
    const txs = await this.depositOrderModel.find({
      status: OrderStatus.Pending
    })
    const tx = find(txs, function (tx) {
      return content.includes(tx.code)
    })
    if (tx) {
      const settings = await this.settingsService.getSettings()
      const fee = settings.depositFeeFlat + amount * settings.depositFeePct
      tx.status = OrderStatus.Succeed
      tx.bankTransactions = [txId]
      tx.actualAmount = amount
      tx.fee = fee
      if (amount != tx.amount) {
        tx.status = OrderStatus.Verifying
      }
      await tx.save()
      const transaction =
        await this.bankTransactionsService.getTransactionByOrderId(tx.id)
      this.sendDepositCallback(
        tx.callback,
        'DEPOSIT',
        tx.id,
        tx.ref,
        tx.code,
        tx.status,
        tx.actualAmount,
        tx.note,
        transaction?.bankAccount
      )
      return tx
    }
    return false
  }

  async sendDepositCallback(
    url: string,
    orderType: string,
    orderId: string,
    orderRef: string,
    orderCode: string,
    orderStatus: string,
    orderAmount: number,
    reason = '',
    bankAccountNo: string = null
  ) {
    const bodyData = {
      orderType,
      orderId,
      orderRef,
      orderCode,
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
            console.log('body data ref: ', bodyData.orderRef, resData)
            return
          }
        } catch (error) {
          console.log(error.message)
        }

        sleep(fib * 1000)
      }
    }
  }

  async getSummaryForAdmin(getSummaryQueriesDto: GetSummaryQueriesDto) {
    // return Promise.all([
    //   this.getSucceedDepositTotal(getSummaryQueriesDto),
    //   this.getPendingDepositTotal(getSummaryQueriesDto),
    //   this.getManualDepositTotal(getSummaryQueriesDto),
    //   this.getSucceedDepositTotalAmount(getSummaryQueriesDto),
    //   this.getSucceedDepositTotalFee(getSummaryQueriesDto)
    // ])

    const deposits = await this.depositOrderModel.find({
      createdAt: {
        $gte: new Date(getSummaryQueriesDto.startDate),
        $lt: new Date(getSummaryQueriesDto.endDate)
      },
      status: { $in: [OrderStatus.Succeed, OrderStatus.Pending] }
    })

    const succeedDeposit = deposits.filter(
      (deposits) => deposits.status === OrderStatus.Succeed
    )

    const manualDeposit = succeedDeposit.filter(
      (deposits) => deposits.isManual === true
    )

    const succeedDepositTotalAmount = sumBy(succeedDeposit, 'actualAmount') || 0

    const succeedDepositTotalFee = sumBy(succeedDeposit, 'fee') || 0

    return [
      succeedDeposit.length,
      deposits.length - succeedDeposit.length,
      manualDeposit.length,
      succeedDepositTotalAmount,
      succeedDepositTotalFee
    ]
  }

  async getSucceedDepositTotal(getSummaryQueriesDto: GetSummaryQueriesDto) {
    console.log(getSummaryQueriesDto, getSummaryQueriesDto)

    return this.depositOrderModel.countDocuments({
      createdAt: {
        $gte: new Date(getSummaryQueriesDto.startDate),
        $lt: new Date(getSummaryQueriesDto.endDate)
      },
      status: OrderStatus.Succeed
    })
  }

  async getPendingDepositTotal(getSummaryQueriesDto: GetSummaryQueriesDto) {
    return this.depositOrderModel.countDocuments({
      createdAt: {
        $gte: new Date(getSummaryQueriesDto.startDate),
        $lt: new Date(getSummaryQueriesDto.endDate)
      },
      status: OrderStatus.Pending
    })
  }

  async getManualDepositTotal(getSummaryQueriesDto: GetSummaryQueriesDto) {
    return await this.depositOrderModel.countDocuments({
      createdAt: {
        $gte: new Date(getSummaryQueriesDto.startDate),
        $lt: new Date(getSummaryQueriesDto.endDate)
      },
      isManual: true
    })
  }

  async getSucceedDepositTotalAmount(
    getSummaryQueriesDto: GetSummaryQueriesDto
  ) {
    const succeedDeposits = await this.depositOrderModel.find({
      createdAt: {
        $gte: new Date(getSummaryQueriesDto.startDate),
        $lt: new Date(getSummaryQueriesDto.endDate)
      },
      status: OrderStatus.Succeed
    })

    return sumBy(succeedDeposits, 'actualAmount') || 0
  }

  async getDepositTotalBalance() {
    const succeedDeposits = await this.depositOrderModel.find({
      status: OrderStatus.Succeed
    })

    const amount = sumBy(succeedDeposits, 'actualAmount') || 0
    const fee = sumBy(succeedDeposits, 'fee') || 0
    return amount - fee
  }

  async getDepositTotalBalanceByDate(
    getSummaryQueriesDto: GetSummaryQueriesDto
  ) {
    const succeedDeposits = await this.depositOrderModel.find({
      updatedAt: {
        $gte: new Date(getSummaryQueriesDto.startDate),
        $lt: new Date(getSummaryQueriesDto.endDate)
      },
      status: OrderStatus.Succeed
    })

    const amount = sumBy(succeedDeposits, 'actualAmount') || 0
    const fee = sumBy(succeedDeposits, 'fee') || 0
    return {
      balance: amount - fee,
      totalAmount: amount,
      totalFee: fee
    }
  }

  async getSucceedDepositTotalFee(getSummaryQueriesDto: GetSummaryQueriesDto) {
    const succeedDeposits = await this.depositOrderModel.find({
      createdAt: {
        $gte: new Date(getSummaryQueriesDto.startDate),
        $lt: new Date(getSummaryQueriesDto.endDate)
      },
      status: OrderStatus.Succeed
    })

    return sumBy(succeedDeposits, 'fee') || 0
  }

  async autoCancelDeposits() {
    const settings = await this.settingsService.getSettings()
    const now = new Date()
    const timeChecking = moment(now)
      .add(-settings.expiredTime, 'hours')
      .toDate()

    const cancelDeposits = await this.depositOrderModel.find({
      status: OrderStatus.Pending,
      createdAt: { $lt: timeChecking }
    })

    await Promise.all(
      cancelDeposits.map(async (cancelDeposit) => {
        await this.depositOrderModel.updateOne(
          { _id: cancelDeposit.id },
          { status: OrderStatus.Canceled },
          { new: true }
        )

        return this.sendDepositCallback(
          cancelDeposit.callback,
          'DEPOSIT',
          cancelDeposit.id,
          cancelDeposit.ref,
          cancelDeposit.code,
          OrderStatus.Canceled,
          cancelDeposit.actualAmount,
          cancelDeposit.note
        )
      })
    )

    return true
  }

  async deleteDeposit(id: string, userId: string) {
    const deposit = await this.depositOrderModel.findById(id)

    if (!deposit) {
      throw new HttpException('Deposit not found', HttpStatus.NOT_FOUND)
    }
    return deposit.updateOne({
      deletedAt: new Date(),
      deletedBy: userId,
      deleted: true
    })
  }
}
