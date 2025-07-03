import {
  Controller,
  UseGuards,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
  Param,
  Body,
  Post
} from '@nestjs/common'
import {
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger'
import { ApiKeyAuthGuard } from '../../resources/auth/api-key-auth.guard'
import { AuthApiError } from '../../common/decorators/api-error-respone.decorator'
import {
  CreateDepositOrderDto,
  GetDepositsQueriesDto
} from '../../resources/deposits/dto/deposit-request.dto'
import { SettingsResponse } from '../../resources/settings/dto/setting-response.dto'
import {
  CreateWithdrawalOrderDto,
  GetWithdrawalsQueriesDto
} from '../../resources/withdrawals/dto/withdrawal-request.dto'
import {
  GetWithdrawsResponse,
  WithdrawalBanksData,
  WithdrawalData
} from '../../resources/withdrawals/dto/withdrawal-response.dto'
import { BankData } from './dto/bank-response.dto'

import {
  DepositData,
  DepositDetail,
  GetDepositsResponse
} from './dto/deposit-response.dto'
import { ExternalsService } from './externals.service'
import { MaintenanceGuard } from '@/modules/resources/auth/maintenance.guard'
import { GetWalletAddressByCustomerIdDto } from '@/modules/resources/customer-wallets/dto/customer-wallets.dto'

@ApiTags('External')
@ApiHeader({ name: 'X-API-KEY' })
@Controller()
export class ExternalsController {
  constructor(private externalsService: ExternalsService) {}

  //Banks
  @UseGuards(ApiKeyAuthGuard, MaintenanceGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('banks')
  @AuthApiError()
  @ApiOkResponse({
    description: 'Get banks successful',
    type: [BankData]
  })
  async getDepositBanksForExternal() {
    return this.externalsService.getDepositBanksForExternal()
  }

  //Deposits
  @UseGuards(ApiKeyAuthGuard, MaintenanceGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('deposits')
  @AuthApiError()
  @ApiCreatedResponse({
    description: 'Submit deposits successful',
    type: DepositData
  })
  async createDepositOrderForExternal(
    @Body() createDepositOrderDto: CreateDepositOrderDto
  ) {
    return this.externalsService.createDepositOrderForExternal(
      createDepositOrderDto
    )
  }

  @UseGuards(ApiKeyAuthGuard, MaintenanceGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('wallets')
  @AuthApiError()
  async getCusstomerWalletForExternal(
    @Body() getWalletAddressByCustomerIdDto: GetWalletAddressByCustomerIdDto
  ) {
    return this.externalsService.getCustomerWalletForExternal(
      getWalletAddressByCustomerIdDto
    )
  }

  @UseGuards(ApiKeyAuthGuard, MaintenanceGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('deposits')
  @AuthApiError()
  @ApiOkResponse({
    description: 'Get deposits successful',
    type: GetDepositsResponse
  })
  async getDepositsForExternal(
    @Query() getDepositsQueriesDto: GetDepositsQueriesDto
  ) {
    return this.externalsService.getDepositsForExternal(getDepositsQueriesDto)
  }

  @UseGuards(ApiKeyAuthGuard, MaintenanceGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('deposits/:depositId')
  @AuthApiError()
  @ApiOkResponse({
    description: 'Get deposit detail successful',
    type: DepositDetail
  })
  async getDepositDetailForExternal(@Param('depositId') depositId: string) {
    return this.externalsService.getDepositDetailForExternal(depositId)
  }

  //Withdrawals
  @UseGuards(ApiKeyAuthGuard, MaintenanceGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('withdrawals')
  @AuthApiError()
  @ApiCreatedResponse({
    description: 'Submit withdrawal successful',
    type: WithdrawalData
  })
  async createWithdrawalOrderForExternal(
    @Body() createWithdrawalOrderDto: CreateWithdrawalOrderDto
  ) {
    return this.externalsService.createWithdrawalOrderForExternal(
      createWithdrawalOrderDto
    )
  }

  @UseGuards(ApiKeyAuthGuard, MaintenanceGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('withdrawals')
  @AuthApiError()
  @ApiOkResponse({
    description: 'Get withdrawals successful',
    type: GetWithdrawsResponse
  })
  async getWithdrawalsForExternal(
    @Query() getWithdrawalsQueriesDto: GetWithdrawalsQueriesDto
  ) {
    return this.externalsService.getWithdrawalsForExternal(
      getWithdrawalsQueriesDto
    )
  }

  @UseGuards(ApiKeyAuthGuard, MaintenanceGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('withdrawals/:withdrawalId')
  @AuthApiError()
  @ApiOkResponse({
    description: 'Get withdrawal detail successful',
    type: WithdrawalData
  })
  async getWithdrawalDetailForExternal(
    @Param('withdrawalId') withdrawalId: string
  ) {
    return this.externalsService.getWithdrawalDetailForExternal(withdrawalId)
  }

  @UseGuards(ApiKeyAuthGuard, MaintenanceGuard)
  @Get('withdrawal-banks')
  @ApiOkResponse({
    description: 'Get withdrawal banks successful',
    type: WithdrawalBanksData
  })
  @AuthApiError()
  async getWithdrawalBanksForExternal() {
    return this.externalsService.getWithdrawalBanksForExternal()
  }

  //Settings
  @UseGuards(ApiKeyAuthGuard, MaintenanceGuard)
  @Get('settings')
  @ApiOkResponse({
    description: 'Get settings successful',
    type: SettingsResponse
  })
  @AuthApiError()
  async getSettingsForExternal() {
    return this.externalsService.getSettingsForExternal()
  }
}
