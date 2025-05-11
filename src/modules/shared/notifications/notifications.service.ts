import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import fetch from 'node-fetch'

@Injectable()
export class NotificationsService implements OnModuleInit {
  private telegramToken = ''
  private telegramChatId = ''
  private telegramPendingWithdrawalChatId = ''

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.telegramToken = this.configService.get('TELEGRAM_TOKEN')
    this.telegramChatId = this.configService.get('TELEGRAM_CHATID')
    this.telegramPendingWithdrawalChatId = this.configService.get(
      'TELEGRAM_PENDING_WITHDRAWAL_CHATID'
    )
  }

  async sendTelegramMessage(msg: string, groupType: string = 'NOTIFICATION') {
    if (groupType == 'NOTIFICATION') {
      const url = `https://api.telegram.org/bot${this.telegramToken}/sendMessage?chat_id=${this.telegramChatId}&parse_mode=HTML&text=${msg}`
      fetch(url)
    }

    if (groupType == 'PENDING_WITHDRAWAL') {
      const url = `https://api.telegram.org/bot${this.telegramToken}/sendMessage?chat_id=${this.telegramPendingWithdrawalChatId}&parse_mode=HTML&text=${msg}`
      fetch(url)
    }
  }

  async sendVirtualDepositOrderNotification(
    orderCode: string,
    orderRef: string,
    status: string,
    amount: number
  ) {
    const telegramMsg = `<b>[INFO] [VIRTUAL] [DEPOSIT] [${status}]</b>%0A
    OrderCode: ${orderCode}%0A
    OrderRef: ${orderRef}%0A
    Amount: ${amount.toLocaleString()}`

    this.sendTelegramMessage(telegramMsg.replace(/    /g, ''))
  }

  async sendVirtualWithdrawalOrderNotification(
    orderCode: string,
    orderRef: string,
    status: string,
    amount: number
  ) {
    const telegramMsg = `<b>[INFO] [VIRTUAL] [WITHDRAWAL] [${status}]</b>%0A
    OrderCode: ${orderCode}%0A
    OrderRef: ${orderRef}%0A
    Amount: ${amount.toLocaleString()}`

    this.sendTelegramMessage(telegramMsg.replace(/    /g, ''))
  }
}
