import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { LoadOrderInfoDto } from './dto/request.dto'
import { InternalsService } from './internals.service'

@ApiTags('Internals')
@Controller('internals')
export class InternalsController {
  constructor(private internalsService: InternalsService) {}

  //Orders
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('orders/load-info')
  async getOrderDetailForPublic(@Body() loadOrderInfoDto: LoadOrderInfoDto) {
    return this.internalsService.loadOrderDetailForPublic(
      loadOrderInfoDto.merchantId,
      loadOrderInfoDto.orderCode
    )
  }
}
