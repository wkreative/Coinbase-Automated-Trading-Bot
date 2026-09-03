import { z } from "zod";

export const BotConfigSchema = z.object({
  timeframe: z.string().default("5m"),
  products: z.array(z.string()).default(["BTC-USD", "ETH-USD", "SOL-USD"]),
  signalThreshold: z.number().min(0).max(100).default(75),
  emaFast: z.number().int().positive().default(20),
  emaSlow: z.number().int().positive().default(50),
  rsiPeriod: z.number().int().positive().default(14),
  takeProfitPercent: z.number().positive().default(4.0),
  stopLossPercent: z.number().positive().default(2.5),
  startingPaperCapital: z.number().positive().default(1000),
  maxPositionUsd: z.number().positive().default(200),
  maxOpenPositions: z.number().int().positive().default(2),
  maxDeployedCapitalUsd: z.number().positive().default(400),
  maxLivePortfolioExposureUsd: z.number().positive().default(1000),
  dailyLossLimitPercent: z.number().positive().default(3),
  weeklyLossLimitPercent: z.number().positive().default(6),
  maxDrawdownPercent: z.number().positive().default(10),
  maxConsecutiveLosses: z.number().int().positive().default(3),
  lossCooldownHours: z.number().positive().default(6),
  marketDataMaxAgeSeconds: z.number().positive().default(15),
  strategyVersion: z.string().default("v1.0.0"),
});

export type BotConfig = z.infer<typeof BotConfigSchema>;

export const DEFAULT_CONFIG: BotConfig = BotConfigSchema.parse({});
