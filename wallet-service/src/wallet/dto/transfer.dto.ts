import { IsNumber, IsPositive, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class TransferDto {
  @IsString()
  @IsNotEmpty({ message: 'Sender wallet ID is required' })
  fromWalletId: string;

  @IsString()
  @IsNotEmpty({ message: 'Receiver wallet ID is required' })
  toWalletId: string;

  @IsNumber()
  @IsPositive({ message: 'Amount must be a positive number' })
  amount: number;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
