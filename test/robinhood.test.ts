import { RobinhoodCrypto, OrderPayload } from "../src/robinhood";

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
    it("should get account info", async () => {
      const accountInfo = await client.getAccount();
      expect(accountInfo).toBeDefined();
    });

    it("should get holdings", async () => {
      const holdings = await client.getHoldings();
      expect(holdings).toBeDefined();
    });
  });

  describe("Order Operations", () => {
    it("should place a market order", async () => {
      const orderParams: OrderPayload = {
        side: "buy",
        type: "market",
        symbol: "DOGE-USD",
        market_order_config: {
          asset_quantity: 1,
        },
      };

      const order = await client.placeOrder(orderParams);
      expect(order).toBeDefined();
    });

    it("should get orders with filters", async () => {
      const orders = await client.getOrders({
        symbol: "BTC-USD",
        side: "buy",
      });
      expect(orders).toBeDefined();
    });

    it("should get a specific order", async () => {
      // First place an order
      const orderParams: OrderPayload = {
        side: "buy",
        type: "market",
        symbol: "BTC-USD",
        market_order_config: {
          asset_quantity: 0.001,
        },
      };
      const placedOrder = await client.placeOrder(orderParams);

      // Then retrieve it
      const order = await client.getOrder(placedOrder.id);
      expect(order).toBeDefined();
      expect(order.id).toBe(placedOrder.id);
    });
  });

  describe("Market Data Operations", () => {
    it("should get best bid/ask prices", async () => {
      const bidAsk = await client.getBestBidAsk(["BTC-USD"]);
      expect(bidAsk).toBeDefined();
    });

    it("should get estimated price", async () => {
      const estimate = await client.getEstimatedPrice(
        "BTC-USD",
        "bid",
        [0.1, 0.2]
      );
      expect(estimate).toBeDefined();
    });
  });
});
