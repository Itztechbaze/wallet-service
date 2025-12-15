# Wallet Service API

A simple wallet service built with NestJS for the Novacrust Backend Developer Take-Home Test.

## Tech Stack

- **NestJS** - A progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **class-validator** - Request validation
- **In-memory storage** - Using Map for wallets and transactions

## Features

- Create wallets with USD currency
- Fund wallets with positive amounts
- Transfer funds between wallets
- View wallet details with transaction history
- Idempotency support for fund and transfer operations
- Comprehensive input validation and error handling

## Project Structure

```
src/
├── main.ts                          # Application entry point
├── app.module.ts                    # Root module
└── wallet/
    ├── wallet.module.ts             # Wallet module
    ├── wallet.controller.ts         # API endpoints
    ├── wallet.service.ts            # Business logic
    ├── wallet.service.spec.ts       # Unit tests
    ├── dto/
    │   ├── create-wallet.dto.ts     # Create wallet request
    │   ├── fund-wallet.dto.ts       # Fund wallet request
    │   └── transfer.dto.ts          # Transfer request
    └── entities/
        ├── wallet.entity.ts         # Wallet entity
        └── transaction.entity.ts    # Transaction entity
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or later)
- npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wallet-service
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run start:dev
```

The server will start on `http://localhost:5000`

### Running Tests

```bash
npm test
```

## API Endpoints

### 1. Create Wallet

**POST** `/wallets`

Request Body:
```json
{
  "currency": "USD",
  "initialBalance": 0
}
```

Response:
```json
{
  "success": true,
  "message": "Wallet created successfully",
  "data": {
    "id": "uuid",
    "currency": "USD",
    "balance": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Fund Wallet

**POST** `/wallets/:id/fund`

Request Body:
```json
{
  "amount": 100,
  "idempotencyKey": "unique-key-123"
}
```

Response:
```json
{
  "success": true,
  "message": "Wallet funded successfully",
  "data": {
    "wallet": { ... },
    "transaction": { ... }
  }
}
```

### 3. Transfer Between Wallets

**POST** `/wallets/transfer`

Request Body:
```json
{
  "fromWalletId": "sender-wallet-id",
  "toWalletId": "receiver-wallet-id",
  "amount": 50,
  "idempotencyKey": "unique-transfer-key"
}
```

Response:
```json
{
  "success": true,
  "message": "Transfer completed successfully",
  "data": {
    "fromWallet": { "id": "...", "balance": 50 },
    "toWallet": { "id": "...", "balance": 50 },
    "amount": 50
  }
}
```

### 4. Get Wallet Details

**GET** `/wallets/:id`

Response:
```json
{
  "success": true,
  "data": {
    "wallet": {
      "id": "uuid",
      "currency": "USD",
      "balance": 100,
      "createdAt": "...",
      "updatedAt": "..."
    },
    "transactions": [
      {
        "id": "txn-uuid",
        "walletId": "wallet-uuid",
        "type": "FUND",
        "amount": 100,
        "balanceAfter": 100,
        "createdAt": "..."
      }
    ]
  }
}
```

### 5. Get All Wallets

**GET** `/wallets`

Response:
```json
{
  "success": true,
  "data": [
    { "id": "...", "currency": "USD", "balance": 100, ... }
  ]
}
```

## Error Handling

The API returns meaningful error responses:

- **400 Bad Request** - Invalid input (negative amounts, same wallet transfer, insufficient balance)
- **404 Not Found** - Wallet not found
- **409 Conflict** - Duplicate idempotency key

Example error response:
```json
{
  "statusCode": 400,
  "message": "Insufficient balance. Available: 30, Requested: 50",
  "error": "Bad Request"
}
```

## Assumptions Made

1. **Currency**: All wallets use USD as the default currency
2. **In-memory storage**: Data is not persisted between server restarts
3. **Idempotency**: Optional idempotency keys prevent duplicate fund/transfer operations
4. **Balance precision**: Using JavaScript numbers (for production, consider decimal libraries)
5. **No authentication**: This is a simplified service without user authentication

## Production Scaling Considerations

For a production environment, the following improvements would be recommended:

1. **Database**: Replace in-memory storage with PostgreSQL or MongoDB for persistence
2. **Transactions**: Use database transactions for atomic operations
3. **Caching**: Add Redis for caching wallet balances
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **Authentication**: Add JWT-based authentication
6. **Logging**: Structured logging with correlation IDs
7. **Monitoring**: Add health checks and metrics (Prometheus/Grafana)
8. **Message Queue**: Use event-driven architecture for async processing
9. **Database Indexing**: Index on wallet IDs and transaction timestamps
10. **Load Balancing**: Horizontal scaling with load balancer
11. **Decimal Precision**: Use libraries like decimal.js for accurate currency calculations

## Author

Michael

## License

MIT
