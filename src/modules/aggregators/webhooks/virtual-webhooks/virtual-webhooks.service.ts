import { Injectable } from '@nestjs/common'
import { verifyData } from '@/utils/crypto'
import { ConfigService } from '@nestjs/config'
import { VirtualTransactionsService } from '@/modules/resources/virtual-transactions/virtual-transactions.service'
import {
  VirtualServiceCode,
  VirtualTransactionStatus
} from '@/modules/resources/virtual-transactions/dto/general.dto'
import { NotificationsService } from '@/modules/shared/notifications/notifications.service'
import { DepositsService } from '@/modules/resources/deposits/deposits.service'
import { SettingsService } from '@/modules/resources/settings/settings.service'
import {
  HandleCreateVAVov5WebhookDto,
  HandleTransferVov5WebhookDto,
  HandleVirtualWebhookDto,
  HandleXenditWebhookDto
} from './dto/request.dto'
import { CallbacksService } from '@/modules/shared/callbacks/callbacks.service'
import moment from 'moment'
import { OrderStatus } from '@/modules/common/dto/general.dto'
import { VicaAdaptersService } from '@/modules/adapters/vica-adapters/vica-adapters.service'
import { VirtualTransaction } from '@/modules/resources/virtual-transactions/virtual-transactions.interface'
import { WithdrawalsService } from '@/modules/resources/withdrawals/withdrawals.service'
import { LinkType } from './dto/general.dto'

@Injectable()
export class VirtualWebhooksService {
  private virtualPartnerCode = ''
  private virtualApiKey = ''
  private virtualPublicKey = ''
  private webhookPublicKey = ''

  constructor(
    private readonly configService: ConfigService,
    private readonly depositsService: DepositsService,
    private readonly settingsService: SettingsService,
    private readonly vicaService: VicaAdaptersService,
    private readonly virtualTransactionsService: VirtualTransactionsService,
    private readonly notificationsService: NotificationsService,
    private readonly callbacksService: CallbacksService,
    private readonly withdrawalsService: WithdrawalsService
  ) {}

  async onModuleInit() {
    this.virtualApiKey = this.configService.get('VIRTUAL_API_KEY')
    this.virtualPartnerCode = this.configService.get('VIRTUAL_PARTNER_CODE')
    this.virtualPublicKey = this.configService.get('VIRTUAL_PUBLIC_KEY')
    this.webhookPublicKey = this.configService.get('WEBHOOK_PUBLIC_KEY')
  }

  async handleVirtualWebhook(handleVirtualWebhookDto: HandleVirtualWebhookDto) {
    try {
      console.log('handleVirtualWebhookDto', handleVirtualWebhookDto)
      const signData = `${handleVirtualWebhookDto.transcode}${this.virtualPartnerCode}${this.virtualApiKey}`

      const isValid = await verifyData(
        this.virtualPublicKey,
        handleVirtualWebhookDto.responseSignature,
        signData
      )
      if (!isValid) {
        throw new Error('Invalid Callback')
      }

      // console.log(callbackData)
      const virtualTransaction =
        await this.virtualTransactionsService.getTransactionById(
          handleVirtualWebhookDto.transcode
        )

      if (!virtualTransaction) {
        console.log('Virtual transaction not found')
      }

      const isBankAccountEnabled =
        handleVirtualWebhookDto.bankAccountStatus == 1 ? true : false

      // const isExpiriedTime = moment
      //   .unix(handleVirtualWebhookDto.orderExpiryTime)
      //   .isBefore(moment())

      if (handleVirtualWebhookDto.serviceCode === VirtualServiceCode.PAYCASH) {
        await this.handleVirtualPayCash(
          virtualTransaction,
          handleVirtualWebhookDto,
          isBankAccountEnabled
        )
      } else {
        await this.handleVirtualCollectCash(
          virtualTransaction,
          handleVirtualWebhookDto,
          isBankAccountEnabled
        )
      }

      return {
        isSucceed: true,
        msg: 'Succeed',
        data: {}
      }
    } catch (error) {
      return {
        isSucceed: false,
        msg: error.message,
        data: {}
      }
    }
  }

  private async handleVirtualCollectCash(
    virtualTransaction: VirtualTransaction,
    handleVirtualWebhookDto: HandleVirtualWebhookDto,
    isBankAccountEnabled: boolean
  ) {
    const txStatus = await this.vicaService.matchTransactionStatus(
      handleVirtualWebhookDto.amount,
      handleVirtualWebhookDto.paidAmount
    )

    await this.virtualTransactionsService.updateTransaction(
      virtualTransaction.id,
      {
        status: txStatus,
        paidAmount: handleVirtualWebhookDto.paidAmount,
        orderExpiryTime: handleVirtualWebhookDto.orderExpiryTime,
        isBankAccountEnabled
      }
    )

    if (
      [
        VirtualTransactionStatus.SUCCEED,
        VirtualTransactionStatus.CANCELED,
        VirtualTransactionStatus.REVIEW
      ].includes(txStatus)
    ) {
      await this.matchVirtualDepositOrder(
        virtualTransaction.depositOrder,
        handleVirtualWebhookDto.paidAmount,
        txStatus,
        virtualTransaction
      )
    }
  }

  private async handleVirtualPayCash(
    virtualTransaction: VirtualTransaction,
    handleVirtualWebhookDto: HandleVirtualWebhookDto,
    isBankAccountEnabled: boolean
  ) {
    const txStatus = await this.vicaService.matchTransactionStatus(
      handleVirtualWebhookDto.amount,
      handleVirtualWebhookDto.transferAmount
    )

    await this.virtualTransactionsService.updateTransaction(
      virtualTransaction.id,
      {
        status: txStatus,
        transferAmount: handleVirtualWebhookDto.transferAmount,
        orderExpiryTime: handleVirtualWebhookDto.orderExpiryTime,
        isBankAccountEnabled
      }
    )

    if (
      [
        VirtualTransactionStatus.SUCCEED,
        VirtualTransactionStatus.CANCELED,
        VirtualTransactionStatus.REVIEW
      ].includes(txStatus)
    ) {
      await this.matchVirtualWithdrawalOrder(
        virtualTransaction.depositOrder,
        handleVirtualWebhookDto.transferAmount,
        txStatus
      )
    }
  }

  private async matchVirtualDepositOrder(
    orderId: string,
    paidAmount: number,
    virtualTransactionStatus: VirtualTransactionStatus,
    virtualTransaction: VirtualTransaction,
    refXendit: string = ''
  ) {
    const depositOrder = await this.depositsService.getOrderById(orderId)

    const settings = await this.settingsService.getSettings()
    const fee =
      settings.depositVirtualFeeFlat +
      paidAmount * settings.depositVirtualFeePct

    let orderStatus: OrderStatus

    switch (virtualTransactionStatus) {
      case VirtualTransactionStatus.SUCCEED:
        orderStatus = OrderStatus.Succeed
        break

      case VirtualTransactionStatus.CANCELED:
        orderStatus = OrderStatus.Canceled
        break

      case VirtualTransactionStatus.REVIEW:
        orderStatus = OrderStatus.Verifying
        break

      default:
        orderStatus = depositOrder.status
        break
    }

    const updatedOrder = await this.depositsService.updateDepositOrder(
      depositOrder.id,
      {
        status: orderStatus,
        fee,
        actualAmount: paidAmount,
        refXendit
      }
    )

    this.callbacksService.sendCallback(
      updatedOrder.callback,
      'DEPOSIT',
      updatedOrder.id,
      updatedOrder.ref,
      updatedOrder.code,
      updatedOrder.status,
      updatedOrder.actualAmount,
      updatedOrder.note,
      virtualTransaction.bankAccountNo
    )

    if (orderStatus == OrderStatus.Succeed) {
      this.notificationsService.sendVirtualDepositOrderNotification(
        updatedOrder.code,
        updatedOrder.ref,
        updatedOrder.status,
        updatedOrder.amount
      )
    }
  }

  private async matchVirtualWithdrawalOrder(
    orderId: string,
    transferAmount: number,
    virtualTransactionStatus: VirtualTransactionStatus
  ) {
    const withdrawalOrder =
      await this.withdrawalsService.getWithdrawalOrderById(orderId)

    const settings = await this.settingsService.getSettings()

    const fee =
      settings.withdrawFeeFlat + transferAmount * settings.withdrawFeePct

    let withdrawalStatus: OrderStatus

    switch (virtualTransactionStatus) {
      case VirtualTransactionStatus.SUCCEED:
        withdrawalStatus = OrderStatus.Succeed
        break

      case VirtualTransactionStatus.CANCELED:
        withdrawalStatus = OrderStatus.Canceled
        break

      case VirtualTransactionStatus.REVIEW:
        withdrawalStatus = OrderStatus.Succeed

        break

      default:
        withdrawalStatus = withdrawalOrder.status
        break
    }

    const updateWithdrawalOrder =
      await this.withdrawalsService.updateWithdrawalOrder(withdrawalOrder.id, {
        status: withdrawalStatus,
        fee
      })

    this.callbacksService.sendCallback(
      updateWithdrawalOrder.callback,
      'WITHDRAWAL',
      updateWithdrawalOrder.id,
      updateWithdrawalOrder.ref,
      updateWithdrawalOrder.code,
      updateWithdrawalOrder.status,
      updateWithdrawalOrder.amount,
      updateWithdrawalOrder.note
    )

    if (updateWithdrawalOrder.status === OrderStatus.Succeed) {
      this.notificationsService.sendVirtualWithdrawalOrderNotification(
        updateWithdrawalOrder.code,
        updateWithdrawalOrder.ref,
        updateWithdrawalOrder.status,
        updateWithdrawalOrder.amount
      )
    }
  }

  async handleXenditWebhook(handleXenditWebhookDto: HandleXenditWebhookDto) {
    console.log('handleXenditWebhookDto', handleXenditWebhookDto)

    const signData =
      handleXenditWebhookDto.event === LinkType.PAYMENT_SUCCEEDED
        ? `${handleXenditWebhookDto.data['reference_id']}${handleXenditWebhookDto.data['payment_request_id']}`
        : `${handleXenditWebhookDto.data['reference_id']}${handleXenditWebhookDto.data['id']}`

    const isValid = await verifyData(
      this.webhookPublicKey,
      handleXenditWebhookDto.responseSignature,
      signData
    )
    if (!isValid) {
      throw new Error('Invalid Callback')
    }
    const virtualTransaction =
      await this.virtualTransactionsService.getTransactionById(
        handleXenditWebhookDto.data['reference_id']
      )
    if (handleXenditWebhookDto.event === LinkType.PAYMENT_SUCCEEDED) {
      await this.handlePaymentSuccess(
        virtualTransaction,
        handleXenditWebhookDto.data['amount'],
        handleXenditWebhookDto.data['payment_method']['reference_id']
      )
    }
    if (handleXenditWebhookDto.event === LinkType.PAYOUT_SUCCEEDED) {
      await this.handlePayoutSuccess(
        virtualTransaction,
        handleXenditWebhookDto.data['amount']
      )
    }
  }

  async handlePaymentSuccess(
    virtualTransaction: VirtualTransaction,
    amount: number,
    refXendit: string
  ) {
    const txStatus = await this.vicaService.matchTransactionStatus(
      virtualTransaction.amount,
      amount
    )

    await this.virtualTransactionsService.updateTransaction(
      virtualTransaction.id,
      {
        status: txStatus,
        paidAmount: amount
      }
    )

    if (
      [
        VirtualTransactionStatus.SUCCEED,
        VirtualTransactionStatus.CANCELED,
        VirtualTransactionStatus.REVIEW
      ].includes(txStatus)
    ) {
      await this.matchVirtualDepositOrder(
        virtualTransaction.depositOrder,
        amount,
        txStatus,
        virtualTransaction,
        refXendit
      )
    }
  }

  async handlePayoutSuccess(
    virtualTransaction: VirtualTransaction,
    amount: number
  ) {
    const txStatus = await this.vicaService.matchTransactionStatus(
      virtualTransaction.amount,
      amount
    )

    await this.virtualTransactionsService.updateTransaction(
      virtualTransaction.id,
      {
        status: txStatus
      }
    )

    if (
      [
        VirtualTransactionStatus.SUCCEED,
        VirtualTransactionStatus.CANCELED,
        VirtualTransactionStatus.REVIEW
      ].includes(txStatus)
    ) {
      await this.matchVirtualWithdrawalOrder(
        virtualTransaction.depositOrder,
        amount,
        txStatus
      )
    }
  }

  //VOV5
  async handleCreateVAVov5Webhook(
    handleCreateVAVov5WebhookDto: HandleCreateVAVov5WebhookDto
  ) {
    const isValid = await verifyData(
      this.webhookPublicKey,
      handleCreateVAVov5WebhookDto.responseSignature,
      JSON.stringify({
        ...handleCreateVAVov5WebhookDto,
        responseSignature: undefined
      })
    )
    if (!isValid) {
      throw new Error('Invalid Callback')
    }

    const virtualTransaction =
      await this.virtualTransactionsService.getTransactionById(
        handleCreateVAVov5WebhookDto.vaRequestId
      )

    const txStatus = await this.vicaService.matchTransactionStatus(
      virtualTransaction.amount,
      handleCreateVAVov5WebhookDto.amount
    )

    const orderExpiryTime = new Date(
      handleCreateVAVov5WebhookDto.tranDate
    ).getTime()

    await this.virtualTransactionsService.updateTransaction(
      virtualTransaction.id,
      {
        status: txStatus,
        transferAmount: handleCreateVAVov5WebhookDto.amount,
        orderExpiryTime,
        isBankAccountEnabled: false
      }
    )

    if (
      [
        VirtualTransactionStatus.SUCCEED,
        VirtualTransactionStatus.CANCELED,
        VirtualTransactionStatus.REVIEW
      ].includes(txStatus)
    ) {
      await this.matchVirtualDepositOrder(
        virtualTransaction.depositOrder,
        handleCreateVAVov5WebhookDto.amount,
        txStatus,
        virtualTransaction
      )
    }
  }

  async handleTransferVov5Webhook(
    handleTransferVov5WebhookDto: HandleTransferVov5WebhookDto
  ) {
    const isValid = await verifyData(
      this.webhookPublicKey,
      handleTransferVov5WebhookDto.responseSignature,
      JSON.stringify({
        ...handleTransferVov5WebhookDto,
        responseSignature: undefined
      })
    )
    if (!isValid) {
      throw new Error('Invalid Callback')
    }

    const virtualTransaction =
      await this.virtualTransactionsService.getTransactionById(
        handleTransferVov5WebhookDto.requestId
      )

    let txStatus: VirtualTransactionStatus
    switch (handleTransferVov5WebhookDto.status) {
      case 2:
        txStatus = VirtualTransactionStatus.CANCELED
        break

      case 8:
        txStatus = VirtualTransactionStatus.SUCCEED
        break

      default:
        break
    }

    const orderExpiryTime = new Date().getTime()

    await this.virtualTransactionsService.updateTransaction(
      virtualTransaction.id,
      {
        status: txStatus,
        transferAmount: handleTransferVov5WebhookDto.amount,
        orderExpiryTime,
        isBankAccountEnabled: false
      }
    )

    if (
      [
        VirtualTransactionStatus.SUCCEED,
        VirtualTransactionStatus.CANCELED,
        VirtualTransactionStatus.REVIEW
      ].includes(txStatus)
    ) {
      await this.matchVirtualWithdrawalOrder(
        virtualTransaction.depositOrder,
        handleTransferVov5WebhookDto.amount,
        txStatus
      )
    }
  }
}
