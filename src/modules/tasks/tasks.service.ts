import { Injectable, OnModuleInit } from '@nestjs/common'
import { Cron, CronExpression, Interval } from '@nestjs/schedule'
import fetch from 'node-fetch'
import { BanksService } from '../resources/banks/banks.service'
import { ConfigService } from '@nestjs/config'
import { DepositsService } from '../resources/deposits/deposits.service'
import { CreateTransactionDto } from '../resources/bank-transactions/dto/bank-transactions-request.dto'
import { OrderStatus, TransactionType } from '../common/dto/general.dto'
import { WithdrawalsService } from '../resources/withdrawals/withdrawals.service'
import { SettingsService } from '../resources/settings/settings.service'
import { NotificationsService } from '../shared/notifications/notifications.service'
import { CallbacksService } from '../shared/callbacks/callbacks.service'
import { VicaAdaptersService } from '../adapters/vica-adapters/vica-adapters.service'
import { VirtualTransactionStatus } from '../resources/virtual-transactions/dto/general.dto'
import { VirtualTransactionsService } from '../resources/virtual-transactions/virtual-transactions.service'
import moment from 'moment'
import { SummaryCachesService } from '@/modules/resources/summary-caches/summary-cache.service'
import { CashoutsService } from '@/modules/resources/cashouts/cashouts.service'
import { RefreshTokensService } from '@/modules/resources/refresh-token/refresh-token.service'
import { BankTransactionsService } from '@/modules/resources/bank-transactions/bank-transactions.service'

@Injectable()
export class TasksService implements OnModuleInit {
  private vpayUrl = ''
  private vpayApiKey = ''
  private timeout = 50000
  private prefixCode = ''
  private suffixCode = ''
  private merchantId = ''
  private virtualBaseUrl = ''
  private virtualPartnerCode = ''
  private virtualApiKey = ''
  private virtualPublicKey = ''

  constructor(
    private readonly configService: ConfigService,
    private readonly bankTransactionsService: BankTransactionsService,
    private readonly banksService: BanksService,
    private readonly depositsService: DepositsService,
    private readonly withdrawalsService: WithdrawalsService,
    private readonly cashoutsService: CashoutsService,
    private readonly settingsService: SettingsService,
    private readonly notificationsService: NotificationsService,
    private readonly callbacksService: CallbacksService,
    private readonly vicaAdaptersService: VicaAdaptersService,
    private readonly virtualTransactionsService: VirtualTransactionsService,
    private readonly refreshTokensService: RefreshTokensService,
    private summaryCachesService: SummaryCachesService
  ) {}

  async onModuleInit() {
    this.vpayUrl = this.configService.get('VPAY_URL')
    this.vpayApiKey = this.configService.get('VPAY_API_KEY')
    this.prefixCode = this.configService.get('PREFIX_CODE')
    this.suffixCode = this.configService.get('SUFFIX_CODE')
    this.merchantId = this.configService.get('MERCHANT_ID')
    this.virtualBaseUrl = this.configService.get('VIRTUAL_BASE_URL')
    this.virtualApiKey = this.configService.get('VIRTUAL_API_KEY')
    this.virtualPartnerCode = this.configService.get('VIRTUAL_PARTNER_CODE')
    this.virtualPublicKey = this.configService.get('VIRTUAL_PUBLIC_KEY')
  }

  @Cron(CronExpression.EVERY_HOUR)
  async autoRemoveRefreshTokenJob() {
    await this.refreshTokensService.autoRemoveRefreshToken()
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async scanBankTransactions() {
    const settings = await this.settingsService.getSettings()

    if (!settings || !settings.isVpayEnabled) {
      return true
    }

    const banks = await this.banksService.getDepositBanksForSystem()

    Promise.all(
      banks.map(async (bank) => {
        console.log(`Start load ${bank.bankName} transactions`)

        const url = `${this.vpayUrl}/getTransactions`

        const bodyData = {
          bankAccount: bank.bankAccount,
          bankName: bank.bankName,
          bankType: bank.bankAccountType,
          prefixCode: this.prefixCode,
          suffixCode: this.suffixCode,
          limit: bank.getTxLimit
        }

        const resData = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Api-Key': this.vpayApiKey
          },
          body: JSON.stringify(bodyData),
          timeout: this.timeout
        })

        if (!resData.ok) {
          console.log(`Load ${bank.bankName} transactions FAIL`)
          return
        }

        const txData = await resData.json()

        const txs = txData.txs
        console.log(
          `Load ${bank.bankName} transactions: ${txs.length} transactions`
        )

        await Promise.all(
          txs.map(async (tx) => {
            const createTransactionDto: CreateTransactionDto = {
              bankName: txData.bankName,
              bankAccount: txData.bankAccount,
              transactionType: tx.transactionType,
              content: tx.content,
              reference: tx.reference,
              txCode: tx.txCode,
              prefixCode: tx.prefixCode,
              suffixCode: tx.suffixCode,
              amount: Number(tx.amount),
              transactionTime: tx.transactionTime,
              data: tx.data
            }
            const bankTx = await this.bankTransactionsService.createTransaction(
              createTransactionDto
            )
            if (bankTx) {
              if (bankTx.transactionType == TransactionType.Credit) {
                const matchedTx = await this.depositsService.matchDepositOrder(
                  bankTx.id,
                  bankTx.content.trim().replace(/\./g, ''),
                  bankTx.amount
                )
                if (matchedTx) {
                  bankTx.deposit = matchedTx.id
                  bankTx.isMatched = true
                  bankTx.save()
                  const telegramMsg = `<b>[INFO] [DEPOSIT] [${status}]</b>%0A
                  bankAccount: ${bankTx.bankAccount}%0A
                  transactionType: ${bankTx.transactionType}%0A
                  reference: ${bankTx.reference}%0A
                  amount: ${bankTx.amount.toLocaleString()}%0A
                  code: ${matchedTx.code}%0A
                  ref: ${matchedTx.ref}`

                  this.notificationsService.sendTelegramMessage(
                    telegramMsg.replace(/      /g, '')
                  )
                } else {
                  const telegramMsg = `<b>[ALERT] [DEPOSIT] [NOT-MATCHED]</b>%0A
                  bankAccount: ${bankTx.bankAccount}%0A
                  transactionType: ${bankTx.transactionType}%0A
                  reference: ${bankTx.reference}%0A
                  amount: ${bankTx.amount.toLocaleString()}%0A
                  content: ${bankTx.content}`

                  this.notificationsService.sendTelegramMessage(
                    telegramMsg.replace(/      /g, '')
                  )
                }
              }

              // if (bankTx.transactionType == TransactionType.Debit) {
              //   const matchedTx =
              //     await this.withdrawalsService.matchWithdrawOrder(
              //       bankTx.id,
              //       bankTx.content.trim().replace(/\./g, ''),
              //       txData.bankName,
              //       txData.bankAccount
              //     )
              //   if (matchedTx) {
              //     const telegramMsg = `<b>[INFO] [WITHDRAWAL] [MATCHED]</b>%0A
              //     bankAccount: ${bankTx.bankAccount}%0A
              //     transactionType: ${bankTx.transactionType}%0A
              //     reference: ${bankTx.reference}%0A
              //     amount: ${bankTx.amount.toLocaleString()}%0A
              //     code: ${matchedTx.code}%0A
              //     ref: ${matchedTx.ref}`

              //     this.notificationsService.sendTelegramMessage(
              //       telegramMsg.replace(/      /g, '')
              //     )
              //   } else {
              //     const telegramMsg = `<b>[ALERT] [WITHDRAWAL] [NOT-MATCHED]</b>%0A
              //     bankAccount: ${bankTx.bankAccount}%0A
              //     transactionType: ${bankTx.transactionType}%0A
              //     reference: ${bankTx.reference}%0A
              //     amount: ${bankTx.amount.toLocaleString()}`

              //     this.notificationsService.sendTelegramMessage(
              //       telegramMsg.replace(/      /g, '')
              //     )
              //   }
              // }
            }
          })
        )
        bank.balance = txData.balance
        await bank.save()
      })
    )
  }

  @Interval('autoCancelDeposits', 300000)
  async autoCancelDeposits() {
    console.log('Start auto cancel deposit orders')
    await this.depositsService.autoCancelDeposits()
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async alertPendingWithdrawals() {
    const pendingTxs = await this.withdrawalsService.getPendingWithdrawals()
    pendingTxs.forEach((pendingTx) => {
      const telegramMsg = `
      <b>[ALERT] [WITHDRAWAL] [PENDING]</b>%0A
      merchant: ${this.merchantId}%0A
      bankNameDest: ${pendingTx.bankNameDest}%0A
      ref: ${pendingTx.ref}%0A
      amount: ${pendingTx.amount.toLocaleString()}`

      this.notificationsService.sendTelegramMessage(
        telegramMsg.replace(/      /g, ''),
        'PENDING_WITHDRAWAL'
      )
    })
  }

  // @Cron(CronExpression.EVERY_5_MINUTES)
  async autoCheckVirtualTransactionPayCash() {
    console.log('Start check pay cash')
    const pendingPayCashOrders =
      await this.virtualTransactionsService.getPendingTransactionPayCash()
    pendingPayCashOrders.forEach(async (pendingTransaction) => {
      let payCashOrder = {
        isSucceed: false,
        msg: '',
        data: { responseMessage: '', transferAmount: 0 }
      }
      if (pendingTransaction.bankCode) {
        payCashOrder = await this.vicaAdaptersService.checkPayCashOrder(
          this.virtualBaseUrl,
          this.virtualApiKey,
          this.virtualPartnerCode,
          this.virtualPublicKey,
          pendingTransaction.id
        )
      } else {
        console.log('Transaction canceled', pendingTransaction.id)
        await this.virtualTransactionsService.updateTransaction(
          pendingTransaction.id,
          {
            status: VirtualTransactionStatus.CANCELED
          }
        )
        return
      }
      if (!payCashOrder.isSucceed) {
        return
      }

      if (payCashOrder.data.responseMessage === 'Success') {
        console.log('Paycash Success', pendingTransaction.id)
        const txStatus = await this.vicaAdaptersService.matchTransactionStatus(
          pendingTransaction.amount,
          payCashOrder.data.transferAmount
        )

        await this.virtualTransactionsService.updateTransaction(
          pendingTransaction.id,
          {
            status: txStatus
          }
        )

        const settings = await this.settingsService.getSettings()
        const pendingWithdrawal =
          await this.withdrawalsService.getWithdrawalOrderByVirtualId(
            pendingTransaction.id
          )

        const fee =
          settings.withdrawFeeFlat +
          pendingWithdrawal.amount * settings.withdrawFeePct

        let withdrawalStatus: OrderStatus

        switch (txStatus) {
          case VirtualTransactionStatus.SUCCEED:
            withdrawalStatus = OrderStatus.Succeed
            break

          case VirtualTransactionStatus.REVIEW:
            withdrawalStatus = OrderStatus.Succeed
            break

          default:
            withdrawalStatus = pendingWithdrawal.status
            break
        }

        const updatedOrder =
          await this.withdrawalsService.updateWithdrawalOrder(
            pendingWithdrawal.id,
            {
              status: withdrawalStatus,
              fee
            }
          )
        if (updatedOrder.status == OrderStatus.Succeed) {
          this.callbacksService.sendCallback(
            updatedOrder.callback,
            'WITHDRAWAL',
            updatedOrder.id,
            updatedOrder.ref,
            updatedOrder.code,
            updatedOrder.status,
            updatedOrder.amount,
            updatedOrder.note
          )
          this.notificationsService.sendVirtualWithdrawalOrderNotification(
            updatedOrder.code,
            updatedOrder.ref,
            updatedOrder.status,
            updatedOrder.amount
          )
        }
      }
    })
  }

  @Cron(CronExpression.EVERY_DAY_AT_5PM)
  async createSummaryCache() {
    const midnightVnTime = moment().utcOffset(7).startOf('day')

    const existedCache =
      await this.summaryCachesService.getSummaryCacheByCacheTime(
        midnightVnTime.toDate()
      )
    if (existedCache) {
      return
    }

    const lastSummaryCacheData =
      await this.summaryCachesService.getLastSummaryCache(
        midnightVnTime.toDate()
      )

    const summaryDepositData =
      await this.depositsService.getDepositTotalBalanceByDate({
        startDate: lastSummaryCacheData.cacheTime,
        endDate: midnightVnTime.toDate()
      })

    const summaryWithdrawalData =
      await this.withdrawalsService.getWithdrawalTotalBalanceByDate({
        startDate: lastSummaryCacheData.cacheTime,
        endDate: midnightVnTime.toDate()
      })
    const summaryCashoutData =
      await this.cashoutsService.getCashoutTotalBalanceByDate({
        startDate: lastSummaryCacheData.cacheTime,
        endDate: midnightVnTime.toDate()
      })

    const totalDepositAmount =
      lastSummaryCacheData.totalDepositAmount + summaryDepositData.totalAmount
    const totalDepositFee =
      lastSummaryCacheData.totalDepositFee + summaryDepositData.totalFee

    const totalWithdrawalAmount =
      lastSummaryCacheData.totalWithdrawalAmount +
      summaryWithdrawalData.totalAmount

    const totalWithdrawalFee =
      lastSummaryCacheData.totalWithdrawalFee + summaryWithdrawalData.totalFee

    const totalCashoutAmount =
      lastSummaryCacheData.totalCashoutAmount + summaryCashoutData.totalAmount

    const totalCashoutFee =
      lastSummaryCacheData.totalCashoutFee + summaryCashoutData.totalFee

    const balance =
      totalDepositAmount -
      totalWithdrawalAmount -
      totalCashoutAmount -
      totalDepositFee -
      totalWithdrawalFee -
      totalCashoutFee

    const newSummaryCache = await this.summaryCachesService.createSummaryCache({
      balance,
      totalDepositAmount,
      totalWithdrawalAmount,
      totalCashoutAmount,
      totalDepositFee,
      totalWithdrawalFee,
      totalCashoutFee,
      cacheTime: midnightVnTime.toDate()
    })

    return newSummaryCache
  }
}
