import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Wallet } from './entities/wallet.entity';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { TransferDto } from './dto/transfer.dto';

@Injectable()
export class WalletService {
  private wallets: Map<string, Wallet> = new Map();
  private transactions: Map<string, Transaction[]> = new Map();
  private processedIdempotencyKeys: Set<string> = new Set();

  createWallet(createWalletDto: CreateWalletDto): Wallet {
    const wallet = new Wallet({
      id: uuidv4(),
      currency: createWalletDto.currency || 'USD',
      balance: createWalletDto.initialBalance || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.wallets.set(wallet.id, wallet);
    this.transactions.set(wallet.id, []);

    return wallet;
  }

  fundWallet(walletId: string, fundWalletDto: FundWalletDto): { wallet: Wallet; transaction: Transaction } {
    const wallet = this.wallets.get(walletId);

    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${walletId} not found`);
    }

    const idempotencyKey = fundWalletDto.idempotencyKey;
    const key = idempotencyKey ? `fund_${walletId}_${idempotencyKey}` : null;

    if (key && this.processedIdempotencyKeys.has(key)) {
      throw new ConflictException('This transaction has already been processed (duplicate idempotency key)');
    }

    wallet.balance += fundWalletDto.amount;
    wallet.updatedAt = new Date();

    const transaction = new Transaction({
      id: uuidv4(),
      walletId: wallet.id,
      type: TransactionType.FUND,
      amount: fundWalletDto.amount,
      balanceAfter: wallet.balance,
      idempotencyKey: idempotencyKey,
      createdAt: new Date(),
    });

    this.transactions.get(walletId).push(transaction);

    if (key) {
      this.processedIdempotencyKeys.add(key);
    }

    return { wallet, transaction };
  }

  transfer(transferDto: TransferDto): {
    fromWallet: Wallet;
    toWallet: Wallet;
    transactions: Transaction[];
  } {
    const { fromWalletId, toWalletId, amount, idempotencyKey } = transferDto;

    if (fromWalletId === toWalletId) {
      throw new BadRequestException('Cannot transfer to the same wallet');
    }

    const fromWallet = this.wallets.get(fromWalletId);
    const toWallet = this.wallets.get(toWalletId);

    if (!fromWallet) {
      throw new NotFoundException(`Sender wallet with ID ${fromWalletId} not found`);
    }

    if (!toWallet) {
      throw new NotFoundException(`Receiver wallet with ID ${toWalletId} not found`);
    }

    const key = idempotencyKey ? `transfer_${fromWalletId}_${toWalletId}_${idempotencyKey}` : null;

    if (key && this.processedIdempotencyKeys.has(key)) {
      throw new ConflictException('This transaction has already been processed (duplicate idempotency key)');
    }

    if (fromWallet.balance < amount) {
      throw new BadRequestException(
        `Insufficient balance. Available: ${fromWallet.balance}, Requested: ${amount}`,
      );
    }

    fromWallet.balance -= amount;
    fromWallet.updatedAt = new Date();

    toWallet.balance += amount;
    toWallet.updatedAt = new Date();

    const outTransaction = new Transaction({
      id: uuidv4(),
      walletId: fromWalletId,
      type: TransactionType.TRANSFER_OUT,
      amount: amount,
      balanceAfter: fromWallet.balance,
      referenceWalletId: toWalletId,
      idempotencyKey: idempotencyKey,
      createdAt: new Date(),
    });

    const inTransaction = new Transaction({
      id: uuidv4(),
      walletId: toWalletId,
      type: TransactionType.TRANSFER_IN,
      amount: amount,
      balanceAfter: toWallet.balance,
      referenceWalletId: fromWalletId,
      idempotencyKey: idempotencyKey,
      createdAt: new Date(),
    });

    this.transactions.get(fromWalletId).push(outTransaction);
    this.transactions.get(toWalletId).push(inTransaction);

    if (key) {
      this.processedIdempotencyKeys.add(key);
    }

    return {
      fromWallet,
      toWallet,
      transactions: [outTransaction, inTransaction],
    };
  }

  getWallet(walletId: string): Wallet {
    const wallet = this.wallets.get(walletId);

    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${walletId} not found`);
    }

    return wallet;
  }

  getWalletWithTransactions(walletId: string): {
    wallet: Wallet;
    transactions: Transaction[];
  } {
    const wallet = this.getWallet(walletId);
    const transactions = this.transactions.get(walletId) || [];

    return {
      wallet,
      transactions: transactions.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      ),
    };
  }

  getAllWallets(): Wallet[] {
    return Array.from(this.wallets.values());
  }
}
