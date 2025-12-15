import { IsOptional, IsNumber, Min, IsString } from 'class-validator';

export class CreateWalletDto {
  @IsOptional()
  @IsString()
  currency?: string = 'USD';

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Initial balance cannot be negative' })
  initialBalance?: number = 0;
}
