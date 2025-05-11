import { fibonacci, sleep } from '@/utils/common'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import fetch from 'node-fetch'

@Injectable()
export class CallbacksService implements OnModuleInit {
  private callbackSecretKey = ''

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.callbackSecretKey = this.configService.get('CALLBACK_SECRET_KEY')
  }

  async sendCallback(
    url: string,
    orderType: string = 'DEPOSIT',
    orderId: string,
    orderRef: string,
    orderCode: string,
    orderStatus: string,
    orderAmount: number,
    reason: string = '',
    bankAccountNo: string = null
  ) {
    const data = {
      orderType,
      orderId,
      orderRef,
      orderCode,
      orderStatus,
      orderAmount,
      reason,
      bankAccountNo,
      secretKey: this.callbackSecretKey
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
            body: JSON.stringify(data)
            // timeout: 10000
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
}
