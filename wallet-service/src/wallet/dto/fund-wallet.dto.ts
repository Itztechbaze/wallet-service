import { IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';

export class FundWalletDto {
  @IsNumber()
  @IsPositive({ message: 'Amount must be a positive number' })
  amount: number;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
