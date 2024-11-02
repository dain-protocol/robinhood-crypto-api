import nacl from "tweetnacl";
import { v4 as uuidv4 } from "uuid";

export interface RobinhoodConfig {
  privateKeyBase64: string;
  publicKeyBase64: string;
  apiKey: string;
}

export interface MarketOrderConfig {
  asset_quantity: number;
}

export interface LimitOrderConfig {
  quote_amount?: number;
  asset_quantity?: number;
  limit_price: number;
  time_in_force: "gtc";
}

export interface StopLossOrderConfig {
  quote_amount?: number;
  asset_quantity?: number;
  stop_price: number;
  time_in_force: "gtc";
}

export interface StopLimitOrderConfig {
  quote_amount?: number;
  asset_quantity?: number;
  limit_price: number;
  stop_price: number;
  time_in_force: "gtc";
}

export interface OrderPayload {
  symbol: string;
  side: "buy" | "sell";
  type: "market" | "limit" | "stop_limit" | "stop_loss";
  market_order_config?: MarketOrderConfig;
  limit_order_config?: LimitOrderConfig;
  stop_loss_order_config?: StopLossOrderConfig;
  stop_limit_order_config?: StopLimitOrderConfig;
}

export interface TradingPair {
  symbol: string;
  status: string;
  min_order_size: number;
  max_order_size: number;
}

export interface OrderFilters {
  created_at_start?: string;
  created_at_end?: string;
  symbol?: string;
  id?: string;
  side?: "buy" | "sell";
  state?: "open" | "canceled" | "partially_filled" | "filled" | "failed";
  type?: "limit" | "market" | "stop_limit" | "stop_loss";
  updated_at_start?: string;
  updated_at_end?: string;
}

export class RobinhoodCrypto {
  private config: RobinhoodConfig;
  private baseUrl = "https://trading.robinhood.com";

  constructor(config: RobinhoodConfig) {
    this.config = config;
  }
  private async signRequest(path: string, method: string, body: string = "") {
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // Convert base64 keys to Uint8Array
    const privateKeyBytes = new Uint8Array(
      Buffer.from(this.config.privateKeyBase64, "base64")
    );
    const publicKeyBytes = Buffer.from(this.config.publicKeyBase64, "base64");

    // Create signing key pair
    const signingKey = nacl.sign.keyPair.fromSecretKey(privateKeyBytes);

    // Create message to sign
    const message = `${this.config.apiKey}${timestamp}${path}${method}${body}`;

    // Sign message
    const signature = nacl.sign.detached(
      new Uint8Array(Buffer.from(message)),
      signingKey.secretKey
    );

    // Convert signature to base64
    const signatureBase64 = Buffer.from(signature).toString("base64");

    return {
      timestamp,
      signatureBase64,
    };
  }

  private async makeRequest(path: string, method: string, body: string = "") {
    const { timestamp, signatureBase64 } = await this.signRequest(
      path,
      method,
      body
    );

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "x-api-key": this.config.apiKey,
      "x-timestamp": timestamp,
      "x-signature": signatureBase64,
    };

    const requestOptions: RequestInit = {
      method,
      headers,
    };

    if (body) {
      requestOptions.body = body;
    }

    try {
      const response = await fetch(`${this.baseUrl}${path}`, requestOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error making request:", error);
      throw error;
    }
  }

  // Market Data
  async getBestBidAsk(symbols: string[] = ["BTC-USD"]) {
    const queryString = symbols.map((s) => `symbol=${s}`).join("&");
    return this.makeRequest(
      `/api/v1/crypto/marketdata/best_bid_ask/?${queryString}`,
      "GET"
    );
  }

  async getEstimatedPrice(
    symbol: string,
    side: "bid" | "ask" | "both",
    quantities: number[]
  ) {
    const queryString = `symbol=${symbol}&side=${side}&quantity=${quantities.join(
      ","
    )}`;
    return this.makeRequest(
      `/api/v1/crypto/marketdata/estimated_price/?${queryString}`,
      "GET"
    );
  }

  // Trading Pairs
  async getTradingPairs(
    symbols: string[] = ["BTC-USD"],
    limit?: number,
    cursor?: string
  ) {
    let queryString = symbols.map((s) => `symbol=${s}`).join("&");
    if (limit) queryString += `&limit=${limit}`;
    if (cursor) queryString += `&cursor=${cursor}`;
    return this.makeRequest(
      `/api/v1/crypto/trading/trading_pairs/?${queryString}`,
      "GET"
    );
  }

  // Orders
  async placeOrder(order: OrderPayload) {
    const payload = {
      ...order,
      client_order_id: uuidv4(),
    };
    return this.makeRequest(
      "/api/v1/crypto/trading/orders/",
      "POST",
      JSON.stringify(payload)
    );
  }

  async getOrder(orderId: string) {
    return this.makeRequest(`/api/v1/crypto/trading/orders/${orderId}/`, "GET");
  }

  async cancelOrder(orderId: string) {
    return this.makeRequest(
      `/api/v1/crypto/trading/orders/${orderId}/cancel/`,
      "POST"
    );
  }

  async getOrders(filters?: OrderFilters, limit?: number, cursor?: string) {
    let queryParams: string[] = [];

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.push(`${key}=${value}`);
      });
    }

    if (limit) queryParams.push(`limit=${limit}`);
    if (cursor) queryParams.push(`cursor=${cursor}`);

    const queryString =
      queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
    return this.makeRequest(
      `/api/v1/crypto/trading/orders/${queryString}`,
      "GET"
    );
  }

  // Account
  async getAccount() {
    return this.makeRequest("/api/v1/crypto/trading/accounts/", "GET");
  }

  // Holdings
  async getHoldings(assetCodes?: string[], limit?: number, cursor?: string) {
    let queryParams: string[] = [];

    if (assetCodes) {
      assetCodes.forEach((code) => queryParams.push(`asset_code=${code}`));
    }

    if (limit) queryParams.push(`limit=${limit}`);
    if (cursor) queryParams.push(`cursor=${cursor}`);

    const queryString =
      queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
    return this.makeRequest(
      `/api/v1/crypto/trading/holdings/${queryString}`,
      "GET"
    );
  }
}
