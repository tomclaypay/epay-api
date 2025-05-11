import { IsString } from 'class-validator'

export class IdParamsDto {
  @IsString()
  id: string
}
