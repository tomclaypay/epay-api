import { Injectable, OnModuleInit } from '@nestjs/common'
import { BanksService } from '../../resources/banks/banks.service'
import { DepositsService } from '../../resources/deposits/deposits.service'
import {
  CreateDepositOrderDto,
  GetDepositsQueriesDto
} from '../../resources/deposits/dto/deposit-request.dto'
import { SettingsService } from '../../resources/settings/settings.service'
import {
  CreateWithdrawalOrderDto,
  GetWithdrawalsQueriesDto
} from '../../resources/withdrawals/dto/withdrawal-request.dto'
import { WithdrawalsService } from '../../resources/withdrawals/withdrawals.service'
import { Withdrawal } from '@/modules/resources/withdrawals/withdrawals.interface'
import { VirtualTransactionsService } from '@/modules/resources/virtual-transactions/virtual-transactions.service'
import {
  VirtualServiceCode,
  VirtualTransactionStatus
} from '@/modules/resources/virtual-transactions/dto/general.dto'
import { VicaAdaptersService } from '@/modules/adapters/vica-adapters/vica-adapters.service'
import { ConfigService } from '@nestjs/config'
import { pick } from 'lodash'
import { BankTransactionsService } from '@/modules/resources/transactions/bank-transactions.service'

@Injectable()
export class ExternalsService implements OnModuleInit {
  private virtualBaseUrl = ''
  private virtualPartnerCode = ''
  private virtualApiKey = ''
  private virtualPublicKey = ''
  private virtualNotifyUrl = ''
  constructor(
    private configService: ConfigService,
    private banksService: BanksService,
    private depositsService: DepositsService,
    private withdrawalsService: WithdrawalsService,
    private settingsService: SettingsService,
    private virtualTransactionsService: VirtualTransactionsService,
    private vicaAdaptersService: VicaAdaptersService
  ) {}

  onModuleInit() {
    this.virtualBaseUrl = this.configService.get('VIRTUAL_BASE_URL')
    this.virtualApiKey = this.configService.get('VIRTUAL_API_KEY')
    this.virtualPartnerCode = this.configService.get('VIRTUAL_PARTNER_CODE')
    this.virtualPublicKey = this.configService.get('VIRTUAL_PUBLIC_KEY')
    this.virtualNotifyUrl = this.configService.get('VIRTUAL_NOTIFY_URL')
  }

  // Banks
  async getDepositBanksForExternal() {
    return this.banksService.getDepositBanksForExternal()
  }

  // Deposits
  async createDepositOrderForExternal(
    createDepositOrderDto: CreateDepositOrderDto
  ) {
    return this.depositsService.createDepositOrderForExternal(
      createDepositOrderDto
    )
  }

  async getDepositsForExternal(getDepositsQueriesDto: GetDepositsQueriesDto) {
    return this.depositsService.getDepositsForExternal(getDepositsQueriesDto)
  }

  async getDepositDetailForExternal(depositId: string) {
    return this.depositsService.getDepositDetailForExternal(depositId)
  }

  // Withdrawals
  async createWithdrawalOrderForExternal(
    createWithdrawalOrderDto: CreateWithdrawalOrderDto
  ) {
    //Delete spaces
    createWithdrawalOrderDto.mt5Id = createWithdrawalOrderDto.mt5Id
      .trim()
      .split('\t')[0]

    const withdrawalOrder = await this.withdrawalsService.createWithdrawalOrder(
      createWithdrawalOrderDto
    )

    //Auto withdrawal order
    const settings = await this.settingsService.getSettings()
    const isCheckBankName = settings.withdrawalBanks.find(
      (bank) => bank === withdrawalOrder.bankNameDest
    )

    const virtualTransaction =
      await this.virtualTransactionsService.getVirtualTransactionByDepositId(
        withdrawalOrder.id
      )

    if (settings.isAutoWithdrawal && isCheckBankName && !virtualTransaction) {
      await this.autoWithdrawal(withdrawalOrder)
    }
    //

    return pick(
      withdrawalOrder,
      'id',
      'bankNameDest',
      'bankAccountNumberDest',
      'bankAccountNameDest',
      'amount',
      'ref',
      'callback',
      'code',
      'status',
      'createdAt',
      'updatedAt'
    )
  }

  async autoWithdrawal(withdrawalOrder: Withdrawal) {
    const newVirtualTransaction =
      await this.virtualTransactionsService.createTransaction({
        depositOrder: withdrawalOrder.id,
        refId: withdrawalOrder.ref,
        serviceCode: VirtualServiceCode.PAYCASH,
        amount: withdrawalOrder.amount,
        returnUrl: withdrawalOrder.callback,
        cancelUrl: withdrawalOrder.callback
      })

    const payCashOrder =
      await this.vicaAdaptersService.createVirtualPayCashOrder(
        this.virtualBaseUrl,
        this.virtualApiKey,
        this.virtualPartnerCode,
        this.virtualPublicKey,
        this.virtualNotifyUrl,
        newVirtualTransaction.id,
        withdrawalOrder.bankNameDest,
        withdrawalOrder.bankAccountNumberDest,
        withdrawalOrder.bankAccountNameDest,
        withdrawalOrder.amount,
        withdrawalOrder.code,
        withdrawalOrder.code
      )

    if (!payCashOrder.isSucceed) {
      await this.virtualTransactionsService.updateTransaction(
        newVirtualTransaction.id,
        {
          status: VirtualTransactionStatus.CANCELED
        }
      )
    } else {
      const updateVirtualTransaction =
        await this.virtualTransactionsService.updateTransaction(
          newVirtualTransaction.id,
          {
            status: VirtualTransactionStatus.PENDING,
            bankCode: payCashOrder.data.bankCode,
            bankAccountNo: payCashOrder.data.bankAccountNo,
            bankAccountName: payCashOrder.data.bankAccountName
          }
        )
      await this.withdrawalsService.updateWithdrawalOrder(withdrawalOrder.id, {
        virtualTransaction: updateVirtualTransaction.id
      })
    }
  }

  async getWithdrawalsForExternal(
    getWithdrawalsQueriesDto: GetWithdrawalsQueriesDto
  ) {
    return this.withdrawalsService.getWithdrawalsForExternal(
      getWithdrawalsQueriesDto
    )
  }

  async getWithdrawalDetailForExternal(withdrawalId: string) {
    return this.withdrawalsService.getWithdrawalDetailForExternal(withdrawalId)
  }

  async getSettingsForExternal() {
    return this.settingsService.getSettingsForExternal()
  }

  async getWithdrawalBanksForExternal() {
    return this.settingsService.getWithdrawalBanksForExternal()
  }
}
