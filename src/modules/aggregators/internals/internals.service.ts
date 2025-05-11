import { OrderStatus } from '@/modules/common/dto/general.dto'
import { BanksService } from '@/modules/resources/banks/banks.service'
import { DepositsService } from '@/modules/resources/deposits/deposits.service'
import { SettingsService } from '@/modules/resources/settings/settings.service'
import { VirtualTransactionsService } from '@/modules/resources/virtual-transactions/virtual-transactions.service'
import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { pick } from 'lodash'

@Injectable()
export class InternalsService implements OnModuleInit {
  private merchantId = ''
  private virtualBankCode = ''

  constructor(
    private banksService: BanksService,
    private depositsService: DepositsService,
    private readonly configService: ConfigService,
    private settingsService: SettingsService,
    private virtualTransactionsService: VirtualTransactionsService
  ) {}

  async onModuleInit() {
    this.merchantId = this.configService.get('MERCHANT_ID')
    this.virtualBankCode = this.configService.get('VIRTUAL_BANK_CODE')
  }

  convertBank(bankCode: string) {
    switch (bankCode) {
      case 'PVBANK':
      case 'PVCOMBANK':
      case 'PV':
      case 'PVCB':
        return 'PVCB'
      case 'WOORI':
        return 'WVN'
      case 'VIETCAPITAL':
        return 'VCCB'
      default:
        return bankCode
    }
  }

  async loadOrderDetailForPublic(merchantId: string, ordercode: string) {
    if (merchantId != this.merchantId) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND)
    }

    const order = await this.depositsService.getDepositDetailForSystem(
      ordercode
    )
    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND)
    }

    const resData = {
      ...pick(
        order,
        'status',
        'code',
        'ref',
        'amount',
        'createdAt',
        'updatedAt',
        'actualAmount'
      )
    }

    if (order.status == OrderStatus.Pending) {
      const settings = await this.settingsService.getSettings()
      if (settings.isVirtualEnabled) {
        const virtualTransaction =
          await this.virtualTransactionsService.getTransactionByOrderId(
            order.id
          )
        virtualTransaction['bankAccount'] = virtualTransaction.bankAccountNo
        virtualTransaction['bankFullname'] = virtualTransaction.bankName
        virtualTransaction['bankName'] = this.convertBank(
          virtualTransaction.bankCode
        )

        resData['banks'] = [
          pick(
            virtualTransaction,
            'bankName',
            'bankFullname',
            'bankAccount',
            'bankAccountName'
          )
        ]
      } else {
        const banks = await this.banksService.getDepositBanksForSystem()
        if (banks.length == 0) {
          throw new HttpException('Bank not found', HttpStatus.NOT_FOUND)
        }

        const bankData = []
        banks.map((bank) =>
          bankData.push(
            pick(
              bank.toObject(),
              'bankName',
              'bankFullname',
              'bankAccount',
              'bankAccountName'
            )
          )
        )
        resData['banks'] = bankData
      }
    }
    return resData
  }
}
