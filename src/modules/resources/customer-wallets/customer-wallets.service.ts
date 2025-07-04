import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CustomerWallet } from './customer-wallet.interface'
import {
  CreateCustomerWalletDto,
  GetWalletAddressByCustomerIdDto,
  UpdateCustomerWalletDto
} from './dto/customer-wallets.dto'
import { ChainName } from '@/common/const/general'
import { UpayAdapterService } from '@/modules/adapters/upay/upay.service'

@Injectable()
export class CustomerWalletsService {
  constructor(
    @InjectModel('CustomerWallet')
    private customerWalletModel: Model<CustomerWallet>,
    private readonly upayAdapterService: UpayAdapterService
  ) {}

  async getCustomerWalletById(id: string) {
    return this.customerWalletModel.findById(id)
  }

  async getCustomerWalletByCustomerId(customerId: string) {
    return this.customerWalletModel.findOne({
      customerId
    })
  }

  async getCustomerWallet(customerId: string) {
    return this.customerWalletModel.findOne({
      customerId
    })
  }

  async getWalletAddressForCrypto(
    getWalletAddressByCustomerIdDto: GetWalletAddressByCustomerIdDto
  ) {
    const customerWallet = await this.customerWalletModel.findOne({
      customerId: getWalletAddressByCustomerIdDto.customerId
    })
    if (
      !customerWallet ||
      (getWalletAddressByCustomerIdDto.chainName === ChainName.TRON &&
        !customerWallet.tronAddress) ||
      ((getWalletAddressByCustomerIdDto.chainName === ChainName.ETHEREUM ||
        getWalletAddressByCustomerIdDto.chainName === ChainName.BSC) &&
        !customerWallet.evmAddress)
    ) {
      const addressNew = await this.upayAdapterService.getWalletAddress(
        getWalletAddressByCustomerIdDto.customerId,
        getWalletAddressByCustomerIdDto.chainName,
        getWalletAddressByCustomerIdDto.mt5Id
      )

      if (!addressNew.isSucceed) {
        throw new HttpException(
          'Cannot get wallet address',
          HttpStatus.BAD_REQUEST
        )
      }
      const address = addressNew.data.address
      switch (getWalletAddressByCustomerIdDto.chainName) {
        case ChainName.TRON:
          if (customerWallet) {
            await this.customerWalletModel.updateOne(
              {
                _id: customerWallet._id
              },
              {
                $set: {
                  tronAddress: address,
                  mt5Id: getWalletAddressByCustomerIdDto.mt5Id
                }
              }
            )
          } else {
            await this.customerWalletModel.create({
              customerId: getWalletAddressByCustomerIdDto.customerId,
              tronAddress: address,
              mt5Id: getWalletAddressByCustomerIdDto.mt5Id,
              callback: getWalletAddressByCustomerIdDto.callback
            })
          }

          break
        case ChainName.ETHEREUM:
        case ChainName.BSC:
          if (customerWallet) {
            await this.customerWalletModel.updateOne(
              {
                _id: customerWallet._id
              },
              {
                $set: {
                  evmAddress: address,
                  mt5Id: getWalletAddressByCustomerIdDto.mt5Id
                }
              }
            )
          } else {
            await this.customerWalletModel.create({
              customerId: getWalletAddressByCustomerIdDto.customerId,
              evmAddress: address,
              mt5Id: getWalletAddressByCustomerIdDto.mt5Id,
              callback: getWalletAddressByCustomerIdDto.callback
            })
          }

          break
        default:
          throw new HttpException('Chain not supported', HttpStatus.BAD_REQUEST)
      }
      return {
        address,
        chainName: getWalletAddressByCustomerIdDto.chainName
      }
    }
    await this.customerWalletModel.updateOne(
      {
        _id: customerWallet._id
      },
      {
        $set: {
          mt5Id: getWalletAddressByCustomerIdDto.mt5Id
        }
      }
    )
    return {
      address:
        getWalletAddressByCustomerIdDto.chainName === ChainName.TRON
          ? customerWallet.tronAddress
          : customerWallet.evmAddress,
      chainName: getWalletAddressByCustomerIdDto.chainName
    }
  }

  async createCustomerWallet(createCustomerWalletDto: CreateCustomerWalletDto) {
    return this.customerWalletModel.create(createCustomerWalletDto)
  }

  async updateCustomerWallet(
    customerWalletId: string,
    updateCustomerWalletDto: UpdateCustomerWalletDto
  ) {
    return this.customerWalletModel.findByIdAndUpdate(
      customerWalletId,
      updateCustomerWalletDto,
      {
        new: true
      }
    )
  }

  async getCustomerWalletByTrc20Address(tronAddress: string) {
    return this.customerWalletModel.findOne({ tronAddress })
  }

  async getCustomerWalletByTrc20Addresses(trc20Addresses: string[]) {
    return this.customerWalletModel.find({
      tronAddress: { $in: trc20Addresses }
    })
  }

  async getCustomerWalletByEvmAddress(evmAddress: string) {
    return this.customerWalletModel.findOne({ evmAddress })
  }

  async getCustomerWalletByEvmAddresses(evmAddresses: string[]) {
    return this.customerWalletModel.find({
      evmAddress: { $in: evmAddresses }
    })
  }

  async searchCustomerWallets(keyword: string) {
    const queries = {}

    const searches = [
      {
        tronAddress: {
          $regex: keyword,
          $options: 'i'
        }
      },
      {
        evmAddress: {
          $regex: keyword,
          $options: 'i'
        }
      }
    ]
    queries['$or'] = searches

    return this.customerWalletModel.find(queries)
  }

  async getCustomerWalletListing(
    isCounting = false,
    keyword = null,
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
          { merchantCode: { $regex: new RegExp(`.*${keyword}.*`, 'i') } },
          { tronAddress: { $regex: new RegExp(`.*${keyword}.*`, 'i') } },
          { evmAddress: { $regex: new RegExp(`.*${keyword}.*`, 'i') } }
        ]
      }

      if (startDate) {
        filter['createdAt'] = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }

      if (isCounting) {
        return await this.customerWalletModel.countDocuments(filter)
      }

      const sortObj = {}
      sortObj[sortBy] = sortType

      if (length === -1) {
        return await this.customerWalletModel.find(filter).sort(sortObj)
      }

      return await this.customerWalletModel
        .find(filter)
        .populate('merchant')
        .sort(sortObj)
        .limit(length)
        .skip(start)
    } catch (e) {
      throw e
    }
  }
}
