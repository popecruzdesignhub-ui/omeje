import { Asset, ChartDataPoint, Transaction, TransferAccount } from '../types';

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

// --- Transfer Accounts Management ---

let MOCK_TRANSFER_ACCOUNTS: TransferAccount[] = [
  { id: '1', country: 'Peru', bankName: 'Banco de Crédito del Perú (BCP)', accountNumber: '191-12345678-0-01', swiftCode: 'BCPPLIMA', currency: 'PEN', status: 'Active' },
  { id: '2', country: 'Peru', bankName: 'Interbank', accountNumber: '200-3001234567', swiftCode: 'INTERLIM', currency: 'USD', status: 'Active' },
  { id: '3', country: 'USA', bankName: 'Chase Bank', accountNumber: '987654321', swiftCode: 'CHASUS33', currency: 'USD', status: 'Active' },
  { id: '4', country: 'Spain', bankName: 'Santander', accountNumber: 'ES21 0049 0000 1234 5678', swiftCode: 'BSCHESMM', currency: 'EUR', status: 'Active' },
  { id: '5', country: 'Japan', bankName: 'Mitsubishi UFJ', accountNumber: '0001-123-4567890', swiftCode: 'BOTKJPJT', currency: 'JPY', status: 'Active' },
];

export const getTransferAccounts = (query?: string): TransferAccount[] => {
  if (!query) return MOCK_TRANSFER_ACCOUNTS;
  const lowerQ = query.toLowerCase();
  return MOCK_TRANSFER_ACCOUNTS.filter(a => 
    a.country.toLowerCase().includes(lowerQ) || 
    a.bankName.toLowerCase().includes(lowerQ)
  );
};

export const addTransferAccount = (account: Omit<TransferAccount, 'id'>) => {
  const newAccount = { ...account, id: Math.random().toString(36).substr(2, 9) };
  MOCK_TRANSFER_ACCOUNTS.push(newAccount);
  return newAccount;
};

export const updateTransferAccount = (id: string, updates: Partial<TransferAccount>) => {
  MOCK_TRANSFER_ACCOUNTS = MOCK_TRANSFER_ACCOUNTS.map(a => a.id === id ? { ...a, ...updates } : a);
};

export const deleteTransferAccount = (id: string) => {
  MOCK_TRANSFER_ACCOUNTS = MOCK_TRANSFER_ACCOUNTS.filter(a => a.id !== id);
};
