import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User } from './users.interface'
import { RoleService } from '@/modules/resources/role/role.service'
import bcrypt from 'bcrypt'
import {
  CreateUserDto,
  GetUsersQueriesDto,
  UpdateUserDto
} from './dto/user-request.dto'
import { omit } from 'lodash'

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    private roleService: RoleService
  ) {}

  async getUserByUsername(username: string): Promise<any> {
    return this.userModel.findOne({ username }).select('-password').populate({
      path: 'role',
      select: '_id key'
    })
  }

  async findById(userId: string): Promise<any> {
    return this.userModel.findById(userId).select('-password').populate({
      path: 'role',
      select: '_id key'
    })
  }

  async getUsers(getUsersQueriesDto: GetUsersQueriesDto) {
    const offset = getUsersQueriesDto.offset || 0
    const limit = getUsersQueriesDto.limit || 10

    const options = {
      skip: offset,
      limit,
      sort: {
        createdAt: -1
      }
    }

    const queries = {}

    if (getUsersQueriesDto?.status) {
      queries['active'] =
        getUsersQueriesDto.status === 'enabled'
          ? true
          : 'disabled'
          ? false
          : null
    }

    if (getUsersQueriesDto?.role) {
      const role = await this.roleService.getByKey(getUsersQueriesDto.role)
      queries['role'] = role.id
    }

    const total = await this.userModel.countDocuments(queries)

    const users = await this.userModel
      .find(queries, null, options)
      .populate({
        path: 'role',
        select: '_id key'
      })
      .select('-password')

    return {
      total,
      offset,
      limit,
      data: users
    }
  }

  async getUserDetail(userId: string) {
    const user = await this.userModel
      .findOne({ _id: userId })
      .populate({
        path: 'role',
        select: '_id key'
      })
      .select('-password')

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    }

    return user
  }

  async comparePassword(plainPass: string, password: string): Promise<boolean> {
    return bcrypt.compare(plainPass, password)
  }

  async attempt(username: string, password: string): Promise<User | undefined> {
    const user = await this.userModel.findOne({ username }).populate({
      path: 'role',
      select: '_id key'
    })

    if (user) {
      const matchPassword = await this.comparePassword(password, user.password)

      if (matchPassword) {
        return user
      }
    }

    return null
  }

  async createUser(userData: CreateUserDto) {
    try {
      const usernameExist = await this.userModel.findOne({
        username: userData.username
      })

      if (usernameExist) {
        throw new HttpException('Username already exist.', HttpStatus.CONFLICT)
      }

      const salt = await bcrypt.genSalt(10)

      const newUserData = omit(userData, 'password', 'role')

      const role = await this.roleService.findById(userData.role)
      if (role) {
        newUserData['role'] = role.id

        newUserData['password'] = await bcrypt.hash(userData.password, salt)

        return await this.userModel.create(newUserData)
      }
    } catch (error) {
      throw error
    }
  }

  async updateUser(userId: string, updateUserData: UpdateUserDto) {
    const user = await this.userModel.findOne({ _id: userId })
    if (!user) throw new HttpException('User not found.', HttpStatus.NOT_FOUND)

    if (updateUserData.password) {
      const salt = await bcrypt.genSalt(10)

      updateUserData['password'] = await bcrypt.hash(
        updateUserData.password,
        salt
      )
    }

    return await this.userModel.findByIdAndUpdate(userId, updateUserData, {
      new: true
    })
  }

  async getProfile(user: any): Promise<any> {
    try {
      const profile = await this.userModel
        .findById(user._id)
        .select('-password')
        .populate({
          path: 'role',
          select: '_id key title',
          populate: {
            path: 'permissions',
            select: '_id key'
          }
        })
        .lean()

      return profile
    } catch (e) {
      console.log('error', e)
    }

    return null
  }

  async userListing(
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
          { fullName: { $regex: new RegExp(`.*${keyword}.*`, 'i') } },
          { username: { $regex: new RegExp(`.*${keyword}.*`, 'i') } }
        ]
      }

      if (isCounting) {
        return await this.userModel.countDocuments(filter)
      }

      const sortObj = {}
      sortObj[sortBy] = sortType

      if (length === -1) {
        return await this.userModel.find(filter).sort(sortObj)
      }
      return await this.userModel
        .find(filter)
        .populate('role', 'title')
        .sort(sortObj)
        .limit(length)
        .skip(start)
    } catch (e) {
      throw e
    }
  }

  async deleteUser(id: string, userId: string): Promise<any> {
    const user = await this.userModel.findById(id)
    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST)
    }
    return await this.userModel.updateOne({
      deleted: true,
      deletedBy: userId,
      deletedAt: new Date()
    })
  }
}
