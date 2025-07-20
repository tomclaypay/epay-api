import { ChainName } from '@/common/const/general'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import fetch from 'node-fetch'

@Injectable()
export class UpayAdapterService implements OnModuleInit {
  private uBaseUrl = ''
  private uApiKey = ''

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.uBaseUrl = this.configService.get('U_BASE_URL')
    this.uApiKey = this.configService.get('U_API_KEY')
  }

  async getWalletAddress(
    customerId: string,
    chainName: ChainName = ChainName.BSC,
    mt5Id: string
  ) {
    try {
      const url = `${this.uBaseUrl}/customer-wallets/get-address`

      const bodyData = {
        customerId,
        chainName,
        mt5Id
      }

      const headers = {
        'X-API-KEY': this.uApiKey,
        'Content-Type': 'application/json'
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(bodyData)
        // timeout: 5000
      })

      if (!res.ok) {
        throw new Error('[UpayAdapterService] [getWalletAddress] fetch error')
      }
      const resData = await res.json()

      return { isSucceed: true, msg: 'Succeed', data: { ...resData } }
    } catch (error) {
      return { isSucceed: false, msg: error.message, data: {} }
    }
  }

  async createWithdrawalOrder(
    customerId: string,
    orderRef: string,
    toAddress: string,
    usdAmount: number,
    mt5Id: string,
    chainName: ChainName
  ) {
    try {
      const url = `${this.uBaseUrl}/withdrawals`

      const bodyData = {
        customerId: customerId,
        orderRef: orderRef,
        chainName,
        toAddress: toAddress,
        usdAmount,
        mt5Id
      }

      const headers = {
        'X-API-KEY': this.uApiKey,
        'Content-Type': 'application/json'
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(bodyData)
        // timeout: 5000
      })

      if (!res.ok) {
        throw new Error('[UpayAdapterService] [getWalletAddress] fetch error')
      }
      const resData = await res.json()

      return { isSucceed: true, msg: 'Succeed', data: { ...resData } }
    } catch (error) {
      return { isSucceed: false, msg: error.message, data: {} }
    }
  }

  async cancelWithdrawalOrder(orderRef: string) {
    try {
      const url = `${this.uBaseUrl}/withdrawals/${orderRef}/cancel`

      const bodyData = {}

      const headers = {
        'X-API-KEY': this.uApiKey,
        'Content-Type': 'application/json'
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(bodyData)
        // timeout: 5000
      })

      if (!res.ok) {
        throw new Error(
          '[UpayAdapterService] [cancelWithdrawalOrder] fetch error'
        )
      }
      const resData = await res.json()

      return { isSucceed: true, msg: 'Succeed', data: { ...resData } }
    } catch (error) {
      return { isSucceed: false, msg: error.message, data: {} }
    }
  }
}
