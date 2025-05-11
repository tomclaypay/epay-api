import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { omit, sumBy, pick } from 'lodash'
import { Model } from 'mongoose'
import { Bank } from './banks.interface'
import {
  CreateBankDto,
  GetBanksQueriesDto,
  UpdateBankDto
} from './dto/bank-request.dto'
import { BankType } from './dto/general.dto'

@Injectable()
export class BanksService {
  constructor(@InjectModel('Bank') private bankModel: Model<Bank>) {}

  async getDepositBanksForSystem() {
    const banks = await this.bankModel.find({ isEnabled: true })
    return banks
  }

  // Admin
  async getBanksForAdmin(getBanksQueriesDto: GetBanksQueriesDto) {
    const offset = getBanksQueriesDto.offset || 0
    const limit = getBanksQueriesDto.limit || 10

    const options = {
      skip: offset,
      limit,
      sort: {
        createdAt: -1
      }
    }

    const queries = {}

    if (getBanksQueriesDto?.status) {
      queries['isEnabled'] =
        getBanksQueriesDto.status === 'enabled'
          ? true
          : 'disabled'
          ? false
          : null
    }

    if (getBanksQueriesDto?.accountType) {
      queries['bankAccountType'] = getBanksQueriesDto.accountType
    }

    const total = await this.bankModel.countDocuments(queries)

    const banks = await this.bankModel.find(queries, null, options)

    return {
      total,
      offset,
      limit,
      data: banks
    }
  }

  async bankListing(
    isCounting = false,
    keyword = null,
    bankType = '-1',
    isEnabled = '-1',
    start = 0,
    length = 10,
    sortBy = '_id',
    sortType = 'asc'
  ) {
    try {
      const filter = {}
      if (keyword) {
        filter['$or'] = [
          { bankName: { $regex: new RegExp(`.*${keyword}.*`, 'i') } },
          { bankAccountName: { $regex: new RegExp(`.*${keyword}.*`, 'i') } }
        ]
      }

      if (bankType !== '-1') {
        filter['bankType'] = bankType
      }

      if (isEnabled !== '-1') {
        filter['isEnabled'] = isEnabled === 'active' ? true : false
      }

      if (isCounting) {
        return await this.bankModel.countDocuments(filter)
      }

      const sortObj = {}
      sortObj[sortBy] = sortType

      if (length === -1) {
        return await this.bankModel.find(filter).sort(sortObj)
      }
      return await this.bankModel
        .find(filter)
        .sort(sortObj)
        .limit(length)
        .skip(start)
    } catch (e) {
      throw e
    }
  }

  async getBankDetailForAdmin(bankId: string) {
    const bank = await this.bankModel.findOne({ _id: bankId })

    if (!bank) {
      throw new HttpException('Bank not found', HttpStatus.NOT_FOUND)
    }

    return bank
  }

  async createBankAdmin(bankData: CreateBankDto) {
    try {
      return await this.bankModel.create(bankData)
    } catch (error) {
      throw error
    }
  }

  async updateBankAdmin(
    bankId: string,
    updateBankData: UpdateBankDto,
    userId: string
  ) {
    const bank = await this.bankModel.findOne({ _id: bankId })
    if (!bank) throw new HttpException('Bank not found.', HttpStatus.NOT_FOUND)

    return await this.bankModel.findByIdAndUpdate(
      bankId,
      {
        ...updateBankData,
        updatedBy: userId
      },
      {
        new: true
      }
    )
  }

  // API
  async getDepositBanksForExternal() {
    const banks = await this.bankModel
      .find({ isEnabled: true, bankType: BankType.Deposit })
      .select('bankName bankAccount bankAccountName')
    return banks.map((bank) =>
      pick(bank.toObject(), 'bankName', 'bankAccount', 'bankAccountName')
    )
  }

  // Summary
  async getSummaryForAdmin() {
    const banks = await this.bankModel.find({
      isEnabled: true
    })

    return sumBy(banks, 'balance') || 0
  }

  async deleteBank(id: string, userId: string) {
    const bank = await this.bankModel.findById(id)
    if (!bank) {
      throw new HttpException('Bank not found', HttpStatus.NOT_FOUND)
    }
    return bank.updateOne({
      deleted: true,
      deletedBy: userId,
      deletedAt: new Date()
    })
  }
}
