import { PermissionGuard } from '@/modules/resources/auth/permission.guard'
import {
  Controller,
  UseGuards,
  Get,
  Query,
  Request,
  UsePipes,
  ValidationPipe,
  Param,
  Body,
  Patch,
  Post,
  Delete,
  Put
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../../resources/auth/jwt-auth.guard'
import { LocalAuthGuard } from '../../resources/auth/local-auth.guard'
import { Permission } from '../../resources/auth/permission.decorator'
import {
  CreateBankDto,
  GetBanksQueriesDto,
  UpdateBankDto,
  BankListing
} from '../../resources/banks/dto/bank-request.dto'
import {
  GetBanksResponse,
  BankDetail
} from '../../resources/banks/dto/bank-response.dto'
import {
  BANK_CREATE,
  BANK_CRUD,
  BANK_DELETE,
  BANK_GET,
  BANK_TRANSACTION_CRUD,
  BANK_TRANSACTION_DELETE,
  BANK_TRANSACTION_GET,
  BANK_UPDATE,
  CASHOUT_CREATE,
  CASHOUT_CREATE_USER,
  CASHOUT_CRUD,
  CASHOUT_DELETE,
  CASHOUT_GET,
  CASHOUT_UPDATE,
  DEPOSIT_CREATE,
  DEPOSIT_CRUD,
  DEPOSIT_DELETE,
  DEPOSIT_GET,
  DEPOSIT_MANUAL,
  DEPOSIT_RESEND_CALLBACK,
  DEPOSIT_UPDATE,
  DEPOSIT_VERIFY,
  PERMISSION_CREATE,
  PERMISSION_CRUD,
  PERMISSION_DELETE,
  PERMISSION_GET,
  PERMISSION_UPDATE,
  ROLE_CREATE,
  ROLE_CRUD,
  ROLE_DELETE,
  ROLE_GET,
  ROLE_UPDATE,
  SETTING_CRUD,
  SETTING_GET,
  SUMMARY_GET,
  USER_CREATE,
  USER_CRUD,
  USER_DELETE,
  USER_GET,
  USER_UPDATE,
  VIRTUAL_TRANSACTION_CRUD,
  VIRTUAL_TRANSACTION_GET,
  WITHDRAWAL_AUTO,
  WITHDRAWAL_CREATE,
  WITHDRAWAL_CRUD,
  WITHDRAWAL_DELETE,
  WITHDRAWAL_GET,
  WITHDRAWAL_MANUAL,
  WITHDRAWAL_MULTIPLE_AUTO,
  WITHDRAWAL_RESEND_CALLBACK,
  WITHDRAWAL_UPDATE,
  WITHDRAWAL_UPDATE_STATUS
} from '../../common/contants/permissions'
import {
  AuthApiError,
  PublicApiError
} from '../../common/decorators/api-error-respone.decorator'
import {
  GetDepositsQueriesDto,
  DepositListing,
  ManualDepositDto,
  DepositListingForExport,
  ManualDepositsDto,
  CreateDepositOrderDto,
  UpdateDepositOrderDto
} from '../../resources/deposits/dto/deposit-request.dto'
import {
  GetDepositsResponse,
  DepositDetail
} from '../../resources/deposits/dto/deposit-response.dto'
import { PermissionCreateDto } from '../../resources/permission/dto/permission-create'
import { PermissionUpdateDto } from '../../resources/permission/dto/permission-update'
import { RoleCreateDto } from '../../resources/role/dto/role-create'
import { RoleSuggestDto } from '../../resources/role/dto/role-suggest'
import { RoleUpdateDto } from '../../resources/role/dto/role-update'
import {
  GetTransactionsQueriesDto,
  TransactionListing
} from '../../resources/bank-transactions/dto/bank-transactions-request.dto'
import {
  GetTransactionsResponse,
  TransactionDetail
} from '../../resources/bank-transactions/dto/bank-transaction-response.dto'
import {
  GetUsersQueriesDto,
  LoginDto,
  CreateUserDto,
  UpdateUserDto
} from '../../resources/users/dto/user-request.dto'
import {
  CreateUserResponse,
  GetUsersResponse,
  UserResponse
} from '../../resources/users/dto/user-response.dto'
import { DataTableParams } from '@/common/params/DataTableParams'
import { PagingParams } from '@/common/params/PagingParams'
import { AdminsService } from './admins.service'
import { GetSummaryResponse } from './dto/admin-response.dto'
import { GetSummaryQueriesDto } from './dto/admin-request.dto'
import { SettingsResponse } from '../../resources/settings/dto/setting-response.dto'
import { UpdateSettingsDto } from '../../resources/settings/dto/setting-request.dto'
import {
  CreateWithdrawalOrderByCryptoDto,
  CreateWithdrawalOrderDto,
  ManualWithdrawalDto,
  UpdateWithdrawalOrderByCryptoDto,
  UpdateWithdrawalOrderDto,
  UpdateWithdrawalStatusDto,
  WithdrawalListing,
  WithdrawalListingForExport
} from '../../resources/withdrawals/dto/withdrawal-request.dto'
import {
  WithdrawalBanksData,
  WithdrawalDetail
} from '../../resources/withdrawals/dto/withdrawal-response.dto'
import { WhitelistIPGuard } from '../../resources/auth/whitelist-ip.guard'
import {
  CreateCashoutOrderByUserDto,
  CreateCashoutOrderDto,
  UpdateCashoutOrderDto
} from '@/modules/resources/cashouts/dto/cashout-request.dto'

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminsController {
  constructor(private adminsService: AdminsService) {}

  //Users
  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Permission([USER_CRUD, USER_GET])
  @Get('users')
  @AuthApiError()
  @ApiOkResponse({
    description: 'Get users successful',
    type: GetUsersResponse
  })
  async getUsers(@Query() getUsersQueriesDto: GetUsersQueriesDto) {
    return this.adminsService.getUsers(getUsersQueriesDto)
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @Permission([USER_CRUD, USER_GET])
  @Post('users/list-for-datatable')
  @AuthApiError()
  async getListUserDatatableForAdmin(@Body() datatableParams: DataTableParams) {
    const params = datatableParams.getDataTableParams()
    const listObj = await this.adminsService.getListUserForAdmin(
      false,
      params.keyword,
      params.start,
      params.length,
      params.orderBy,
      params.orderType
    )
    const count = await this.adminsService.getListUserForAdmin(
      true,
      params.keyword,
      null,
      null,
      null,
      null
    )

    return {
      recordsTotal: count,
      data: listObj,
      draw: datatableParams.draw,
      recordsFiltered: count
    }
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard)
  @Post('users/me')
  @AuthApiError()
  @ApiOkResponse({
    description: 'Get users successful',
    type: UserResponse
  })
  async getProfile(@Request() req) {
    const user = await this.adminsService.getUserMe(req.user._id)
    return { user }
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Permission([USER_CRUD, USER_GET])
  @Get('users/:userId')
  @AuthApiError()
  @ApiOkResponse({
    description: 'Get user detail successful',
    type: UserResponse
  })
  async getUserDetail(@Param('userId') userId: string) {
    return this.adminsService.getUserDetail(userId)
  }

  @UseGuards(WhitelistIPGuard, LocalAuthGuard)
  @Post('users/login')
  @PublicApiError()
  @ApiOkResponse({
    description: 'Login successful'
  })
  async login(@Request() req, @Body() login: LoginDto) {
    return this.adminsService.login(req.user)
  }

  @UseGuards(WhitelistIPGuard)
  @Post('users/refresh-token')
  @AuthApiError()
  @ApiOkResponse({
    description: 'Refresh token successful'
  })
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.adminsService.refresh(refreshToken)
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @Permission([USER_CRUD, USER_CREATE])
  @Post('users/create')
  @AuthApiError()
  @ApiCreatedResponse({
    description: 'Create user successful',
    type: CreateUserResponse
  })
  async create(@Body() createUserData: CreateUserDto) {
    return this.adminsService.createUser(createUserData)
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @Permission([USER_CRUD, USER_UPDATE])
  @Patch('users/:userId/update')
  @AuthApiError()
  @ApiCreatedResponse({
    description: 'Create user successful',
    type: UserResponse
  })
  async update(
    @Param('userId') userId: string,
    @Body() updateUser: UpdateUserDto
  ) {
    return this.adminsService.updateUser(userId, updateUser)
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard)
  @Post('users/logout')
  @AuthApiError()
  @ApiOkResponse({
    description: 'Logout successful'
  })
  async logout(@Body('refreshToken') refreshToken: string) {
    return this.adminsService.logout(refreshToken)
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @Permission([USER_CRUD, USER_DELETE])
  @Delete('users/:userId')
  @AuthApiError()
  @ApiOkResponse({
    description: 'Delete user successful'
  })
  async delete(@Param('userId') userId: string, @Request() req) {
    return this.adminsService.deleteUser(userId, req.user._id)
  }

  //Banks
  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Permission([BANK_CRUD, BANK_GET])
  @Get('banks')
  @AuthApiError()
  @ApiOkResponse({
    description: 'Get banks successful',
    type: GetBanksResponse
  })
  async getBanksForAdmin(@Query() getBanksQueriesDto: GetBanksQueriesDto) {
    return this.adminsService.getBanksForAdmin(getBanksQueriesDto)
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @Permission([BANK_CRUD, BANK_GET])
  @Post('banks/list-for-datatable')
  @AuthApiError()
  async getListBankDatatableForAdmin(@Body() datatableParams: BankListing) {
    const params = datatableParams.getDataTableParams()
    const listObj = await this.adminsService.getListBankDatatableForAdmin(
      false,
      params.keyword,
      datatableParams.bankType,
      datatableParams.isEnabled,
      params.start,
      params.length,
      params.orderBy,
      params.orderType
    )
    const count = await this.adminsService.getListBankDatatableForAdmin(
      true,
      params.keyword,
      datatableParams.bankType,
      datatableParams.isEnabled,
      null,
      null,
      null,
      null
    )

    return {
      recordsTotal: count,
      data: listObj,
      draw: datatableParams.draw,
      recordsFiltered: count
    }
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Permission([BANK_CRUD, BANK_GET])
  @Get('banks/:bankId')
  @AuthApiError()
  @ApiOkResponse({
    description: 'Get bank detail successful',
    type: BankDetail
  })
  async getBankDetailForAdmin(@Param('bankId') bankId: string) {
    return this.adminsService.getBankDetailForAdmin(bankId)
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Permission([BANK_CRUD, BANK_CREATE])
  @Post('banks')
  @AuthApiError()
  @ApiOkResponse({
    description: 'Create bank detail successful',
    type: BankDetail
  })
  async createBankAdmin(@Body() createBankData: CreateBankDto) {
    return this.adminsService.createBankAdmin(createBankData)
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Permission([BANK_CRUD, BANK_UPDATE])
  @Patch('banks/:bankId')
  @AuthApiError()
  @ApiOkResponse({
    description: 'Update bank detail successful',
    type: BankDetail
  })
  async updateBankAdmin(
    @Param('bankId') bankId: string,
    @Body() updateBankData: UpdateBankDto,
    @Request() req
  ) {
    return this.adminsService.updateBankAdmin(
      bankId,
      updateBankData,
      req.user._id
    )
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Permission([BANK_CRUD, BANK_DELETE])
  @Delete('banks/:bankId')
  @AuthApiError()
  @ApiOkResponse({
    description: 'Delete bank detail successful',
    type: BankDetail
  })
  async deleteBankAdmin(@Param('bankId') bankId: string, @Request() req) {
    return this.adminsService.deleteBank(bankId, req.user._id)
  }

  //Deposits
  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Permission([DEPOSIT_CRUD, DEPOSIT_GET])
  @Get('deposits')
  @AuthApiError()
  @ApiOkResponse({
    description: 'Get deposits successful',
    type: GetDepositsResponse
  })
  async getDepositsForAdmin(
    @Query() getDepositsQueriesDto: GetDepositsQueriesDto
  ) {
    return this.adminsService.getDepositsForAdmin(getDepositsQueriesDto)
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @Permission([DEPOSIT_CRUD, DEPOSIT_GET])
  @Post('deposits/list-for-datatable')
  @AuthApiError()
  async getListDepositDatatableForAdmin(
    @Body() datatableParams: DepositListing
  ) {
    const params = datatableParams.getDataTableParams()
    const listObj = await this.adminsService.getListDepositDatatableForAdmin(
      false,
      params.keyword,
      datatableParams.isManual,
      datatableParams.status,
      null,
      null,
      datatableParams.type,
      params.start,
      params.length,
      params.orderBy,
      params.orderType,
      datatableParams.isCrypto
    )
    const count = await this.adminsService.getListDepositDatatableForAdmin(
      true,
      params.keyword,
      datatableParams.isManual,
      datatableParams.status,
      null,
      null,
      datatableParams.type,
      null,
      null,
      null,
      null,
      datatableParams.isCrypto
    )

    return {
      recordsTotal: count,
      data: listObj,
      draw: datatableParams.draw,
      recordsFiltered: count
    }
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permission([DEPOSIT_CRUD, DEPOSIT_GET])
  @Post('deposits/list-for-export')
  @AuthApiError()
  async getListDepositExportForAdmin(@Body() params: DepositListingForExport) {
    const listObj = await this.adminsService.getListDepositDatatableForAdmin(
      false,
      null,
      String(params.isManual),
      String(params.status),
      params.startDate,
      params.endDate,
      params.type,
      0,
      -1,
      null,
      null,
      params.isCrypto
    )

    return listObj
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Permission([DEPOSIT_CRUD, DEPOSIT_GET])
  @Get('deposits/:depositId')
  @AuthApiError()
  @ApiOkResponse({
    description: 'Get deposit detail successful',
    type: DepositDetail
  })
  async getDepositDetailForAdmin(@Param('depositId') depositId: string) {
    return this.adminsService.getDepositDetailForAdmin(depositId)
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Permission([DEPOSIT_CRUD, DEPOSIT_RESEND_CALLBACK])
  @Post('deposits/:depositId/resend-callback')
  @AuthApiError()
  @ApiCreatedResponse({
    description: 'Resend callback successful'
  })
  async resendDepositCallbackForAdmin(@Param('depositId') depositId: string) {
    return this.adminsService.resendDepositCallbackForAdmin(depositId)
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Permission([DEPOSIT_CRUD, DEPOSIT_MANUAL])
  @Post('deposits/:depositId/manual-deposit')
  @AuthApiError()
  @ApiCreatedResponse({
    description: 'Manual deposit successful'
  })
  async manualDepositForAdmin(
    @Request() req,
    @Param('depositId') depositId: string,
    @Body() manualDepositDto: ManualDepositDto
  ) {
    return this.adminsService.manualDeposit(
      req.user.username,
      depositId,
      manualDepositDto
    )
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Permission([DEPOSIT_CRUD, DEPOSIT_MANUAL])
  @Post('deposits/:depositId/manual-deposits')
  @AuthApiError()
  @ApiCreatedResponse({
    description: 'Manual deposits successful'
  })
  async manualDepositsForAdmin(
    @Request() req,
    @Param('depositId') depositId: string,
    @Body() manualDepositsDto: ManualDepositsDto
  ) {
    return this.adminsService.manualDeposits(
      req.user.username,
      depositId,
      manualDepositsDto
    )
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Permission([DEPOSIT_CRUD, DEPOSIT_VERIFY])
  @Post('deposits/:depositId/verify-deposit')
  @AuthApiError()
  @ApiCreatedResponse({
    description: 'Verify deposit successful'
  })
  async verifyDepositForAdmin(
    @Request() req,
    @Param('depositId') depositId: string
  ) {
    return this.adminsService.verifyDeposit(req.user.username, depositId)
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Permission([DEPOSIT_CRUD, DEPOSIT_CREATE])
  @Post('deposits')
  @AuthApiError()
  async createDepositOrder(
    @Body() createDepositOrderDto: CreateDepositOrderDto
  ) {
    return this.adminsService.createDepositOrder(createDepositOrderDto)
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Permission([DEPOSIT_CRUD, DEPOSIT_UPDATE])
  @Put('deposits/:depositId')
  @AuthApiError()
  async updateDepositOrder(
    @Param('depositId') depositId: string,
    @Body() updateDepositOrderDto: UpdateDepositOrderDto
  ) {
    return this.adminsService.updateDepositOrder(
      depositId,
      updateDepositOrderDto
    )
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Permission([DEPOSIT_CRUD, DEPOSIT_DELETE])
  @Delete('deposits/:depositId')
  @AuthApiError()
  async deleteDepositOrder(
    @Param('depositId') depositId: string,
    @Request() req
  ) {
    return this.adminsService.deleteDeposit(depositId, req.user._id)
  }

  //Withdrawals
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @Permission([WITHDRAWAL_CRUD, WITHDRAWAL_GET])
  @Post('withdrawals/list-for-datatable')
  @AuthApiError()
  async getListWithdrawalDatatableForAdmin(
    @Body() datatableParams: WithdrawalListing
  ) {
    const params = datatableParams.getDataTableParams()
    const listObj = await this.adminsService.getListWithdrawalDatatableForAdmin(
      false,
      params.keyword,
      datatableParams.isManual,
      datatableParams.status,
      null,
      null,
      params.start,
      params.length,
      params.orderBy,
      params.orderType,
      datatableParams.isCrypto
    )
    const count = await this.adminsService.getListWithdrawalDatatableForAdmin(
      true,
      params.keyword,
      datatableParams.isManual,
      datatableParams.status,
      null,
      null,
      null,
      null,
      null,
      null,
      datatableParams.isCrypto
    )

    return {
      recordsTotal: count,
      data: listObj,
      draw: datatableParams.draw,
      recordsFiltered: count
    }
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @Permission([WITHDRAWAL_CRUD, WITHDRAWAL_GET])
  @Post('withdrawals/list-for-export')
  @AuthApiError()
  async getListWithdrawalExportForAdmin(
    @Body() params: WithdrawalListingForExport
  ) {
    const listObj = await this.adminsService.getListWithdrawalDatatableForAdmin(
      false,
      null,
      String(params.isManual),
      String(params.status),
      params.startDate,
      params.endDate,
      0,
      -1,
      null,
      null,
      params.isCrypto
    )

    return listObj
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @Permission([WITHDRAWAL_CRUD, WITHDRAWAL_GET])
  @Get('withdrawals/:withdrawalId')
  @AuthApiError()
  @ApiOkResponse({
    description: 'Get withdrawal detail successful',
    type: WithdrawalDetail
  })
  async getWithdrawalDetailForAdmin(
    @Param('withdrawalId') withdrawalId: string
  ) {
    return this.adminsService.getWithdrawalDetailForAdmin(withdrawalId)
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permission([WITHDRAWAL_CRUD, WITHDRAWAL_MANUAL])
  @Post('withdrawals/:withdrawalId/manual-withdrawal')
  @AuthApiError()
  @ApiCreatedResponse({
    description: 'Manual withdrawal successful'
  })
  async manualWithdrawalForAdmin(
    @Request() req,
    @Param('withdrawalId') withdrawalId: string,
    @Body() manualWithdrawalDto: ManualWithdrawalDto
  ) {
    return this.adminsService.manualWithdrawal(
      req.user.username,
      withdrawalId,
      manualWithdrawalDto
    )
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permission([WITHDRAWAL_CRUD, WITHDRAWAL_AUTO, WITHDRAWAL_MULTIPLE_AUTO])
  @Post('withdrawals/:withdrawalId/auto-withdrawal')
  @AuthApiError()
  @ApiCreatedResponse({
    description: 'Update withdrawal status successful'
  })
  async autoWithdrawal(
    @Request() req,
    @Param('withdrawalId') withdrawalId: string,
    @Body('bankNameDest') bankNameDest: string,
    @Body('bankAccountNameDest') bankAccountNameDest: string
  ) {
    return this.adminsService.autoWithdrawal(
      withdrawalId,
      bankNameDest,
      null,
      bankAccountNameDest
    )
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permission([WITHDRAWAL_CRUD, WITHDRAWAL_UPDATE_STATUS])
  @Post('withdrawals/:withdrawalId/update-status')
  @AuthApiError()
  @ApiCreatedResponse({
    description: 'Update withdrawal status successful'
  })
  async updateWithdrawalStatusForAdmin(
    @Request() req,
    @Param('withdrawalId') withdrawalId: string,
    @Body() updateWithdrawalStatusDto: UpdateWithdrawalStatusDto
  ) {
    return this.adminsService.updateWithdrawalStatus(
      req.user.username,
      withdrawalId,
      updateWithdrawalStatusDto.status,
      updateWithdrawalStatusDto.note
    )
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Permission([WITHDRAWAL_CRUD, WITHDRAWAL_RESEND_CALLBACK])
  @Post('withdrawals/:withdrawalId/resend-callback')
  @AuthApiError()
  @ApiCreatedResponse({
    description: 'Resend callback successful'
  })
  async resendWithdrawalCallbackForAdmin(
    @Param('withdrawalId') withdrawalId: string
  ) {
    return this.adminsService.resendWithdrawalCallbackForAdmin(withdrawalId)
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Permission([WITHDRAWAL_CRUD, WITHDRAWAL_CREATE])
  @Post('withdrawals')
  @AuthApiError()
  @ApiCreatedResponse({
    description: 'Create withdrawal successful'
  })
  async createWithdrawalForAdmin(
    @Body() createWithdrawalOrderDto: CreateWithdrawalOrderDto
  ) {
    return this.adminsService.createWithdrawalForAdmin(createWithdrawalOrderDto)
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Permission([WITHDRAWAL_CRUD, WITHDRAWAL_CREATE])
  @Post('withdrawals-crypto')
  @AuthApiError()
  @ApiCreatedResponse({
    description: 'Create withdrawal successful'
  })
  async createWithdrawalByCrypto(
    @Body() createWithdrawalOrderDto: CreateWithdrawalOrderByCryptoDto
  ) {
    return this.adminsService.createWithdrawalByCrypto(createWithdrawalOrderDto)
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Permission([WITHDRAWAL_CRUD, WITHDRAWAL_UPDATE])
  @Put('withdrawals-crypto/:withdrawalId')
  @AuthApiError()
  @ApiCreatedResponse({
    description: 'Update withdrawal successful'
  })
  async updateWithdrawalByCrypto(
    @Param('withdrawalId') withdrawalId: string,
    @Body() updateWithdrawalOrderDto: UpdateWithdrawalOrderByCryptoDto
  ) {
    return this.adminsService.updateWithdrawalByCrypto(
      withdrawalId,
      updateWithdrawalOrderDto
    )
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Permission([WITHDRAWAL_CRUD, WITHDRAWAL_UPDATE])
  @Put('withdrawals/:withdrawalId')
  @AuthApiError()
  @ApiCreatedResponse({
    description: 'Update withdrawal successful'
  })
  async updateWithdrawalForAdmin(
    @Param('withdrawalId') withdrawalId: string,
    @Body() updateWithdrawalOrderDto: UpdateWithdrawalOrderDto
  ) {
    return this.adminsService.updateWithdrawalForAdmin(
      withdrawalId,
      updateWithdrawalOrderDto
    )
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Permission([WITHDRAWAL_CRUD, WITHDRAWAL_DELETE])
  @Delete('withdrawals/:withdrawalId')
  @AuthApiError()
  @ApiOkResponse({
    description: 'Delete withdrawals successful'
  })
  async getWithdrawalsForAdmin(
    @Param('withdrawalId') withdrawalId: string,
    @Request() req
  ) {
    return this.adminsService.deleteWithdrawalForAdmin(
      withdrawalId,
      req.user._id
    )
  }

  //Bank Transactions
  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Permission([BANK_TRANSACTION_CRUD, BANK_TRANSACTION_GET])
  @Get('bank-transactions')
  @AuthApiError()
  @ApiOkResponse({
    description: 'Get bank transactions successful',
    type: GetTransactionsResponse
  })
  async getTransactionsForAdmin(
    @Query() getTransactionsQueriesDto: GetTransactionsQueriesDto
  ) {
    return this.adminsService.getTransactionsForAdmin(getTransactionsQueriesDto)
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @Permission([BANK_TRANSACTION_CRUD, BANK_TRANSACTION_GET])
  @Post('bank-transactions/list-for-datatable')
  @AuthApiError()
  async getListTransactiontDatatableForAdmin(
    @Body() datatableParams: TransactionListing
  ) {
    const params = datatableParams.getDataTableParams()
    const listObj =
      await this.adminsService.getListTransactionDatatableForAdmin(
        false,
        params.keyword,
        datatableParams.type,
        datatableParams.isMatched,
        null,
        null,
        params.start,
        params.length,
        params.orderBy,
        params.orderType
      )
    const count = await this.adminsService.getListTransactionDatatableForAdmin(
      true,
      params.keyword,
      datatableParams.type,
      datatableParams.isMatched,
      null,
      null,
      null,
      null,
      null,
      null
    )

    return {
      recordsTotal: count,
      data: listObj,
      draw: datatableParams.draw,
      recordsFiltered: count
    }
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @Permission([BANK_TRANSACTION_CRUD, BANK_TRANSACTION_GET])
  @Post('bank-transactions/list-for-export')
  @AuthApiError()
  async transactionListingForExport(
    @Body() datatableParams: TransactionListing
  ) {
    const params = datatableParams.getDataTableParams()
    const listObj =
      await this.adminsService.getListTransactionDatatableForAdmin(
        false,
        params.keyword,
        String(datatableParams.type),
        String(datatableParams.isMatched),
        String(datatableParams.startDate),
        String(datatableParams.endDate),
        0,
        -1,
        null,
        null
      )

    return listObj
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  // @Permission([BANK_TRANSACTION_CRUD, BANK_TRANSACTION_GET])
  @Post('bank-transactions/suggest')
  @AuthApiError()
  async suggestTransactions(@Body() params: PagingParams) {
    const { page = 0, length = 20, keyword } = params
    const listObj =
      await this.adminsService.getListTransactionDatatableForAdmin(
        false,
        keyword,
        '-1',
        '-1',
        null,
        null,
        page * length,
        length,
        null,
        null
      )
    const count = await this.adminsService.getListTransactionDatatableForAdmin(
      true,
      keyword,
      '-1',
      '-1',
      null,
      null,
      null,
      null,
      null,
      null
    )

    return {
      count,
      data: listObj
    }
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @Permission([BANK_TRANSACTION_CRUD, BANK_TRANSACTION_GET])
  @Get('bank-transactions/:transactionId')
  @AuthApiError()
  @ApiOkResponse({
    description: 'Get transaction detail successful',
    type: TransactionDetail
  })
  async getTransactionDetailForAdmin(
    @Param('transactionId') transactionId: string
  ) {
    return this.adminsService.getTransactionDetailForAdmin(transactionId)
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @Permission([BANK_TRANSACTION_CRUD, BANK_TRANSACTION_DELETE])
  @Delete('bank-transactions/:transactionId')
  @AuthApiError()
  async deleteTransactionForAdmin(
    @Param('transactionId') transactionId: string,
    @Request() req
  ) {
    return this.adminsService.deleteTransactionForAdmin(
      transactionId,
      req.user._id
    )
  }
  //Virtual transactions

  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @Permission([VIRTUAL_TRANSACTION_CRUD, VIRTUAL_TRANSACTION_GET])
  @Post('virtual-transactions/list-for-datatable')
  @AuthApiError()
  async getListVirtualTransactiontDatatableForAdmin(
    @Body() datatableParams: TransactionListing
  ) {
    const params = datatableParams.getDataTableParams()
    const listObj =
      await this.adminsService.getListVirtualTransactionDatatableForAdmin(
        false,
        params.keyword,
        params.start,
        params.length,
        params.orderBy,
        params.orderType
      )
    const count =
      await this.adminsService.getListVirtualTransactionDatatableForAdmin(
        true,
        params.keyword,
        null,
        null,
        null,
        null
      )
    return {
      recordsTotal: count,
      data: listObj,
      draw: datatableParams.draw,
      recordsFiltered: count
    }
  }

  //Permission
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @Permission([PERMISSION_CRUD, PERMISSION_GET])
  @Post('permissions/list-for-datatable')
  @AuthApiError()
  async getListPermissionDatatableForAdmin(
    @Body() datatableParams: DataTableParams
  ) {
    const params = datatableParams.getDataTableParams()
    const listObj = await this.adminsService.getListPermissionDatatableForAdmin(
      false,
      params.keyword,
      params.start,
      params.length,
      params.orderBy,
      params.orderType
    )
    const count = await this.adminsService.getListPermissionDatatableForAdmin(
      true,
      params.keyword,
      null,
      null,
      null,
      null
    )

    return {
      recordsTotal: count,
      data: listObj,
      draw: datatableParams.draw,
      recordsFiltered: count
    }
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @Permission([PERMISSION_CRUD, PERMISSION_GET])
  @Get('permissions')
  @AuthApiError()
  async getListPermissionForAdmin(@Body() params) {
    return this.adminsService.getListPermissionForAdmin(
      false,
      params.keyword,
      params.page * 10,
      -1,
      'title',
      'asc'
    )
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @Permission([PERMISSION_CRUD, PERMISSION_CREATE])
  @Post('permissions')
  @AuthApiError()
  async createPermissonForAdmin(
    @Request() req,
    @Body() createPermissonDto: PermissionCreateDto
  ) {
    return this.adminsService.createPermissonForAdmin(createPermissonDto)
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @Permission([PERMISSION_CRUD, PERMISSION_UPDATE])
  @Patch('permissions/:permissionId')
  @AuthApiError()
  async updatePermissionForAdmin(
    @Request() req,
    @Param('permissionId') permissionId: string,
    @Body() updatePermissonDto: PermissionUpdateDto
  ) {
    return this.adminsService.updatePermissionForAdmin(
      permissionId,
      updatePermissonDto
    )
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @Permission([PERMISSION_CRUD, PERMISSION_DELETE])
  @Delete('permissions/:permissionId')
  @AuthApiError()
  async deletePermission(
    @Param('permissionId') permissionId: string,
    @Request() req
  ) {
    return this.adminsService.deletePermission(permissionId, req.user._id)
  }

  //Role
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @Permission([ROLE_CRUD, ROLE_GET])
  @Post('roles/list-for-datatable')
  @AuthApiError()
  async getListRoleDatatableForAdmin(@Body() datatableParams: DataTableParams) {
    const params = datatableParams.getDataTableParams()
    const listObj = await this.adminsService.getListRoleForAdmin(
      false,
      params.keyword,
      params.start,
      params.length,
      params.orderBy,
      params.orderType
    )
    const count = await this.adminsService.getListRoleForAdmin(
      true,
      params.keyword,
      null,
      null,
      null,
      null
    )

    return {
      recordsTotal: count,
      data: listObj,
      draw: datatableParams.draw,
      recordsFiltered: count
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('roles/suggest')
  @AuthApiError()
  async suggestRole(@Request() req, @Body() suggestRoleDto: RoleSuggestDto) {
    return this.adminsService.suggestRole(suggestRoleDto, req.user)
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @Permission([ROLE_CRUD, ROLE_CREATE])
  @Post('roles')
  @AuthApiError()
  async createRoleForAdmin(
    @Request() req,
    @Body() createRoleDto: RoleCreateDto
  ) {
    return this.adminsService.createRoleForAdmin(createRoleDto)
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @Permission([ROLE_CRUD, ROLE_UPDATE])
  @Patch('roles/:roleId')
  @AuthApiError()
  async updateRoleForAdmin(
    @Request() req,
    @Param('roleId') roleId: string,
    @Body() updateRoleDto: RoleUpdateDto
  ) {
    return this.adminsService.updateRoleForAdmin(roleId, updateRoleDto)
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @Permission([ROLE_CRUD, ROLE_DELETE])
  @Delete('roles/:roleId')
  @AuthApiError()
  async deleteRole(@Param('roleId') roleId: string, @Request() req) {
    return this.adminsService.deleteRole(roleId, req.user._id)
  }

  //Summary
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @Permission(SUMMARY_GET)
  @Get('summary')
  @ApiOkResponse({
    description: 'Get summary successful',
    type: GetSummaryResponse
  })
  @AuthApiError()
  async getSummaryForAdmin(
    @Query() getSummaryQueriesDto: GetSummaryQueriesDto
  ) {
    return this.adminsService.getSummaryForAdmin(getSummaryQueriesDto)
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @Permission(SUMMARY_GET)
  @Get('summary-balance')
  @AuthApiError()
  async getBalanceForAdmin(@Query('isCrypto') isCrypto: boolean) {
    return this.adminsService.getBalanceCacheForAdmin(isCrypto)
  }

  //Settings
  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @Permission([SETTING_CRUD, SETTING_GET])
  @Get('settings')
  @ApiOkResponse({
    description: 'Get settings successful',
    type: SettingsResponse
  })
  @AuthApiError()
  async getSettingsForAdmin() {
    return this.adminsService.getSettingsForAdmin()
  }

  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @Permission(SETTING_CRUD)
  @Patch('settings')
  @ApiOkResponse({
    description: 'Update settings successful',
    type: SettingsResponse
  })
  @AuthApiError()
  async updateSettingsForAdmin(@Body() updateSettingsDto: UpdateSettingsDto) {
    return this.adminsService.updateSettingsForAdmin(updateSettingsDto)
  }

  @Get('withdrawal-banks')
  @ApiOkResponse({
    description: 'Get withdrawal banks successful',
    type: WithdrawalBanksData
  })
  @AuthApiError()
  async getWithdrawalBanksForAdmin() {
    return this.adminsService.getWithdrawalBanksForAdmin()
  }

  // Cashouts
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(WhitelistIPGuard, JwtAuthGuard, PermissionGuard)
  @Permission([CASHOUT_CRUD, CASHOUT_GET])
  @Post('cashouts/list-for-datatable')
  @AuthApiError()
  async cashoutListing(@Body() datatableParams: DataTableParams) {
    const params = datatableParams.getDataTableParams()
    const listObj = await this.adminsService.cashoutListing(
      false,
      params.keyword,
      params.start,
      params.length,
      params.orderBy,
      params.orderType
    )
    const count = await this.adminsService.cashoutListing(
      true,
      params.keyword,
      null,
      null,
      null,
      null
    )

    return {
      recordsTotal: count,
      data: listObj,
      draw: datatableParams.draw,
      recordsFiltered: count
    }
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permission([CASHOUT_CRUD, CASHOUT_CREATE])
  @Post('cashouts')
  @AuthApiError()
  @ApiCreatedResponse({
    description: 'Create cashout successful'
  })
  async createCashoutOrderForAdmin(
    @Body() createCashoutOrderDto: CreateCashoutOrderDto
  ) {
    return this.adminsService.createCashoutForAdmin(createCashoutOrderDto)
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permission([CASHOUT_CRUD, CASHOUT_CREATE_USER])
  @Post('cashouts-user')
  @AuthApiError()
  @ApiCreatedResponse({
    description: 'Create cashout successful'
  })
  async createCashoutOrderForUser(
    @Body() createCashoutOrderByUserDto: CreateCashoutOrderByUserDto
  ) {
    return this.adminsService.createCashoutOrderByUser(
      createCashoutOrderByUserDto
    )
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permission([CASHOUT_CRUD, CASHOUT_UPDATE])
  @Patch('cashouts/:cashoutId')
  @AuthApiError()
  @ApiCreatedResponse({
    description: 'Update cashout successful'
  })
  async updateCashoutOrderForAdmin(
    @Param('cashoutId') cashoutId: string,
    @Body() updateCashoutOrderDto: UpdateCashoutOrderDto,
    @Request() req
  ) {
    return this.adminsService.updateCashoutForAdmin(
      cashoutId,
      updateCashoutOrderDto,
      req.user._id
    )
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permission([CASHOUT_CRUD, CASHOUT_DELETE])
  @Delete('cashouts/:cashoutId')
  @AuthApiError()
  @ApiCreatedResponse({
    description: 'Delete cashout successful'
  })
  async deleteCashoutOrderForAdmin(
    @Param('cashoutId') cashoutId: string,
    @Request() req
  ) {
    return this.adminsService.deleteCashoutForAdmin(cashoutId, req.user._id)
  }
}
