export interface CoinbaseProduct {
  product_id: string;
  price: string;
  base_currency: string;
  quote_currency: string;
  base_increment: string;
  quote_increment: string;
  price_increment: string;
  status: string;
}

export interface CoinbaseCandleRaw {
  start: string;
  low: string;
  high: string;
  open: string;
  close: string;
  volume: string;
}

export interface CoinbaseAccount {
  uuid: string;
  name: string;
  currency: string;
  available_balance: {
    value: string;
    currency: string;
  };
  hold: {
    value: string;
    currency: string;
  };
}

export interface CoinbaseOrderRequest {
  client_order_id: string;
  product_id: string;
  side: "BUY" | "SELL";
  order_configuration: {
    market_market_ioc?: {
      quote_size?: string;
      base_size?: string;
    };
    limit_limit_gtc?: {
      base_size: string;
      limit_price: string;
      post_only: boolean;
    };
  };
}

export interface CoinbaseOrderResponse {
  success: boolean;
  order_id: string;
  product_id: string;
  side: string;
  client_order_id: string;
  error_response?: {
    error: string;
    message: string;
  };
}
