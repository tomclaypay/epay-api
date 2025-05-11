import { VirtualTransactionStatus } from '@/modules/resources/virtual-transactions/dto/general.dto'
import { removeVietnameseTones } from '@/utils/common'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import fetch from 'node-fetch'

@Injectable()
export class VicaAdaptersService implements OnModuleInit {
  private vicaBaseUrl = ''
  private vicaApiKey = ''

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.vicaBaseUrl = this.configService.get('VICA_BASE_URL')
    this.vicaApiKey = this.configService.get('VICA_API_KEY')
  }

  async createCardOrder(
    cardBaseUrl: string,
    cardApiKey: string,
    cardPartnerCode: string,
    cardPublicKey: string,
    cardNotifyUrl: string,
    paymentMethodCode: string,
    transCode: string,
    orderDescription: string,
    amount: number,
    buyerFullname: string,
    buyerEmail: string,
    buyerMobile: string,
    buyerAddress: string,
    returnUrl: string,
    cancelUrl: string
  ) {
    try {
      const url = `${this.vicaBaseUrl}/internals/card/create-order`

      const bodyData = {
        cardBaseUrl: cardBaseUrl,
        cardApiKey: cardApiKey,
        cardPartnerCode: cardPartnerCode,
        cardPublicKey: cardPublicKey,
        paymentMethodCode: paymentMethodCode,
        transcode: transCode,
        orderDescription: orderDescription,
        amount: amount,
        buyerFullname: buyerFullname,
        buyerEmail: buyerEmail,
        buyerMobile: buyerMobile,
        buyerAddress: buyerAddress,
        returnUrl: returnUrl,
        cancelUrl: cancelUrl,
        notifyUrl: cardNotifyUrl
      }
      console.log(bodyData)

      const apiRes = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          'X-API-KEY': this.vicaApiKey
        },
        body: JSON.stringify(bodyData)
      })

      const resData = await apiRes.json()

      if (!resData.isSucceed) {
        throw new Error(resData.msg)
      }

      return {
        isSucceed: true,
        msg: resData.message,
        data: resData.data
      }
    } catch (error) {
      console.log('createOrder Error', error)
      return {
        isSucceed: false,
        msg: error.message,
        data: {}
      }
    }
  }

  async createVirtualCollectCashOrder(
    virtualBaseUrl: string,
    virtualApiKey: string,
    virtualPartnerCode: string,
    virtualPublicKey: string,
    virtualAccountName: string,
    virtualBankCode: string,
    virtualNotifyUrl: string,
    transCode: string,
    orderDescription: string,
    amount: number,
    extraInfo: string
  ) {
    try {
      const url = `${this.vicaBaseUrl}/internals/virtual/create-collect-cash-order`

      const bodyData = {
        virtualBaseUrl,
        virtualApiKey,
        virtualPartnerCode,
        virtualPublicKey,
        virtualAccountName,
        virtualBankCode,
        transcode: transCode,
        orderDescription,
        amount,
        notifyUrl: virtualNotifyUrl,
        extraInfo
      }
      console.log(bodyData)

      const apiRes = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          'X-API-KEY': this.vicaApiKey
        },
        body: JSON.stringify(bodyData)
      })

      const resData = await apiRes.json()

      if (resData.error) {
        throw new Error(resData.msg)
      }

      return {
        isSucceed: true,
        msg: resData.msg,
        data: resData
      }
    } catch (error) {
      console.log('createOrder Error', error)
      return {
        isSucceed: false,
        msg: error.message,
        data: {}
      }
    }
  }

  async createVirtualPayCashOrder(
    virtualBaseUrl: string,
    virtualApiKey: string,
    virtualPartnerCode: string,
    virtualPublicKey: string,
    virtualNotifyUrl: string,
    transCode: string,
    bankCode: string,
    bankAccountNo: string,
    bankAccountName: string,
    amount: number,
    bankTransferContent: string,
    extraInfo: string
  ) {
    try {
      const url = `${this.vicaBaseUrl}/internals/virtual/create-pay-cash-order`

      const bodyData = {
        virtualBaseUrl,
        virtualApiKey,
        virtualPartnerCode,
        virtualPublicKey,
        notifyUrl: virtualNotifyUrl,
        transCode,
        bankCode,
        bankAccountNo,
        bankAccountName: removeVietnameseTones(bankAccountName),
        amount,
        bankTransferContent,
        extraInfo
      }
      console.log(bodyData)

      const apiRes = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          'X-API-KEY': this.vicaApiKey
        },
        body: JSON.stringify(bodyData)
      })

      const resData = await apiRes.json()

      if (resData.error) {
        throw new Error(resData.msg)
      }

      return {
        isSucceed: true,
        msg: resData.msg,
        data: resData
      }
    } catch (error) {
      console.log('create pay cash order error', error)
      return {
        isSucceed: false,
        msg: error.message,
        data: {}
      }
    }
  }

  async checkPayCashOrder(
    virtualBaseUrl: string,
    virtualApiKey: string,
    virtualPartnerCode: string,
    virtualPublicKey: string,
    orderCode: string
  ) {
    try {
      const url = `${this.vicaBaseUrl}/internals/virtual/get-pay-cash-order-info`

      const bodyData = {
        virtualBaseUrl,
        virtualApiKey,
        virtualPartnerCode,
        virtualPublicKey,
        orderCode
      }
      // console.log(bodyData)

      const apiRes = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          'X-API-KEY': this.vicaApiKey
        },
        body: JSON.stringify(bodyData)
      })

      const resData = await apiRes.json()

      if (resData.error) {
        throw new Error(resData.msg)
      }
      // console.log('res pay cash', resData)

      return {
        isSucceed: true,
        msg: resData.msg,
        data: resData.data
      }
    } catch (error) {
      console.log('check order Error', error)
      return {
        isSucceed: false,
        msg: error.message,
        data: {}
      }
    }
  }

  async matchTransactionStatus(amount: number, paidAmount: number) {
    if (paidAmount == 0) {
      return VirtualTransactionStatus.INITIAL
    }

    if (paidAmount != amount) {
      return VirtualTransactionStatus.REVIEW
    }

    if (paidAmount == amount) {
      return VirtualTransactionStatus.SUCCEED
    }

    return VirtualTransactionStatus.INITIAL
  }
  //Xendit
  async createPaymentOrder(
    currency: string,
    amount: number,
    customerId: string,
    referenceId: string,
    callbackUrl: string,
    channelCode: string,
    virtualAccountName: string,
    extraInfo: string,
    xenditKey: string
  ) {
    try {
      const url = `${this.vicaBaseUrl}/internals/virtual/create-payment-order`

      const bodyData = {
        currency,
        amount,
        customerId,
        referenceId,
        callbackUrl,
        channelCode,
        virtualAccountName,
        extraInfo,
        xenditKey
      }
      console.log(bodyData)

      const apiRes = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          'X-API-KEY': this.vicaApiKey
        },
        body: JSON.stringify(bodyData)
      })

      const resData = await apiRes.json()

      if (resData.error) {
        throw new Error(resData.msg)
      }

      return {
        isSucceed: true,
        msg: resData.msg,
        data: resData
      }
    } catch (error) {
      console.log('create payment error', error)
      return {
        isSucceed: false,
        msg: error.message,
        data: {}
      }
    }
  }

  async createPayout(
    amount: string,
    customerId: string,
    referenceId: string,
    callbackUrl: string,
    channelCode: string,
    bankAccountName: string,
    bankAccountNo: string,
    extraInfo: string
  ) {
    try {
      const url = `${this.vicaBaseUrl}/internals/virtual/create-payout`

      const bodyData = {
        bankAccountName,
        amount,
        customerId,
        referenceId,
        callbackUrl,
        channelCode,
        bankAccountNo,
        extraInfo
      }
      console.log(bodyData)

      const apiRes = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          'X-API-KEY': this.vicaApiKey
        },
        body: JSON.stringify(bodyData)
      })

      const resData = await apiRes.json()

      if (resData.error) {
        throw new Error(resData.msg)
      }

      return {
        isSucceed: true,
        msg: resData.msg,
        data: resData
      }
    } catch (error) {
      console.log('create payout error', error)
      return {
        isSucceed: false,
        msg: error.message,
        data: {}
      }
    }
  }
  //VOV5
  async createVAVov5(
    requestId: string,
    nameOfBeneficiary: string,
    amount: number,
    callbackUrl: string,
    description: string
  ) {
    try {
      const url = `${this.vicaBaseUrl}/internals/virtual/vov5/create-va`

      const bodyData = {
        requestId,
        nameOfBeneficiary,
        amount,
        callbackUrl,
        description
      }
      console.log(bodyData)

      const apiRes = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          'X-API-KEY': this.vicaApiKey
        },
        body: JSON.stringify(bodyData)
      })

      const resData = await apiRes.json()

      if (resData.error) {
        throw new Error(resData.msg)
      }

      return {
        isSucceed: true,
        msg: resData.msg,
        data: resData
      }
    } catch (error) {
      console.log('createOrder Error', error)
      return {
        isSucceed: false,
        msg: error.message,
        data: {}
      }
    }
  }

  async transferVov5(
    requestId: string,
    numberOfBeneficiary: string,
    nameOfBeneficiary: string,
    bankId: string,
    amount: number,
    callbackUrl: string,
    description: string = 'CK'
  ) {
    try {
      const url = `${this.vicaBaseUrl}/internals/virtual/vov5/transfer`

      const bodyData = {
        requestId,
        numberOfBeneficiary,
        nameOfBeneficiary,
        bankId,
        amount,
        callbackUrl,
        description
      }
      console.log(bodyData)

      const apiRes = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          'X-API-KEY': this.vicaApiKey
        },
        body: JSON.stringify(bodyData)
      })

      const resData = await apiRes.json()

      if (resData.error) {
        throw new Error(resData.msg)
      }

      return {
        isSucceed: true,
        msg: resData.msg,
        data: resData
      }
    } catch (error) {
      console.log('createOrder Error', error)
      return {
        isSucceed: false,
        msg: error.message,
        data: {}
      }
    }
  }
}
