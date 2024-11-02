# Robinhood Crypto Node.js Client

A TypeScript/JavaScript client library for interacting with the Robinhood Crypto API. This library provides a clean interface for crypto trading operations, market data retrieval, and account management.


For setup instructions and API documentation, please visit the [official Robinhood Crypto API docs](https://docs.robinhood.com/crypto/trading/#section/Introduction).

## Installation

```bash
npm install robinhood-crypto
```

## Configuration

Initialize the client with your Robinhood Crypto API credentials:

```typescript
import { RobinhoodCrypto } from 'robinhood-crypto';

const client = new RobinhoodCrypto({
  privateKeyBase64: 'YOUR_PRIVATE_KEY',
  publicKeyBase64: 'YOUR_PUBLIC_KEY',
  apiKey: 'YOUR_API_KEY'
});
```

## Features

- Market data operations
- Order management
- Account information
- Holdings tracking
- Real-time bid/ask prices
- Price estimation

## API Reference

### Market Data Operations

#### Get Best Bid/Ask Prices
```typescript
const bidAsk = await client.getBestBidAsk(['BTC-USD']);
```

#### Get Estimated Price
```typescript
const estimate = await client.getEstimatedPrice(
  'BTC-USD',
  'bid',
  [0.1, 0.2]
);
```

### Order Operations

#### Place Market Order
```typescript
const orderParams = {
  side: 'buy',
  type: 'market',
  symbol: 'BTC-USD',
  market_order_config: {
    asset_quantity: 0.001
  }
};

const order = await client.placeOrder(orderParams);
```

#### Place Limit Order
```typescript
const limitOrderParams = {
  side: 'buy',
  type: 'limit',
  symbol: 'BTC-USD',
  limit_order_config: {
    asset_quantity: 0.001,
    limit_price: 50000,
    time_in_force: 'gtc'
  }
};

const limitOrder = await client.placeOrder(limitOrderParams);
```

#### Get Orders
```typescript
// Get all orders
const allOrders = await client.getOrders();

// Get filtered orders
const filteredOrders = await client.getOrders({
  symbol: 'BTC-USD',
  side: 'buy',
  state: 'open'
});
```

#### Get Specific Order
```typescript
const order = await client.getOrder('order-id');
```

#### Cancel Order
```typescript
await client.cancelOrder('order-id');
```

### Account Operations

#### Get Account Information
```typescript
const account = await client.getAccount();
```

#### Get Holdings
```typescript
// Get all holdings
const holdings = await client.getHoldings();

// Get specific asset holdings
const btcHoldings = await client.getHoldings(['BTC']);
```

## Types

### Order Types

```typescript
interface OrderPayload {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop_limit' | 'stop_loss';
  market_order_config?: MarketOrderConfig;
  limit_order_config?: LimitOrderConfig;
  stop_loss_order_config?: StopLossOrderConfig;
  stop_limit_order_config?: StopLimitOrderConfig;
}

interface MarketOrderConfig {
  asset_quantity: number;
}

interface LimitOrderConfig {
  quote_amount?: number;
  asset_quantity?: number;
  limit_price: number;
  time_in_force: 'gtc';
}

interface StopLossOrderConfig {
  quote_amount?: number;
  asset_quantity?: number;
  stop_price: number;
  time_in_force: 'gtc';
}

interface StopLimitOrderConfig {
  quote_amount?: number;
  asset_quantity?: number;
  limit_price: number;
  stop_price: number;
  time_in_force: 'gtc';
}
```

### Order Filters

```typescript
interface OrderFilters {
  created_at_start?: string;
  created_at_end?: string;
  symbol?: string;
  id?: string;
  side?: 'buy' | 'sell';
  state?: 'open' | 'canceled' | 'partially_filled' | 'filled' | 'failed';
  type?: 'limit' | 'market' | 'stop_limit' | 'stop_loss';
  updated_at_start?: string;
  updated_at_end?: string;
}
```

## Error Handling

The client throws errors for unsuccessful API responses. It's recommended to wrap API calls in try-catch blocks:

```typescript
try {
  const order = await client.placeOrder(orderParams);
} catch (error) {
  console.error('Error placing order:', error);
}
```

## Running Tests

```bash
npm test
```

## Dependencies

- `tweetnacl`: For cryptographic operations
- `uuid`: For generating unique order IDs

## Security Notes

- Never commit your API credentials to version control
- Store your private key securely
- Use environment variables for sensitive configuration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT