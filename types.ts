export interface Asset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change7d?: number;
  change30d?: number;
  volume: string;
  marketCap: string;
  color: string;
  iconUrl?: string;
  history: { time: string; value: number }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  verified: boolean;
  avatarUrl: string;
  role: 'user' | 'admin';
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'deposit' | 'withdraw';
  assetSymbol?: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export enum AppScreen {
  ONBOARDING = 'ONBOARDING',
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  VERIFICATION = 'VERIFICATION',
  DASHBOARD = 'DASHBOARD',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
}

export enum DashboardTab {
  HOME = 'HOME',
  MARKET = 'MARKET',
  TRADE = 'TRADE',
  WALLET = 'WALLET',
  PROFILE = 'PROFILE',
}

export interface ChartDataPoint {
  time: string;
  value: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}