import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  OnModuleInit
} from '@nestjs/common'
import { AuthService } from '../../resources/auth/auth.service'
import { BanksService } from '../../resources/banks/banks.service'
import {
  CreateBankDto,
  GetBanksQueriesDto,
  UpdateBankDto
} from '../../resources/banks/dto/bank-request.dto'
import { TransactionType } from '../../common/dto/general.dto'
import { DepositsService } from '../../resources/deposits/deposits.service'
import {
  CreateDepositOrderDto,
  GetDepositsQueriesDto,
  ManualDepositDto,
  ManualDepositsDto,
  UpdateDepositOrderDto
} from '../../resources/deposits/dto/deposit-request.dto'
import { PermissionCreateDto } from '../../resources/permission/dto/permission-create'
import { PermissionUpdateDto } from '../../resources/permission/dto/permission-update'
import { PermissionService } from '../../resources/permission/permission.service'
import { RoleCreateDto } from '../../resources/role/dto/role-create'
import { RoleSuggestDto } from '../../resources/role/dto/role-suggest'
import { RoleUpdateDto } from '../../resources/role/dto/role-update'
import { RoleService } from '../../resources/role/role.service'
import { UpdateSettingsDto } from '../../resources/settings/dto/setting-request.dto'
import { SettingsService } from '../../resources/settings/settings.service'
import {
  CreateTransactionDto,
  GetTransactionsQueriesDto
} from '../../resources/transactions/dto/bank-transactions-request.dto'
import {
  GetUsersQueriesDto,
  CreateUserDto,
  UpdateUserDto
} from '../../resources/users/dto/user-request.dto'
import { UsersService } from '../../resources/users/users.service'
import {
  CreateWithdrawalOrderDto,
  ManualWithdrawalDto,
  UpdateWithdrawalOrderDto
} from '../../resources/withdrawals/dto/withdrawal-request.dto'
import { WithdrawalsService } from '../../resources/withdrawals/withdrawals.service'
import { GetSummaryQueriesDto } from './dto/admin-request.dto'
import { CashoutsService } from '@/modules/resources/cashouts/cashouts.service'
import {
  CreateCashoutOrderDto,
  UpdateCashoutOrderDto
} from '@/modules/resources/cashouts/dto/cashout-request.dto'
import { ConfigService } from '@nestjs/config'
import { VicaAdaptersService } from '@/modules/adapters/vica-adapters/vica-adapters.service'
import { VirtualTransactionsService } from '@/modules/resources/virtual-transactions/virtual-transactions.service'
import {
  VirtualServiceCode,
  VirtualTransactionStatus
} from '@/modules/resources/virtual-transactions/dto/general.dto'
import { Withdrawal } from '@/modules/resources/withdrawals/withdrawals.interface'
import { pick } from 'lodash'
import { VirtualType } from '@/modules/resources/settings/dto/general.dto'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { AES } from 'crypto-js'
import { randomInt } from 'crypto'
import moment from 'moment'
import { SummaryCachesService } from '@/modules/resources/summary-caches/summary-cache.service'
import { RefreshTokensService } from '@/modules/resources/refresh-token/refresh-token.service'
import { BankTransactionsService } from '@/modules/resources/transactions/bank-transactions.service'

@Injectable()
export class AdminsService implements OnModuleInit {
  private virtualBaseUrl = ''
  private virtualPartnerCode = ''
  private virtualApiKey = ''
  private virtualPublicKey = ''
  private virtualNotifyUrl = ''

  private vov5TransferCallbackUrl = ''

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private banksService: BanksService,
    private depositsService: DepositsService,
    private withdrawalsService: WithdrawalsService,
    private bankTransactionsService: BankTransactionsService,
    private cashoutsService: CashoutsService,
    private permissionsService: PermissionService,
    private rolesService: RoleService,
    private settingsService: SettingsService,
    private configService: ConfigService,
    private vicaAdaptersService: VicaAdaptersService,
    private virtualTransactionsService: VirtualTransactionsService,
    private summaryCachesService: SummaryCachesService,
    private resfreshTokensService: RefreshTokensService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async onModuleInit() {
    this.virtualBaseUrl = this.configService.get('VIRTUAL_BASE_URL')
    this.virtualApiKey = this.configService.get('VIRTUAL_API_KEY')
    this.virtualPartnerCode = this.configService.get('VIRTUAL_PARTNER_CODE')
    this.virtualPublicKey = this.configService.get('VIRTUAL_PUBLIC_KEY')
    this.virtualNotifyUrl = this.configService.get('VIRTUAL_NOTIFY_URL')
    this.vov5TransferCallbackUrl = this.configService.get(
      'VOV5_TRANSFER_CALLBACK_URL'
    )
  }

  // Users
  async getUsers(ggetUsersQueriesDto: GetUsersQueriesDto) {
    return this.usersService.getUsers(ggetUsersQueriesDto)
  }

  async getUserMe(id) {
    return this.usersService.getProfile(id)
  }

  async logout(refreshToken: string) {
    const isExit = await this.resfreshTokensService.getRefreshToken(
      refreshToken
    )
    if (!isExit) {
      return 'Đăng xuất thành công'
    }
    await this.resfreshTokensService.deleteRefreshToken(refreshToken)
    return 'Đăng xuất thành công'
  }

  async getListUserForAdmin(
    isCounting,
    keyword,
    start,
    length,
    sortBy,
    sortType
  ) {
    return this.usersService.userListing(
      isCounting,
      keyword,
      start,
      length,
      sortBy,
      sortType
    )
  }

  async getUserDetail(userId: string) {
    return this.usersService.getUserDetail(userId)
  }

  async login(user: any) {
    return this.authService.login(user)
  }

  async refresh(refreshToken: string) {
    return this.authService.refresh(refreshToken)
  }

  async createUser(userData: CreateUserDto) {
    return this.usersService.createUser(userData)
  }

  async updateUser(userId: string, updateUserData: UpdateUserDto) {
    return this.usersService.updateUser(userId, updateUserData)
  }

  async getMeForAdmin(req: any) {
    return this.usersService.getProfile(req)
  }

  async deleteUser(id: string, userId: string) {
    return this.usersService.deleteUser(id, userId)
  }

  // Banks
  async getBanksForAdmin(getBanksQueriesDto: GetBanksQueriesDto) {
    return this.banksService.getBanksForAdmin(getBanksQueriesDto)
  }

  async getBankDetailForAdmin(bankId: string) {
    return this.banksService.getBankDetailForAdmin(bankId)
  }

  async getListBankDatatableForAdmin(
    isCounting,
    keyword,
    bankType,
    isEnabled,
    start,
    length,
    sortBy,
    sortType
  ) {
    return this.banksService.bankListing(
      isCounting,
      keyword,
      bankType,
      isEnabled,
      start,
      length,
      sortBy,
      sortType
    )
  }

  async createBankAdmin(createBankData: CreateBankDto) {
    return this.banksService.createBankAdmin(createBankData)
  }

  async updateBankAdmin(
    bankId: string,
    updateBankData: UpdateBankDto,
    userId: string
  ) {
    return this.banksService.updateBankAdmin(bankId, updateBankData, userId)
  }

  async deleteBank(id: string, userId: string) {
    return this.banksService.deleteBank(id, userId)
  }

  // Deposits
  async getDepositsForAdmin(getDepositsQueriesDto: GetDepositsQueriesDto) {
    return this.depositsService.getDepositsForAdmin(getDepositsQueriesDto)
  }

  async getListDepositDatatableForAdmin(
    isCounting,
    keyword,
    isManual,
    status,
    startDate,
    endDate,
    type,
    start,
    length,
    sortBy,
    sortType
  ) {
    return this.depositsService.depositListing(
      isCounting,
      keyword,
      isManual,
      status,
      startDate,
      endDate,
      type,
      start,
      length,
      sortBy,
      sortType
    )
  }

  async getDepositDetailForAdmin(depositId: string) {
    return this.depositsService.getDepositDetailForAdmin(depositId)
  }

  async resendDepositCallbackForAdmin(depositId: string) {
    return this.depositsService.resendDepositCallback(depositId)
  }

  async manualDeposit(
    username: string,
    depositId: string,
    manualDepositDto: ManualDepositDto
  ) {
    const deposit = await this.depositsService.manualDeposit(
      username,
      depositId,
      manualDepositDto.actualAmount,
      manualDepositDto.transactionId
    )

    const transaction =
      await this.bankTransactionsService.getTransactionDetailForAdmin(
        manualDepositDto.transactionId
      )
    transaction.deposit = deposit.id
    transaction.isMatched = true
    transaction.save()

    return deposit
  }

  async manualDeposits(
    username: string,
    depositId: string,
    manualDepositsDto: ManualDepositsDto
  ) {
    console.log(manualDepositsDto)

    const deposit =
      await this.depositsService.manualDepositWithManyTransactions(
        username,
        depositId,
        manualDepositsDto.actualAmount,
        manualDepositsDto.transactionIds
      )

    manualDepositsDto.transactionIds.map(async (transactionId) => {
      const transaction =
        await this.bankTransactionsService.getTransactionDetailForAdmin(
          transactionId
        )
      transaction.deposit = deposit.id
      transaction.isMatched = true
      transaction.save()
    })
    return deposit
  }

  async verifyDeposit(username: string, depositId: string) {
    return this.depositsService.verifyDeposit(username, depositId)
  }

  async createDepositOrder(createDepositOrderDto: CreateDepositOrderDto) {
    switch (createDepositOrderDto.type) {
      case 'BANK':
        return await this.depositsService.createDepositOrderWithBank(
          createDepositOrderDto
        )
      default:
        const settings = await this.settingsService.getSettings()
        return await this.depositsService.createDepositOrderWithVA(
          createDepositOrderDto,
          settings
        )
    }
  }

  async updateDepositOrder(
    depositId: string,
    updateDepositOrderDto: UpdateDepositOrderDto
  ) {
    return this.depositsService.updateDepositOrder(
      depositId,
      updateDepositOrderDto
    )
  }

  async deleteDeposit(depositId: string, userId: string) {
    return this.depositsService.deleteDeposit(depositId, userId)
  }

  //Withdrawals

  async getListWithdrawalDatatableForAdmin(
    isCounting,
    keyword,
    isManual,
    status,
    startDate,
    endDate,
    start,
    length,
    sortBy,
    sortType
  ) {
    return this.withdrawalsService.withdrawalListing(
      isCounting,
      keyword,
      isManual,
      status,
      startDate,
      endDate,
      start,
      length,
      sortBy,
      sortType
    )
  }

  async getWithdrawalDetailForAdmin(withdrawalId: string) {
    return this.withdrawalsService.getWithdrawalDetailForAdmin(withdrawalId)
  }

  async manualWithdrawal(
    username: string,
    withdrawalId: string,
    manualWithdrawalDto: ManualWithdrawalDto
  ) {
    const withdrawalOrder =
      await this.withdrawalsService.getWithdrawalDetailForAdmin(withdrawalId)

    if (withdrawalOrder.amount != manualWithdrawalDto.actualAmount) {
      throw new HttpException('Invalid amount', HttpStatus.NOT_FOUND)
    }

    const txData = {
      bankName: manualWithdrawalDto.bankNameSrc,
      bankAccount: manualWithdrawalDto.bankAccountSrc,
      transactionType: TransactionType.Debit,
      content: manualWithdrawalDto.content,
      reference: manualWithdrawalDto.reference,
      amount: manualWithdrawalDto.actualAmount,
      transactionTime: new Date()
    }

    const data = JSON.stringify(txData)

    const createTransactionDto: CreateTransactionDto = {
      ...txData,
      isManual: true,
      manualBy: username,
      manualAt: new Date(),
      data
    }
    const bankTx = await this.bankTransactionsService.createTransaction(
      createTransactionDto
    )

    if (!bankTx) {
      throw new HttpException(
        'Cannot manual withdrawal',
        HttpStatus.BAD_REQUEST
      )
    }

    const withdrawal = await this.withdrawalsService.manualWithdrawal(
      username,
      withdrawalId,
      bankTx.id,
      manualWithdrawalDto.bankNameSrc,
      manualWithdrawalDto.bankAccountSrc,
      manualWithdrawalDto.actualAmount
    )
    bankTx.withdrawal = withdrawal.id
    bankTx.isMatched = true
    bankTx.save()
    return withdrawal
  }

  async updateWithdrawalStatus(
    username: string,
    withdrawalId: string,
    status: string,
    note: string
  ) {
    return this.withdrawalsService.updateWithdrawalStatus(
      username,
      withdrawalId,
      status,
      note
    )
  }

  async resendWithdrawalCallbackForAdmin(withdrawalId: string) {
    return this.withdrawalsService.resendWithdrawalCallback(withdrawalId)
  }

  async createWithdrawalForAdmin(
    createWithdrawalOrderDto: CreateWithdrawalOrderDto
  ) {
    const withdrawalOrder = await this.withdrawalsService.createWithdrawalOrder(
      createWithdrawalOrderDto
    )
    //
    const settings = await this.settingsService.getSettings()

    if (settings.isAutoWithdrawal) {
      await this.autoWithdrawal(withdrawalOrder.id, null, null, null)
    }
    //
    return pick(
      withdrawalOrder,
      'id',
      'bankNameDest',
      'bankAccountNumberDest',
      'bankAccountNameDest',
      'amount',
      'ref',
      'callback',
      'code',
      'status',
      'createdAt',
      'updatedAt'
    )
  }

  async updateWithdrawalForAdmin(
    id: string,
    updateWithdrawalOrderDto: UpdateWithdrawalOrderDto
  ) {
    return this.withdrawalsService.updateWithdrawalOrder(
      id,
      updateWithdrawalOrderDto
    )
  }

  async getWithdrawalBanksForAdmin() {
    return this.settingsService.getWithdrawalBanksForAdmin()
  }

  async autoWithdrawal(
    withdrawalId: string,
    bankNameDest: string,
    withdrawalOrder: Withdrawal,
    bankAccountNameDest: string
  ) {
    const withdrawalIdCache = await this.cacheManager.get('withdrawalIdCache')
    if (withdrawalIdCache) {
      throw new HttpException(
        'Stop withdrawal in 10 seconds',
        HttpStatus.BAD_REQUEST
      )
    }
    await this.cacheManager.del('withdrawalIdCache')

    await this.cacheManager.set('withdrawalIdCache', withdrawalId, 10000)

    if (withdrawalId) {
      withdrawalOrder = await this.withdrawalsService.getWithdrawalOrderById(
        withdrawalId
      )
    }

    if (!withdrawalOrder) {
      throw new HttpException('Withdrawal not found', HttpStatus.NOT_FOUND)
    }

    const virtualTransaction =
      await this.virtualTransactionsService.getVirtualTransactionByDepositId(
        withdrawalId
      )

    if (virtualTransaction) {
      throw new HttpException('Virtual transaction exists', HttpStatus.CONFLICT)
    }

    const newTransaction =
      await this.virtualTransactionsService.createTransaction({
        depositOrder: withdrawalOrder.id,
        refId: withdrawalOrder.ref,
        serviceCode: VirtualServiceCode.PAYCASH,
        amount: withdrawalOrder.amount,
        returnUrl: withdrawalOrder.callback,
        cancelUrl: withdrawalOrder.callback
      })

    const settings = await this.settingsService.getSettings()

    let payCashOrder: any
    switch (settings.virtualType) {
      case VirtualType.VOV5:
        payCashOrder = await this.vicaAdaptersService.transferVov5(
          newTransaction.id,
          withdrawalOrder.bankAccountNumberDest,
          bankAccountNameDest
            ? bankAccountNameDest
            : withdrawalOrder.bankAccountNameDest,
          bankNameDest ? bankNameDest : withdrawalOrder.bankNameDest,
          withdrawalOrder.amount,
          this.vov5TransferCallbackUrl,
          withdrawalOrder.code
        )
        break
      case VirtualType.VIRTUAL:
        payCashOrder = await this.vicaAdaptersService.createVirtualPayCashOrder(
          this.virtualBaseUrl,
          this.virtualApiKey,
          this.virtualPartnerCode,
          this.virtualPublicKey,
          this.virtualNotifyUrl,
          newTransaction.id,
          bankNameDest ? bankNameDest : withdrawalOrder.bankNameDest,
          withdrawalOrder.bankAccountNumberDest,
          bankAccountNameDest
            ? bankAccountNameDest
            : withdrawalOrder.bankAccountNameDest,
          withdrawalOrder.amount,
          withdrawalOrder.code,
          withdrawalOrder.code
        )
        break

      default:
        payCashOrder = await this.vicaAdaptersService.createVirtualPayCashOrder(
          this.virtualBaseUrl,
          this.virtualApiKey,
          this.virtualPartnerCode,
          this.virtualPublicKey,
          this.virtualNotifyUrl,
          newTransaction.id,
          bankNameDest ? bankNameDest : withdrawalOrder.bankNameDest,
          withdrawalOrder.bankAccountNumberDest,
          bankAccountNameDest
            ? bankAccountNameDest
            : withdrawalOrder.bankAccountNameDest,
          withdrawalOrder.amount,
          withdrawalOrder.code,
          withdrawalOrder.code
        )
        break
    }

    let updatedTransaction
    if (!payCashOrder.isSucceed) {
      updatedTransaction =
        await this.virtualTransactionsService.updateTransaction(
          newTransaction.id,
          {
            status: VirtualTransactionStatus.CANCELED
          }
        )
    } else {
      updatedTransaction =
        await this.virtualTransactionsService.updateTransaction(
          newTransaction.id,
          {
            status: VirtualTransactionStatus.PENDING,
            bankCode: payCashOrder.data.bankCode,
            bankAccountNo: payCashOrder.data.bankAccountNo,
            bankAccountName: payCashOrder.data.bankAccountName
          }
        )
    }

    await this.withdrawalsService.updateWithdrawalOrder(withdrawalOrder.id, {
      virtualTransaction: updatedTransaction.id,
      bankNameDest: bankNameDest ? bankNameDest : withdrawalOrder.bankNameDest,
      bankAccountNameDest: bankAccountNameDest
        ? bankAccountNameDest
        : withdrawalOrder.bankAccountNameDest
    })
    return {
      status: 'succeed'
    }
  }

  async deleteWithdrawalForAdmin(withdrawalId: string, userId: string) {
    return this.withdrawalsService.deleteWithdrawal(withdrawalId, userId)
  }

  // Transactions
  async getTransactionsForAdmin(
    getTransactionsQueriesDto: GetTransactionsQueriesDto
  ) {
    return this.bankTransactionsService.getTransactionsForAdmin(
      getTransactionsQueriesDto
    )
  }

  async getListTransactionDatatableForAdmin(
    isCounting,
    keyword,
    type,
    isMatched,
    startDate,
    endDate,
    start,
    length,
    sortBy,
    sortType
  ) {
    return this.bankTransactionsService.transactionListing(
      isCounting,
      keyword,
      type,
      isMatched,
      startDate,
      endDate,
      start,
      length,
      sortBy,
      sortType
    )
  }

  async getTransactionDetailForAdmin(transactionId: string) {
    return this.bankTransactionsService.getTransactionDetailForAdmin(
      transactionId
    )
  }

  async deleteTransactionForAdmin(transactionId: string, userId: string) {
    return this.bankTransactionsService.deleteTransaction(transactionId, userId)
  }

  //Permissons
  async getListPermissionForAdmin(
    isCounting,
    keyword,
    start,
    length,
    sortBy,
    sortType
  ) {
    return this.permissionsService.getListPermissionForAdmin(
      isCounting,
      keyword,
      start,
      length,
      sortBy,
      sortType
    )
  }

  async getListPermissionDatatableForAdmin(
    isCounting,
    keyword,
    start,
    length,
    sortBy,
    sortType
  ) {
    return this.permissionsService.getListPermissionForAdmin(
      isCounting,
      keyword,
      start,
      length,
      sortBy,
      sortType
    )
  }

  async createPermissonForAdmin(createPermissonDto: PermissionCreateDto) {
    return this.permissionsService.createPermissonForAdmin(createPermissonDto)
  }

  async updatePermissionForAdmin(
    permissionId: string,
    updatePermissonDto: PermissionUpdateDto
  ) {
    return this.permissionsService.updatePermissionForAdmin(
      permissionId,
      updatePermissonDto
    )
  }

  async deletePermission(permissionId: string, userId: string) {
    return this.permissionsService.deletePermission(permissionId, userId)
  }

  //Role
  async getListRoleForAdmin(
    isCounting,
    keyword,
    start,
    length,
    sortBy,
    sortType
  ) {
    return this.rolesService.getListRoleForAdmin(
      isCounting,
      keyword,
      start,
      length,
      sortBy,
      sortType
    )
  }

  async suggestRole(suggestRoleDto: RoleSuggestDto, user: any) {
    return this.rolesService.suggestRole(suggestRoleDto, user)
  }

  async createRoleForAdmin(createRoleDto: RoleCreateDto) {
    return this.rolesService.createRoleForAdmin(createRoleDto)
  }

  async updateRoleForAdmin(roleId: string, updateRoleDto: RoleUpdateDto) {
    return this.rolesService.updateRoleForAdmin(roleId, updateRoleDto)
  }

  async deleteRole(roleId: string, userId: string) {
    return this.rolesService.deleteRole(roleId, userId)
  }

  async getSummaryForAdmin(getSummaryQueriesDto: GetSummaryQueriesDto) {
    const [
      succeedDepositTotal,
      pendingDepositTotal,
      manualDepositTotal,
      succeedDepositTotalAmount,
      succeedDepositTotalFee
    ] = await this.depositsService.getSummaryForAdmin(getSummaryQueriesDto)

    const [
      succeedWithdrawalTotal,
      pendingWithdrawalTotal,
      succeedWithdrawalTotalAmount,
      succeedWithdrawalTotalFee
    ] = await this.withdrawalsService.getSummaryForAdmin(getSummaryQueriesDto)

    const [cashoutTotal, cashoutTotalAmount, cashoutTotalFee] =
      await this.cashoutsService.getSummaryForAdmin(getSummaryQueriesDto)

    return {
      succeedDepositTotal,
      pendingDepositTotal,
      manualDepositTotal,
      succeedDepositTotalAmount,
      succeedDepositTotalFee,
      succeedWithdrawalTotal,
      pendingWithdrawalTotal,
      succeedWithdrawalTotalAmount,
      succeedWithdrawalTotalFee,
      cashoutTotal,
      cashoutTotalAmount,
      cashoutTotalFee
    }
  }

  async getBalanceForAdmin() {
    const depositBalance = await this.depositsService.getDepositTotalBalance()

    const withdrawalBalance =
      await this.withdrawalsService.getWithdrawalTotalBalance()

    const cashoutBalance = await this.cashoutsService.getCashoutTotalBalance()

    return depositBalance - withdrawalBalance - cashoutBalance
  }

  async getBalanceCacheForAdmin() {
    const lastSummaryCacheData =
      await this.summaryCachesService.getLastSummaryCache(moment().toDate())

    const summaryDepositData =
      await this.depositsService.getDepositTotalBalanceByDate({
        startDate: lastSummaryCacheData.cacheTime,
        endDate: moment().toDate()
      })

    const summaryWithdrawalData =
      await this.withdrawalsService.getWithdrawalTotalBalanceByDate({
        startDate: lastSummaryCacheData.cacheTime,
        endDate: moment().toDate()
      })

    const summaryCashoutData =
      await this.cashoutsService.getCashoutTotalBalanceByDate({
        startDate: lastSummaryCacheData.cacheTime,
        endDate: moment().toDate()
      })

    const totalDepositAmount =
      lastSummaryCacheData.totalDepositAmount + summaryDepositData.totalAmount
    const totalDepositFee =
      lastSummaryCacheData.totalDepositFee + summaryDepositData.totalFee

    const totalWithdrawalAmount =
      lastSummaryCacheData.totalWithdrawalAmount +
      summaryWithdrawalData.totalAmount

    const totalWithdrawalFee =
      lastSummaryCacheData.totalWithdrawalFee + summaryWithdrawalData.totalFee

    const totalCashoutAmount =
      lastSummaryCacheData.totalCashoutAmount + summaryCashoutData.totalAmount

    const totalCashoutFee =
      lastSummaryCacheData.totalCashoutFee + summaryCashoutData.totalFee

    const balance =
      totalDepositAmount -
      totalWithdrawalAmount -
      totalCashoutAmount -
      totalDepositFee -
      totalWithdrawalFee -
      totalCashoutFee

    return balance
  }

  async getSettingsForAdmin() {
    return this.settingsService.getSettingsForAdmin()
  }

  async updateSettingsForAdmin(updateSettingsDto: UpdateSettingsDto) {
    return this.settingsService.updateSettingsForAdmin(updateSettingsDto)
  }

  async cashoutListing(isCounting, keyword, start, length, sortBy, sortType) {
    return this.cashoutsService.cashoutListing(
      isCounting,
      keyword,
      start,
      length,
      sortBy,
      sortType
    )
  }

  async createCashoutForAdmin(createCashoutOrderDto: CreateCashoutOrderDto) {
    return this.cashoutsService.createCashoutOrder(createCashoutOrderDto)
  }

  async updateCashoutForAdmin(
    cashoutId: string,
    updateCashoutOrderDto: UpdateCashoutOrderDto,
    userId: string
  ) {
    return this.cashoutsService.updateCashoutOrder(
      cashoutId,
      updateCashoutOrderDto,
      userId
    )
  }

  async deleteCashoutForAdmin(cashoutId: string, userId: string) {
    return this.cashoutsService.deleteCashout(cashoutId, userId)
  }
}
