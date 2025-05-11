import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Role } from './role.interface'
import { PermissionService } from '@/modules/resources/permission/permission.service'
import { difference, concat, cloneDeep, remove } from 'lodash'
import { RoleCreateDto } from './dto/role-create'

@Injectable()
export class RoleService {
  constructor(
    @InjectModel('Role') private roleModel: Model<Role>,
    private permissionService: PermissionService
  ) {}

  async findById(id: string): Promise<any> {
    return this.roleModel.findById(id)
  }

  async getListRoleForAdmin(
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
          { name: { $regex: new RegExp(`.*${keyword}.*`, 'i') } },
          { title: { $regex: new RegExp(`.*${keyword}.*`, 'i') } },
          { description: { $regex: new RegExp(`.*${keyword}.*`, 'i') } }
        ]
      }

      if (isCounting) {
        return await this.roleModel.countDocuments(filter)
      }

      const sortObj = {}
      sortObj[sortBy] = sortType

      if (length === -1) {
        return await this.roleModel.find(filter).sort(sortObj)
      }
      return await this.roleModel
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

  async suggestRole(params, user) {
    try {
      const filter = {
        isDeleted: false,
        title: new RegExp(params.keyword, 'i')
      }

      if (user.role.key !== 'admin') {
        filter['key'] = 'member'
      }

      const list = await this.roleModel.find(filter).select('_id title')
      return {
        data: list,
        count: list.length
      }
    } catch (e) {
      console.log(e)
    }

    return []
  }

  async createRoleForAdmin(createRoleDto: RoleCreateDto) {
    try {
      const checkExistRole = await this.checkExist(createRoleDto)

      if (checkExistRole) {
        throw new HttpException('Role already exist', HttpStatus.CONFLICT)
      }

      createRoleDto.permissions = createRoleDto.permissionIdList

      const newRole = await this.roleModel.create(createRoleDto)

      if (newRole) {
        createRoleDto.permissions.forEach(async (id) => {
          const roles = await this.permissionService.findRolesById(id)

          const newRoles = concat(roles, newRole.id)

          await this.permissionService.updatePermissionForAdmin(id, {
            roles: newRoles
          })
        })

        return newRole.toObject()
      }
    } catch (e) {
      console.log(e)
    }

    return null
  }

  async updateRoleForAdmin(roleId: string, updateRoleDto) {
    updateRoleDto.permissionsPrev = updateRoleDto.permissions
    updateRoleDto.permissions = updateRoleDto.permissionIdList

    const difAdd = difference(
      updateRoleDto.permissions,
      updateRoleDto.permissionsPrev
    )
    const difSub = difference(
      updateRoleDto.permissionsPrev,
      updateRoleDto.permissions
    )

    try {
      const role = await this.roleModel.findByIdAndUpdate(
        roleId,
        updateRoleDto,
        {
          new: true
        }
      )
      if (role) {
        if (difAdd) {
          difAdd.forEach(async (id: string) => {
            const roles = await this.permissionService.findRolesById(id)

            const newRoles = concat(roles, roleId)

            await this.permissionService.updatePermissionForAdmin(id, {
              roles: newRoles
            })
          })
        }

        if (difSub) {
          difSub.forEach(async (id: string) => {
            const roles = await this.permissionService.findRolesById(id)
            const newRoles = cloneDeep(roles)

            remove(newRoles, (item) => roleId == item.toString())

            await this.permissionService.updatePermissionForAdmin(id, {
              roles: newRoles
            })
          })
        }

        return role
      }
    } catch (e) {
      console.log(e)
    }

    return false
  }

  async checkExist(params) {
    try {
      const filter = {
        key: params.key,
        isDeleted: false
      }

      const role = await this.roleModel.findOne(filter)

      if (role) {
        return true
      }
    } catch (e) {
      console.log(e)
    }

    return false
  }

  async getByKey(key) {
    try {
      const obj = await this.roleModel.findOne({ key })

      if (obj) {
        return obj
      }
    } catch (e) {
      console.log(e)
    }

    return null
  }

  async deleteRole(roleId: string, userId: string) {
    const role = await this.roleModel.findById(roleId)

    if (!role) {
      throw new HttpException('Role not found', HttpStatus.NOT_FOUND)
    }

    return role.updateOne({
      deleted: true,
      deletedBy: userId,
      deletedAt: new Date()
    })
  }
}
