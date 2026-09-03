"use client";

import { useState, useEffect } from "react";
import {
  BotSettings,
  BotState,
  Position,
  TradingSymbol,
  TradingMode,
} from "../types";

export interface LogEntry {
  id: string;
  level: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  category: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface SignalEntry {
  id: string;
  timestamp: string;
  symbol: TradingSymbol;
  price: number;
  ema20: number;
  ema50: number;
  rsi: number;
  recentHigh: number;
  pullbackPercent: number;
  totalScore: number;
  decision: "BUY" | "REJECT";
  rejectionReason?: string;
  trendScore: number;
  pullbackScore: number;
  rsiScore: number;
  confirmationScore: number;
  marketScore: number;
}

export interface MarketAssetMetric {
  symbol: TradingSymbol;
  price: number;
  ema20: number;
  ema50: number;
  rsi: number;
  pullbackPercent: number;
  score: number;
  status: "WAIT" | "READY" | "POSITION OPEN" | "RISK OFF";
}

const DEFAULT_SETTINGS: BotSettings = {
  userId: "00000000-0000-0000-0000-000000000001",
  tradingMode: "PAPER",
  botEnabled: false,
  liveTradingEnabled: false,
  startingCapital: 1000,
  reservedCapital: 400,
  maxTradingCapital: 600,
  maxTotalExposure: 300,
  maxOpenPositions: 2,
  btcMaxPosition: 150,
  ethMaxPosition: 125,
  solMaxPosition: 100,
  takeProfitPercent: 4.0,
  stopLossPercent: 2.5,
  dailyLossLimit: 15,
  weeklyLossLimit: 40,
  maxDrawdownPercent: 10,
  emaFast: 20,
  emaSlow: 50,
  rsiPeriod: 14,
  rsiMin: 35,
  rsiMax: 48,
  pullbackMin: 2.0,
  pullbackMax: 4.5,
  signalScoreMinimum: 75,
  sameAssetCooldownMinutes: 60,
  simulatedFeePercent: 0.6,
  simulatedSlippagePercent: 0.1,
};

const DEFAULT_STATE: BotState = {
  userId: "00000000-0000-0000-0000-000000000001",
  status: "STOPPED",
  currentBalance: 1000,
  availableBalance: 600,
  reservedBalance: 400,
  totalExposure: 0,
  peakBalance: 1000,
  currentDrawdownPercent: 0,
  lastRunAt: null,
};

// Storage keys
const STORAGE_KEYS = {
  SETTINGS: "cb_bot_settings",
  STATE: "cb_bot_state",
  POSITIONS: "cb_bot_positions",
  CLOSED_TRADES: "cb_bot_closed_trades",
  SIGNALS: "cb_bot_signals",
  LOGS: "cb_bot_logs",
};

export function useTradingBotStore() {
  const [settings, setSettings] = useState<BotSettings>(DEFAULT_SETTINGS);
  const [state, setState] = useState<BotState>(DEFAULT_STATE);
  const [positions, setPositions] = useState<Position[]>([]);
  const [closedTrades, setClosedTrades] = useState<Position[]>([]);
  const [signals, setSignals] = useState<SignalEntry[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "log-1",
      level: "INFO",
      category: "SYSTEM",
      message: "Bot initialized in PAPER trading mode with $1,000 capital.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [marketAssets, setMarketAssets] = useState<MarketAssetMetric[]>([
    {
      symbol: "BTC-USD",
      price: 64250.5,
      ema20: 64180.0,
      ema50: 63950.0,
      rsi: 44.2,
      pullbackPercent: -2.4,
      score: 85,
      status: "READY",
    },
    {
      symbol: "ETH-USD",
      price: 3420.75,
      ema20: 3410.0,
      ema50: 3390.0,
      rsi: 41.5,
      pullbackPercent: -3.1,
      score: 80,
      status: "WAIT",
    },
    {
      symbol: "SOL-USD",
      price: 144.5,
      ema20: 143.8,
      ema50: 142.0,
      rsi: 46.8,
      pullbackPercent: -1.5,
      score: 65,
      status: "WAIT",
    },
  ]);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (savedSettings) setSettings(JSON.parse(savedSettings));

      const savedState = localStorage.getItem(STORAGE_KEYS.STATE);
      if (savedState) setState(JSON.parse(savedState));

      const savedPositions = localStorage.getItem(STORAGE_KEYS.POSITIONS);
      if (savedPositions) setPositions(JSON.parse(savedPositions));

      const savedClosed = localStorage.getItem(STORAGE_KEYS.CLOSED_TRADES);
      if (savedClosed) setClosedTrades(JSON.parse(savedClosed));

      const savedSignals = localStorage.getItem(STORAGE_KEYS.SIGNALS);
      if (savedSignals) setSignals(JSON.parse(savedSignals));

      const savedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (savedLogs) setLogs(JSON.parse(savedLogs));
    } catch (e) {
      console.error("Error loading state from localStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      localStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify(state));
      localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(positions));
      localStorage.setItem(STORAGE_KEYS.CLOSED_TRADES, JSON.stringify(closedTrades));
      localStorage.setItem(STORAGE_KEYS.SIGNALS, JSON.stringify(signals));
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs.slice(0, 100)));
    } catch (e) {
      console.error("Error saving state to localStorage:", e);
    }
  }, [settings, state, positions, closedTrades, signals, logs, isLoaded]);

  // Add Log Helper
  const addLog = (level: LogEntry["level"], category: string, message: string, metadata?: Record<string, unknown>) => {
    setLogs((prev) => [
      {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        level,
        category,
        message,
        timestamp: new Date().toISOString(),
        metadata,
      },
      ...prev.slice(0, 100),
    ]);
  };

  // Start Bot
  const startBot = () => {
    setState((prev) => ({ ...prev, status: "RUNNING", lastRunAt: new Date().toISOString() }));
    setSettings((prev) => ({ ...prev, botEnabled: true }));
    addLog("INFO", "BOT_CONTROL", `Bot started in ${settings.tradingMode} mode.`);
  };

  // Pause Bot
  const pauseBot = () => {
    setState((prev) => ({ ...prev, status: "PAUSED" }));
    addLog("WARNING", "BOT_CONTROL", "Bot paused manually by user.");
  };

  // Stop Bot
  const stopBot = () => {
    setState((prev) => ({ ...prev, status: "STOPPED" }));
    setSettings((prev) => ({ ...prev, botEnabled: false }));
    addLog("INFO", "BOT_CONTROL", "Bot stopped.");
  };

  // Halt Bot
  const haltBot = () => {
    setState((prev) => ({ ...prev, status: "HALTED" }));
    setSettings((prev) => ({ ...prev, botEnabled: false }));
    addLog("CRITICAL", "RISK_LIMIT", "Bot HALTED manually or by drawdown trigger.");
  };

  // Emergency Stop
  const emergencyStop = (closePositions: boolean) => {
    setState((prev) => ({ ...prev, status: "HALTED" }));
    setSettings((prev) => ({ ...prev, botEnabled: false }));
    addLog("CRITICAL", "EMERGENCY", "EMERGENCY STOP TRIGGERED! Trading halted immediately.");

    if (closePositions && positions.length > 0) {
      positions.forEach((pos) => {
        closePosition(pos.id, "EMERGENCY", pos.entryPrice);
      });
    }
  };

  // Switch Trading Mode
  const switchTradingMode = (newMode: TradingMode) => {
    if (newMode === "LIVE" && (!settings.liveTradingEnabled || process.env.NEXT_PUBLIC_LIVE_TRADING_ENABLED !== "true")) {
      addLog("ERROR", "SECURITY", "Cannot enable LIVE mode: LIVE_TRADING_ENABLED is false in server settings.");
      return false;
    }
    setSettings((prev) => ({ ...prev, tradingMode: newMode }));
    addLog("WARNING", "SECURITY", `Trading mode changed to ${newMode}.`);
    return true;
  };

  // Close Position
  const closePosition = (positionId: string, reason: Position["exitReason"], exitPrice: number) => {
    setPositions((prev) => {
      const pos = prev.find((p) => p.id === positionId);
      if (!pos) return prev;

      const grossPnl = (exitPrice - pos.entryPrice) * pos.quantity;
      const exitFee = (pos.quoteAmount * settings.simulatedFeePercent) / 100;
      const netPnl = grossPnl - pos.entryFee - exitFee;
      const pnlPercent = (netPnl / pos.quoteAmount) * 100;

      const closedPos: Position = {
        ...pos,
        status: "CLOSED",
        closedAt: new Date().toISOString(),
        exitPrice,
        exitReason: reason,
        exitFee,
        grossPnl,
        netPnl,
        pnlPercent,
      };

      setClosedTrades((closed) => [closedPos, ...closed]);

      // Update state balance
      setState((st) => {
        const newBalance = st.currentBalance + netPnl;
        const newPeak = Math.max(st.peakBalance, newBalance);
        const drawdown = ((newPeak - newBalance) / newPeak) * 100;

        return {
          ...st,
          currentBalance: newBalance,
          availableBalance: st.availableBalance + pos.quoteAmount + netPnl,
          totalExposure: Math.max(0, st.totalExposure - pos.quoteAmount),
          peakBalance: newPeak,
          currentDrawdownPercent: drawdown,
          status: drawdown >= settings.maxDrawdownPercent ? "HALTED" : st.status,
        };
      });

      addLog(
        netPnl >= 0 ? "INFO" : "WARNING",
        "TRADE_CLOSED",
        `Position closed [${pos.symbol}] via ${reason}. Net PnL: $${netPnl.toFixed(2)} (${pnlPercent.toFixed(2)}%)`
      );

      return prev.filter((p) => p.id !== positionId);
    });
  };

  // Execute Simulated Scan
  const runMarketScan = () => {
    if (state.status !== "RUNNING") return;

    addLog("INFO", "MARKET_SCAN", "Scanning markets BTC-USD, ETH-USD, SOL-USD...");

    // Update prices & tickers
    setMarketAssets((prevAssets) =>
      prevAssets.map((asset) => {
        const delta = (Math.random() - 0.47) * asset.price * 0.004;
        const newPrice = Number((asset.price + delta).toFixed(2));
        const newRsi = Number(Math.max(25, Math.min(75, asset.rsi + (Math.random() - 0.5) * 2)).toFixed(1));
        const newPb = Number((-1.5 - Math.random() * 2.5).toFixed(1));
        const score = Math.floor(60 + Math.random() * 35);

        return {
          ...asset,
          price: newPrice,
          rsi: newRsi,
          pullbackPercent: newPb,
          score,
          status: positions.some((p) => p.symbol === asset.symbol) ? "POSITION OPEN" : score >= 75 ? "READY" : "WAIT",
        };
      })
    );

    // Check TP/SL for open positions
    positions.forEach((pos) => {
      const asset = marketAssets.find((a) => a.symbol === pos.symbol);
      if (!asset) return;

      if (asset.price >= pos.takeProfitPrice) {
        closePosition(pos.id, "TAKE_PROFIT", asset.price);
      } else if (asset.price <= pos.stopLossPrice) {
        closePosition(pos.id, "STOP_LOSS", asset.price);
      }
    });

    // Check if new trade signal triggers
    if (positions.length < settings.maxOpenPositions) {
      const candidate = marketAssets.find(
        (a) => a.score >= settings.signalScoreMinimum && !positions.some((p) => p.symbol === a.symbol)
      );

      if (candidate) {
        let size = settings.btcMaxPosition;
        if (candidate.symbol === "ETH-USD") size = settings.ethMaxPosition;
        if (candidate.symbol === "SOL-USD") size = settings.solMaxPosition;

        const entryFee = (size * settings.simulatedFeePercent) / 100;
        const tpPrice = Number((candidate.price * (1 + settings.takeProfitPercent / 100)).toFixed(2));
        const slPrice = Number((candidate.price * (1 - settings.stopLossPercent / 100)).toFixed(2));

        const newPos: Position = {
          id: `pos-${Date.now()}`,
          userId: settings.userId,
          symbol: candidate.symbol,
          mode: settings.tradingMode,
          side: "BUY",
          status: "OPEN",
          entryPrice: candidate.price,
          quantity: Number((size / candidate.price).toFixed(6)),
          quoteAmount: size,
          takeProfitPrice: tpPrice,
          stopLossPrice: slPrice,
          entryFee,
          exitFee: 0,
          slippage: (size * settings.simulatedSlippagePercent) / 100,
          openedAt: new Date().toISOString(),
          signalId: `sig-${Date.now()}`,
        };

        setPositions((prev) => [...prev, newPos]);
        setState((st) => ({
          ...st,
          availableBalance: st.availableBalance - size,
          totalExposure: st.totalExposure + size,
        }));

        addLog(
          "INFO",
          "TRADE_OPENED",
          `Opened ${settings.tradingMode} position for ${candidate.symbol} @ $${candidate.price}. TP: $${tpPrice}, SL: $${slPrice}`
        );

        // Add to signal history
        setSignals((prev) => [
          {
            id: `sig-${Date.now()}`,
            timestamp: new Date().toISOString(),
            symbol: candidate.symbol,
            price: candidate.price,
            ema20: candidate.ema20,
            ema50: candidate.ema50,
            rsi: candidate.rsi,
            recentHigh: candidate.price * 1.03,
            pullbackPercent: candidate.pullbackPercent,
            totalScore: candidate.score,
            decision: "BUY",
            trendScore: 25,
            pullbackScore: 25,
            rsiScore: 20,
            confirmationScore: 15,
            marketScore: 10,
          },
          ...prev,
        ]);
      }
    }
  };

  // Real-time market tick loop simulation when bot is RUNNING
  useEffect(() => {
    if (!isLoaded || state.status !== "RUNNING") return;
    const interval = setInterval(() => {
      runMarketScan();
    }, 6000);
    return () => clearInterval(interval);
  }, [state.status, positions, marketAssets, settings, isLoaded]);

  return {
    settings,
    setSettings,
    state,
    setState,
    positions,
    closedTrades,
    signals,
    logs,
    marketAssets,
    isLoaded,
    startBot,
    pauseBot,
    stopBot,
    haltBot,
    emergencyStop,
    switchTradingMode,
    closePosition,
    runMarketScan,
    addLog,
  };
}
