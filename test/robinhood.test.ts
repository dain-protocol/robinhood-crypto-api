import { RobinhoodCrypto, OrderPayload, BidAskResponse, EstimatedPriceResponse, OrderResponse, AccountResponse, HoldingsResponse, OrdersResponse } from "../src/robinhood";

describe("RobinhoodCrypto", () => {
  let client: RobinhoodCrypto;

  beforeEach(() => {
    client = new RobinhoodCrypto({
      privateKeyBase64: "",
      publicKeyBase64: "", 
      apiKey: "",
    });
  });

  describe("Account Operations", () => {
    it("should get account info with proper types", async () => {
      const accountInfo: AccountResponse = await client.getAccount();
      expect(accountInfo.account_number).toBeDefined();
      expect(accountInfo.status).toMatch(/^(active|deactivated|sell_only)$/);
      expect(typeof accountInfo.buying_power).toBe("string");
      expect(typeof accountInfo.buying_power_currency).toBe("string");
    });

    it("should get holdings with proper types", async () => {
      const holdings: HoldingsResponse = await client.getHoldings();
      expect(Array.isArray(holdings.results)).toBe(true);
      if (holdings.results.length > 0) {
        const holding = holdings.results[0];
        expect(typeof holding.account_number).toBe("string");
        expect(typeof holding.asset_code).toBe("string");
        expect(typeof holding.total_quantity).toBe("number");
        expect(typeof holding.quantity_available_for_trading).toBe("number");
      }
    });
  });

  describe("Order Operations", () => {
    it("should place a market order and verify response types", async () => {
      const orderParams: OrderPayload = {
        side: "buy",
        type: "market",
        symbol: "DOGE-USD",
        market_order_config: {
          asset_quantity: 1,
        },
      };

      const order: OrderResponse = await client.placeOrder(orderParams);
      expect(order.id).toBeDefined();
      expect(order.client_order_id).toBeDefined();
      expect(order.side).toBe("buy");
      expect(order.type).toBe("market");
      expect(Array.isArray(order.executions)).toBe(true);
      expect(typeof order.filled_asset_quantity).toBe("number");
      expect(order.state).toMatch(/^(open|canceled|partially_filled|filled|failed)$/);
    });

    it("should get orders with filters and verify response types", async () => {
      const orders: OrdersResponse = await client.getOrders({
        symbol: "DOGE-USD",
        side: "buy",
      });
      expect(orders.next === null || typeof orders.next === "string").toBe(true);
      expect(orders.previous === null || typeof orders.previous === "string").toBe(true);
      expect(Array.isArray(orders.results)).toBe(true);
      
      if (orders.results.length > 0) {
        const order = orders.results[0];
        expect(order.id).toBeDefined();
        expect(order.symbol).toBe("DOGE-USD");
        expect(order.side).toBe("buy");
      }
    });

    it("should get a specific order and verify response types", async () => {
      const orderParams: OrderPayload = {
        side: "buy",
        type: "market",
        symbol: "DOGE-USD",
        market_order_config: {
          asset_quantity: 1,
        },
      };
      const placedOrder: OrderResponse = await client.placeOrder(orderParams);

      console.log("PLACED ORDER", placedOrder);
      const order: OrderResponse = await client.getOrder(placedOrder.id);
      
      expect(order.id).toBe(placedOrder.id);
      expect(order.symbol).toBe("DOGE-USD");
      expect(order.side).toBe("buy");
      expect(order.type).toBe("market");
      expect(typeof order.filled_asset_quantity).toBe("number");
      expect(parseFloat(order.market_order_config?.asset_quantity as unknown as string)).toBe(1);
    });
  });

  describe("Market Data Operations", () => {
    it("should get best bid/ask prices with proper types", async () => {
      const bidAsk: BidAskResponse = await client.getBestBidAsk(["BTC-USD"]);
      expect(Array.isArray(bidAsk.results)).toBe(true);
      
      if (bidAsk.results.length > 0) {
        const result = bidAsk.results[0];
        expect(result.symbol).toBe("BTC-USD");
        expect(typeof result.price).toBe("number");
        expect(typeof result.bid_inclusive_of_sell_spread).toBe("number");
        expect(typeof result.sell_spread).toBe("number");
        expect(typeof result.ask_inclusive_of_buy_spread).toBe("number");
        expect(typeof result.buy_spread).toBe("number");
        expect(typeof result.timestamp).toBe("string");
      }
    });

    it("should get estimated price with proper types", async () => {
      const estimate: EstimatedPriceResponse = await client.getEstimatedPrice(
        "DOGE-USD",
        "bid",
        [0.1, 0.2]
      );
      expect(Array.isArray(estimate.results)).toBe(true);
      
      if (estimate.results.length > 0) {
        const result = estimate.results[0];
        expect(result.symbol).toBe("DOGE-USD");
        expect(result.side).toBe("bid");
        expect(typeof result.price).toBe("number");
        expect(typeof result.quantity).toBe("number");
        expect(typeof result.bid_inclusive_of_sell_spread).toBe("number");
        expect(typeof result.sell_spread).toBe("number");
        expect(typeof result.ask_inclusive_of_buy_spread).toBe("number");
        expect(typeof result.buy_spread).toBe("number");
        expect(typeof result.timestamp).toBe("string");
      }
    });
  });
});
