import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Permission } from './permission.interface'
import { PermissionCreateDto } from './dto/permission-create'
import { PermissionUpdateDto } from './dto/permission-update'

@Injectable()
export class PermissionService {
  constructor(
    @InjectModel('Permission') private permissionModel: Model<Permission>
  ) {}

  async getListPermissionForAdmin(
    isCounting = false,
    keyword = null,
    start = 0,
    length = 10,
    sortBy = '_id',
    sortType = 'asc'
  ) {
    try {
      const filter = {
        isDeleted: false
      }
      if (keyword) {
        filter['$or'] = [
          { key: { $regex: new RegExp(`.*${keyword}.*`, 'i') } },
          { title: { $regex: new RegExp(`.*${keyword}.*`, 'i') } },
          { description: { $regex: new RegExp(`.*${keyword}.*`, 'i') } }
        ]
      }

      if (isCounting) {
        return await this.permissionModel.countDocuments(filter)
      }

      const sortObj = {}
      sortObj[sortBy] = sortType

      if (length === -1) {
        return await this.permissionModel.find(filter).sort(sortObj)
      }
      return await this.permissionModel
        .find(filter)
        .sort(sortObj)
        .limit(length)
        .skip(start)
    } catch (e) {
      console.log(e)
    }

    if (isCounting) {
      return 0
    }
    return []
  }

  async createPermissonForAdmin(createPermissonDto: PermissionCreateDto) {
    try {
      const existPermisson = await this.checkExistByKey(createPermissonDto.key)

      if (existPermisson)
        throw new HttpException(
          'Permission already exist.',
          HttpStatus.CONFLICT
        )

      return await this.permissionModel.create(createPermissonDto)
    } catch (e) {
      throw e
    }
  }

  async updatePermissionForAdmin(
    permissionId: string,
    updatePermissonDto: PermissionUpdateDto
  ) {
    const permission = await this.permissionModel.findOne({ _id: permissionId })

    if (!permission)
      throw new HttpException('Permission not found.', HttpStatus.NOT_FOUND)

    return await this.permissionModel.findByIdAndUpdate(
      permissionId,
      updatePermissonDto,
      {
        new: true
      }
    )
  }

  async findRolesById(id) {
    try {
      const permission = await this.permissionModel.findById(id)

      if (permission) {
        return permission.roles
      } else {
      }
    } catch (e) {
      console.log(e)
    }
  }

  async checkExistByKey(key: string) {
    const filter = { key: key, isDeleted: false }

    const permission = await this.permissionModel.findOne(filter)

    if (permission) {
      return true
    }

    return false
  }

  async checkPermission(roleId, key) {
    try {
      const filter = { key: key, roles: roleId, isDeleted: false }

      const permission = await this.permissionModel.findOne(filter)

      if (permission) {
        return true
      }
    } catch (e) {
      console.log(e)
    }

    return false
  }

  async deletePermission(id: string, userId: string) {
    const permission = await this.permissionModel.findById(id)

    if (!permission)
      throw new HttpException('Permission not found.', HttpStatus.NOT_FOUND)
    return permission.updateOne({
      deleted: true,
      deletedBy: userId,
      deletedAt: new Date()
    })
  }
}
