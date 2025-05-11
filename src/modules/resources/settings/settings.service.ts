import { omit } from 'lodash'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { UpdateSettingsDto } from './dto/setting-request.dto'
import { Setting } from './settings.interface'

@Injectable()
export class SettingsService {
  constructor(@InjectModel('Setting') private settingModel: Model<Setting>) {}

  async getSettings() {
    return this.settingModel.findOne()
  }

  async getSettingsForAdmin() {
    const setting = await this.settingModel.findOne().select('-id')
    return omit(setting.toObject(), '_id')
  }

  async updateSettingsForAdmin(updateSettingsDto: UpdateSettingsDto) {
    const setting = await this.settingModel.findOne()

    const newSetting = await this.settingModel.findOneAndUpdate(
      {
        _id: setting.id
      },
      updateSettingsDto,
      { new: true }
    )
    return omit(newSetting.toObject(), '_id')
  }

  async getSettingsForExternal() {
    const setting = await this.settingModel.findOne().select('-id ')
    return omit(setting.toObject(), '_id')
  }

  async getWithdrawalBanksForExternal() {
    const setting = await this.settingModel.findOne()
    let withdrawalBanks = setting.withdrawalBanks
    if (setting.virtualType === 'VOV5') {
      withdrawalBanks = setting.withdrawalBanksVov5
    }
    return { withdrawalBanks }
  }

  async getWithdrawalBanksForAdmin() {
    const setting = await this.settingModel.findOne()
    let withdrawalBanks = setting.withdrawalBanks
    if (setting.virtualType === 'VOV5') {
      withdrawalBanks = setting.withdrawalBanksVov5
    }
    return { withdrawalBanks }
  }
}
