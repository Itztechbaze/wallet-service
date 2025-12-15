import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { TransferDto } from './dto/transfer.dto';

@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createWallet(@Body() createWalletDto: CreateWalletDto) {
    const wallet = this.walletService.createWallet(createWalletDto);
    return {
      success: true,
      message: 'Wallet created successfully',
      data: wallet,
    };
  }

  @Post(':id/fund')
  @HttpCode(HttpStatus.OK)
  fundWallet(
    @Param('id') id: string,
    @Body() fundWalletDto: FundWalletDto,
  ) {
    const result = this.walletService.fundWallet(id, fundWalletDto);
    return {
      success: true,
      message: 'Wallet funded successfully',
      data: result,
    };
  }

  @Post('transfer')
  @HttpCode(HttpStatus.OK)
  transfer(@Body() transferDto: TransferDto) {
    const result = this.walletService.transfer(transferDto);
    return {
      success: true,
      message: 'Transfer completed successfully',
      data: {
        fromWallet: {
          id: result.fromWallet.id,
          balance: result.fromWallet.balance,
        },
        toWallet: {
          id: result.toWallet.id,
          balance: result.toWallet.balance,
        },
        amount: transferDto.amount,
      },
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getAllWallets() {
    const wallets = this.walletService.getAllWallets();
    return {
      success: true,
      data: wallets,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getWallet(@Param('id') id: string) {
    const result = this.walletService.getWalletWithTransactions(id);
    return {
      success: true,
      data: result,
    };
  }
}
