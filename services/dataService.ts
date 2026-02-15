import { Asset, ChartDataPoint, Transaction, GlobalAccount, ChatMessage } from '../types';

const BASE_ASSETS = [
  { id: '1', symbol: 'BTC', name: 'Bitcoin', price: 64230.50, color: '#f59e0b', iconUrl: 'https://assets.coincap.io/assets/icons/btc@2x.png' },
  { id: '2', symbol: 'ETH', name: 'Ethereum', price: 3450.20, color: '#6366f1', iconUrl: 'https://assets.coincap.io/assets/icons/eth@2x.png' },
  { id: '3', symbol: 'SOL', name: 'Solana', price: 145.80, color: '#14f195', iconUrl: 'https://assets.coincap.io/assets/icons/sol@2x.png' },
  { id: '4', symbol: 'DOT', name: 'Polkadot', price: 7.20, color: '#e6007a', iconUrl: 'https://assets.coincap.io/assets/icons/dot@2x.png' },
  { id: '5', symbol: 'ADA', name: 'Cardano', price: 0.45, color: '#0033ad', iconUrl: 'https://assets.coincap.io/assets/icons/ada@2x.png' },
];

const INITIAL_GLOBAL_ACCOUNTS: GlobalAccount[] = [
    { id: 1, country: 'United States', bankName: 'Chase Bank', accountHolder: 'Psychology Trade LLC', accountNumber: '987654321', swift: 'CHASUS33', currency: 'USD', address: '270 Park Ave, New York, NY 10017' },
    { id: 2, country: 'Europe (SEPA)', bankName: 'Deutsche Bank', accountHolder: 'Psychology Trade GmbH', accountNumber: 'DE45 1007 0024 0567 8901 00', swift: 'DEUTDEFF', currency: 'EUR', address: 'Taunusanlage 12, 60325 Frankfurt' },
    { id: 3, country: 'United Kingdom', bankName: 'Barclays', accountHolder: 'Psychology Trade Ltd', accountNumber: '20-45-67 88997766', swift: 'BARCGB22', currency: 'GBP', address: '1 Churchill Place, London E14 5HP' },
    { id: 4, country: 'Mexico', bankName: 'BBVA Bancomer', accountHolder: 'Psychology Trade MX', accountNumber: '012 180 00195555555 1', swift: 'BCMRMXMM', currency: 'MXN', address: 'Av. Paseo de la Reforma 510, CDMX' },
    { id: 5, country: 'Peru', bankName: 'BCP', accountHolder: 'Psychology Trade Peru SAC', accountNumber: '193-1234567-0-99', swift: 'BCPLPLL', currency: 'PEN', address: 'Centenario 156, La Molina, Lima' },
    { id: 6, country: 'Spain', bankName: 'Santander', accountHolder: 'Psychology Trade ES', accountNumber: 'ES91 2100 0418 45 1234567890', swift: 'BSCHESMM', currency: 'EUR', address: 'Av. de Cantabria, s/n, 28660 Boadilla del Monte, Madrid' },
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
    const change7d = (Math.random() * 20) - 8;  // Random between -8% and +12%
    const change30d = (Math.random() * 40) - 15; // Random between -15% and +25%
    
    return {
      ...asset,
      change24h,
      change7d,
      change30d,
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

export const getGlobalAccounts = (): GlobalAccount[] => {
  try {
    const stored = localStorage.getItem('global_accounts');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to parse global accounts", e);
  }
  // Initialize defaults
  localStorage.setItem('global_accounts', JSON.stringify(INITIAL_GLOBAL_ACCOUNTS));
  return INITIAL_GLOBAL_ACCOUNTS;
};

export const saveGlobalAccounts = (accounts: GlobalAccount[]) => {
  localStorage.setItem('global_accounts', JSON.stringify(accounts));
};

// --- Chat Persistence for Admin-User Interaction ---

export const getChatHistory = (): ChatMessage[] => {
  try {
    const stored = localStorage.getItem('support_chat_history');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export const saveChatHistory = (messages: ChatMessage[]) => {
  localStorage.setItem('support_chat_history', JSON.stringify(messages));
  // Dispatch event for cross-component updates
  window.dispatchEvent(new Event('chat_updated'));
};