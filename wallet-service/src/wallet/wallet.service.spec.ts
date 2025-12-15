import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { WalletService } from './wallet.service';

describe('WalletService', () => {
  let service: WalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletService],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  describe('createWallet', () => {
    it('should create a wallet with default values', () => {
      const wallet = service.createWallet({});
      expect(wallet).toBeDefined();
      expect(wallet.id).toBeDefined();
      expect(wallet.currency).toBe('USD');
      expect(wallet.balance).toBe(0);
    });

    it('should create a wallet with initial balance', () => {
      const wallet = service.createWallet({ initialBalance: 100 });
      expect(wallet.balance).toBe(100);
    });
  });

  describe('fundWallet', () => {
    it('should fund a wallet successfully', () => {
      const wallet = service.createWallet({});
      const result = service.fundWallet(wallet.id, { amount: 50 });
      expect(result.wallet.balance).toBe(50);
      expect(result.transaction.amount).toBe(50);
    });

    it('should throw NotFoundException for non-existent wallet', () => {
      expect(() => service.fundWallet('invalid-id', { amount: 50 })).toThrow(NotFoundException);
    });

    it('should prevent duplicate idempotency keys', () => {
      const wallet = service.createWallet({});
      service.fundWallet(wallet.id, { amount: 50, idempotencyKey: 'key1' });
      expect(() => service.fundWallet(wallet.id, { amount: 50, idempotencyKey: 'key1' })).toThrow(ConflictException);
    });
  });

  describe('transfer', () => {
    it('should transfer funds between wallets', () => {
      const fromWallet = service.createWallet({ initialBalance: 100 });
      const toWallet = service.createWallet({});

      const result = service.transfer({
        fromWalletId: fromWallet.id,
        toWalletId: toWallet.id,
        amount: 50,
      });

      expect(result.fromWallet.balance).toBe(50);
      expect(result.toWallet.balance).toBe(50);
    });

    it('should throw BadRequestException for insufficient balance', () => {
      const fromWallet = service.createWallet({ initialBalance: 30 });
      const toWallet = service.createWallet({});

      expect(() =>
        service.transfer({
          fromWalletId: fromWallet.id,
          toWalletId: toWallet.id,
          amount: 50,
        }),
      ).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for same wallet transfer', () => {
      const wallet = service.createWallet({ initialBalance: 100 });

      expect(() =>
        service.transfer({
          fromWalletId: wallet.id,
          toWalletId: wallet.id,
          amount: 50,
        }),
      ).toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent sender wallet', () => {
      const toWallet = service.createWallet({});

      expect(() =>
        service.transfer({
          fromWalletId: 'invalid-id',
          toWalletId: toWallet.id,
          amount: 50,
        }),
      ).toThrow(NotFoundException);
    });
  });

  describe('getWalletWithTransactions', () => {
    it('should return wallet with transaction history', () => {
      const wallet = service.createWallet({});
      service.fundWallet(wallet.id, { amount: 100 });

      const result = service.getWalletWithTransactions(wallet.id);
      expect(result.wallet).toBeDefined();
      expect(result.transactions).toHaveLength(1);
    });
  });
});
