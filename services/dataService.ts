import { Asset, ChartDataPoint, Transaction } from '../types';

const BASE_ASSETS = [
  { id: '1', symbol: 'BTC', name: 'Bitcoin', price: 64230.50, color: '#f59e0b', iconUrl: 'https://assets.coincap.io/assets/icons/btc@2x.png' },
  { id: '2', symbol: 'ETH', name: 'Ethereum', price: 3450.20, color: '#6366f1', iconUrl: 'https://assets.coincap.io/assets/icons/eth@2x.png' },
  { id: '3', symbol: 'SOL', name: 'Solana', price: 145.80, color: '#14f195', iconUrl: 'https://assets.coincap.io/assets/icons/sol@2x.png' },
  { id: '4', symbol: 'DOT', name: 'Polkadot', price: 7.20, color: '#e6007a', iconUrl: 'https://assets.coincap.io/assets/icons/dot@2x.png' },
  { id: '5', symbol: 'ADA', name: 'Cardano', price: 0.45, color: '#0033ad', iconUrl: 'https://assets.coincap.io/assets/icons/ada@2x.png' },
];

export const generateHistory = (basePrice: number, points: number = 24): ChartDataPoint[] => {
  let currentPrice = basePrice;
  const history: ChartDataPoint[] = [];
  const now = new Date();

  for (let i = points; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000); // Hourly
    const volatility = basePrice * 0.02; // 2% volatility
    const change = (Math.random() - 0.5) * volatility;
    currentPrice += change;
    
    // Ensure mock candlestick data makes sense
    const open = currentPrice - (Math.random() - 0.5) * (volatility / 2);
    const close = currentPrice;
    const high = Math.max(open, close) + Math.random() * (volatility / 4);
    const low = Math.min(open, close) - Math.random() * (volatility / 4);

    history.push({
      time: time.getHours() + ':00',
      value: currentPrice,
      open,
      high,
      low,
      close
    });
  }
  return history;
};

export const getAssets = (): Asset[] => {
  return BASE_ASSETS.map(asset => {
    const change24h = (Math.random() * 10) - 4; // Random between -4% and +6%
    return {
      ...asset,
      change24h,
      volume: (Math.random() * 10 + 1).toFixed(1) + 'B',
      marketCap: (Math.random() * 500 + 10).toFixed(1) + 'B',
      history: generateHistory(asset.price, 50).map(p => ({ time: p.time, value: p.value }))
    };
  });
};

export const getTransactions = (): Transaction[] => {
  return [
    { id: 't1', type: 'buy', assetSymbol: 'BTC', amount: 0.005, date: '2023-10-24', status: 'completed' },
    { id: 't2', type: 'deposit', amount: 1000, date: '2023-10-23', status: 'completed' },
    { id: 't3', type: 'sell', assetSymbol: 'ETH', amount: 1.2, date: '2023-10-20', status: 'completed' },
  ];
};