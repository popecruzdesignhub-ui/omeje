import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, LineChart, Wallet, User, Bell, Search, 
  ArrowUpRight, ArrowDownLeft, SlidersHorizontal, ChevronRight,
  RefreshCcw, Sparkles, X, ArrowRightLeft, Star, Download,
  ChevronDown, ChevronUp, LogOut, Eye, EyeOff, Camera
} from 'lucide-react';
import { GlassCard, Button, Badge, Modal, ThemeToggle, LanguageSelector } from '../components/UI';
import { SimpleAreaChart, Sparkline } from '../components/Charts';
import { Asset, DashboardTab, AppScreen } from '../types';
import { getAssets, getTransactions } from '../services/dataService';
import { getMarketInsight } from '../services/geminiService';
import { TradingDashboard } from './TradingDashboard';
import { WalletDashboard } from './WalletScreens';
import { Language } from '../services/translations';

// --- Currency Config ---
const CURRENCIES = {
  USD: { symbol: '$', rate: 1 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.79 },
  JPY: { symbol: '¥', rate: 150.0 },
};
type CurrencyCode = keyof typeof CURRENCIES;

const CurrencySelector = ({ current, onChange }: { current: CurrencyCode; onChange: (c: CurrencyCode) => void }) => (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-200 dark:bg-white/5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/10 transition-colors">
        <span>{CURRENCIES[current].symbol}</span>
        <span>{current}</span>
      </button>
      <div className="absolute top-full right-0 mt-2 w-24 bg-white dark:bg-[#1e2329] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden hidden group-hover:block z-50">
        {(Object.keys(CURRENCIES) as CurrencyCode[]).map(c => (
          <button 
            key={c}
            onClick={() => onChange(c)}
            className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/5 transition-colors ${current === c ? 'text-amber-500' : 'text-slate-700 dark:text-slate-300'}`}
          >
            {CURRENCIES[c].symbol} {c}
          </button>
        ))}
      </div>
    </div>
);

// --- Dashboard Component ---
const DashboardHome = ({ 
  assets, 
  watchlist, 
  onViewAsset,
  onStartTrading,
  currency,
  rate
}: { 
  assets: Asset[], 
  watchlist: string[], 
  onViewAsset: (a: Asset) => void,
  onStartTrading: () => void,
  currency: { symbol: string; code: string },
  rate: number
}) => {
  const watchedAssets = assets.filter(a => watchlist.includes(a.id));
  const [showBalance, setShowBalance] = useState(true);
  
  const formatPrice = (price: number) => {
    return `${currency.symbol}${(price * rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalBalance = 42850.25 * rate;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-24">
      {/* Portfolio Card */}
      <GlassCard className="relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-500/20 blur-[80px] rounded-full pointer-events-none group-hover:bg-amber-500/30 transition-all duration-500" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Balance</p>
                <button 
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                {showBalance ? `${currency.symbol}${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "••••••••"}
              </h1>
            </div>
            <Badge value={12.5} />
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button className="flex-1" variant="primary" onClick={onStartTrading}>
              <ArrowRightLeft className="w-5 h-5" /> Trade
            </Button>
            <Button className="flex-1" variant="secondary">
              <ArrowDownLeft className="w-5 h-5" /> Deposit
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Watchlist Section */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 px-1 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> My Watchlist
        </h3>
        {watchedAssets.length === 0 ? (
          <GlassCard className="py-8 text-center border-dashed border-slate-300 dark:border-slate-700">
             <div className="mx-auto w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3">
               <Star className="w-6 h-6" />
             </div>
             <p className="text-slate-500 dark:text-slate-400 font-medium">Your watchlist is empty</p>
             <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Star assets to track them here</p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
             {watchedAssets.map(asset => (
              <GlassCard key={asset.id} className="flex items-center justify-between py-4 active:scale-[0.99] transition-transform" onClick={() => onViewAsset(asset)}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg`} style={{ backgroundColor: `${asset.color}20`, color: asset.color, boxShadow: `0 0 20px ${asset.color}10` }}>
                    {asset.symbol[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{asset.name}</h4>
                    <p className="text-xs text-slate-500">{asset.symbol}</p>
                  </div>
                </div>
                <div className="hidden sm:block w-24">
                   <Sparkline data={asset.history.slice(-10)} color={asset.color} isPositive={asset.change24h >= 0} />
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-900 dark:text-white">{formatPrice(asset.price)}</p>
                  <div className={`text-xs font-medium ${asset.change24h >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                    {asset.change24h > 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Top Movers */}
      <div>
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top Movers</h3>
          <button className="text-sm text-amber-500 font-medium hover:text-amber-400 transition-colors">See All</button>
        </div>
        <div className="space-y-3">
          {assets.slice(0, 3).map(asset => (
            <GlassCard key={asset.id} className="flex items-center justify-between py-4 active:scale-[0.99] transition-transform" onClick={() => onViewAsset(asset)}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg`} style={{ backgroundColor: `${asset.color}20`, color: asset.color, boxShadow: `0 0 20px ${asset.color}10` }}>
                  {asset.symbol[0]}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{asset.name}</h4>
                  <p className="text-xs text-slate-500">{asset.symbol}</p>
                </div>
              </div>
              <div className="hidden sm:block w-24">
                 <Sparkline data={asset.history.slice(-10)} color={asset.color} isPositive={asset.change24h >= 0} />
              </div>
              <div className="text-right">
                <p className="font-medium text-slate-900 dark:text-white">{formatPrice(asset.price)}</p>
                <div className={`text-xs font-medium ${asset.change24h >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                  {asset.change24h > 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};

const AssetDetail = ({ 
  asset, 
  isWatched, 
  onToggleWatch, 
  onBack,
  currency,
  rate
}: { 
  asset: Asset; 
  isWatched: boolean; 
  onToggleWatch: () => void; 
  onBack: () => void;
  currency: { symbol: string; code: string };
  rate: number;
}) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [timeframe, setTimeframe] = useState('1D');
  const fetchInsight = async () => { if (insight) return; setLoadingInsight(true); const text = await getMarketInsight(asset); setInsight(text); setLoadingInsight(false); };
  
  const formatPrice = (price: number) => {
    return `${currency.symbol}${(price * rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  const totalBalance = 42850.25 * rate;

  return (
    <div className="animate-in slide-in-from-right duration-300 pb-28">
      <div className="sticky top-0 z-20 bg-gray-50/80 dark:bg-[#020617]/80 backdrop-blur-md -mx-6 px-6 py-4 flex items-center justify-between mb-4 border-b border-slate-200 dark:border-white/5">
        <div className="flex items-center gap-4"><button onClick={onBack} className="p-2 rounded-full bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-white"><ChevronRight className="w-5 h-5 rotate-180" /></button><div><h2 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">{asset.name} <span className="text-xs font-normal text-slate-500 bg-slate-200 dark:bg-white/5 px-2 py-0.5 rounded-full">{asset.symbol}</span></h2></div></div>
        <div className="flex items-center gap-2">
          <button onClick={onToggleWatch} className={`p-2 rounded-full transition-all ${isWatched ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-200 dark:bg-white/5 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10'}`} title={isWatched ? "Remove from Watchlist" : "Add to Watchlist"}><Star className={`w-5 h-5 ${isWatched ? 'fill-amber-500' : ''}`} /></button>
          <button onClick={fetchInsight} className={`p-2 rounded-full transition-all ${insight ? 'bg-indigo-500/20 text-indigo-500 dark:text-indigo-400' : 'bg-slate-200 dark:bg-white/5 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-500/10'}`} title="Generate AI Insight"><Sparkles className={`w-5 h-5 ${loadingInsight ? 'animate-pulse' : ''}`} /></button>
        </div>
      </div>
      <div className="px-1">
        <div className="mb-8">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Current Price</p>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">{formatPrice(asset.price)}</h1>
            <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center gap-1">
                     <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">24h</span>
                     <Badge value={asset.change24h} />
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center gap-1">
                     <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">7d</span>
                     <Badge value={asset.change7d || ((Math.random() * 20) - 5)} />
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center gap-1">
                     <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">30d</span>
                     <Badge value={asset.change30d || ((Math.random() * 30) - 10)} />
                </div>
            </div>
        </div>
        <div className="h-64 w-full -mx-2 mb-8"><SimpleAreaChart data={asset.history} color={asset.color} height={250} /></div>
        <div className="flex justify-between bg-slate-200 dark:bg-white/5 p-1 rounded-xl mb-8">{['1H', '1D', '1W', '1M', '1Y'].map((tf) => (<button key={tf} onClick={() => setTimeframe(tf)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${timeframe === tf ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>{tf}</button>))}</div>
        {loadingInsight && (<GlassCard className="mb-6 animate-pulse border-indigo-500/20 bg-indigo-500/5"><div className="flex items-center gap-2 mb-3"><div className="w-4 h-4 bg-indigo-500/20 rounded"></div><div className="h-4 w-32 bg-indigo-500/20 rounded"></div></div><div className="space-y-2"><div className="h-3 w-full bg-indigo-500/10 rounded"></div><div className="h-3 w-5/6 bg-indigo-500/10 rounded"></div><div className="h-3 w-4/6 bg-indigo-500/10 rounded"></div></div></GlassCard>)}
        {insight && (<GlassCard className="mb-6 border-indigo-500/30 bg-indigo-500/5 relative overflow-hidden"><div className="absolute top-0 right-0 p-16 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" /><div className="relative z-10"><div className="flex items-center gap-2 mb-3 text-indigo-500 dark:text-indigo-400"><Sparkles className="w-4 h-4" /><h4 className="font-bold text-sm uppercase tracking-wider">AI Market Analysis</h4></div><p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-light">{insight}</p></div></GlassCard>)}
        <div className="grid grid-cols-2 gap-4 mb-8"><GlassCard className="p-4"><p className="text-xs text-slate-500 mb-1">Market Cap</p><p className="font-bold text-lg text-slate-900 dark:text-white">{asset.marketCap}</p></GlassCard><GlassCard className="p-4"><p className="text-xs text-slate-500 mb-1">24h Volume</p><p className="font-bold text-lg text-slate-900 dark:text-white">{asset.volume}</p></GlassCard><GlassCard className="p-4"><p className="text-xs text-slate-500 mb-1">All Time High</p><p className="font-bold text-lg text-slate-900 dark:text-white">{formatPrice(69000)}</p></GlassCard><GlassCard className="p-4"><p className="text-xs text-slate-500 mb-1">Circulating Supply</p><p className="font-bold text-lg text-slate-900 dark:text-white">19.5M</p></GlassCard></div>
      </div>
      <div className="fixed bottom-0 left-0 w-full p-6 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 flex gap-4 z-40"><Button variant="danger" className="flex-1" onClick={() => { setTradeType('sell'); setTradeModalOpen(true); }}>Sell</Button><Button variant="primary" className="flex-1" onClick={() => { setTradeType('buy'); setTradeModalOpen(true); }}>Buy</Button></div>
      <Modal isOpen={tradeModalOpen} onClose={() => setTradeModalOpen(false)} title={`${tradeType === 'buy' ? 'Buy' : 'Sell'} ${asset.symbol}`}><div className="space-y-8 py-4"><div className="text-center space-y-2"><p className="text-slate-500 dark:text-slate-400 text-sm">Enter Amount ({currency.code})</p><div className="flex items-center justify-center gap-1 relative"><span className="text-3xl text-slate-400 dark:text-slate-600 font-light">{currency.symbol}</span><input type="number" className="bg-transparent text-5xl font-bold text-slate-900 dark:text-white text-center w-48 focus:outline-none placeholder-slate-300 dark:placeholder-slate-700" placeholder="0" autoFocus /></div><p className="text-xs text-slate-500">Available Balance: {currency.symbol}{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div><div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 space-y-3"><div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Price</span><span className="font-medium text-slate-900 dark:text-white">{formatPrice(asset.price)}</span></div><div className="w-full h-px bg-slate-200 dark:bg-white/5" /><div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Est. Receive</span><span className="font-medium text-slate-900 dark:text-white">0.00 {asset.symbol}</span></div><div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Fee (0%)</span><span className="font-medium text-emerald-500 dark:text-emerald-400">FREE</span></div></div><Button onClick={() => { setTradeModalOpen(false); }} variant={tradeType === 'buy' ? 'primary' : 'danger'}>Confirm {tradeType === 'buy' ? 'Buy' : 'Sell'}</Button></div></Modal>
    </div>
  );
};

const MarketList = ({ 
  assets, 
  watchlist, 
  toggleWatchlist, 
  onViewAsset,
  currency,
  rate
}: { 
  assets: Asset[], 
  watchlist: string[], 
  toggleWatchlist: (id: string) => void, 
  onViewAsset: (a: Asset) => void,
  currency: { symbol: string; code: string },
  rate: number
}) => {
    const formatPrice = (price: number) => {
      return `${currency.symbol}${(price * rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="animate-in fade-in duration-500 pb-24">
            <h2 className="text-2xl font-bold mb-6 px-1 text-slate-900 dark:text-white">Market</h2>
            <div className="mb-6 relative px-1"><Search className="absolute left-5 top-3.5 w-5 h-5 text-slate-500" /><input type="text" placeholder="Search assets..." className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-slate-900 dark:text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-600"/></div>
            <div className="space-y-2">
                <div className="grid grid-cols-12 text-xs font-medium text-slate-500 px-4 pb-2"><span className="col-span-1"></span><span className="col-span-5">Asset</span><span className="col-span-3 text-right">Price</span><span className="col-span-3 text-right">24h</span></div>
                {assets.map(asset => { const isWatched = watchlist.includes(asset.id); return (<div key={asset.id} onClick={() => onViewAsset(asset)} className="grid grid-cols-12 items-center p-4 hover:bg-slate-5 dark:hover:bg-white/5 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-white/5 active:scale-[0.99] group"><div className="col-span-1" onClick={(e) => { e.stopPropagation(); toggleWatchlist(asset.id); }}><Star className={`w-4 h-4 transition-colors ${isWatched ? 'text-amber-500 fill-amber-500' : 'text-slate-400 group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-400'}`} /></div><div className="col-span-5 flex items-center gap-3"><div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{backgroundColor: `${asset.color}20`, color: asset.color}}>{asset.symbol[0]}</div><div><p className="font-bold text-slate-900 dark:text-white text-sm">{asset.symbol}</p><p className="text-xs text-slate-500 truncate hidden sm:block">{asset.name}</p></div></div><div className="col-span-3 text-right font-medium text-sm text-slate-900 dark:text-white">{formatPrice(asset.price)}</div><div className="col-span-3 flex justify-end"><Badge value={asset.change24h} /></div></div>); })}
            </div>
        </div>
    );
};

export const MainApp: React.FC<{ 
    setScreen: (screen: AppScreen) => void;
    isDark: boolean;
    toggleTheme: () => void;
    lang: Language;
    setLang: (l: Language) => void;
}> = ({ setScreen, isDark, toggleTheme, lang, setLang }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>(DashboardTab.HOME);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Watchlist State with persistence
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('watchlist');
      return saved ? JSON.parse(saved) : ['1', '2']; 
    } catch (e) {
      return ['1', '2'];
    }
  });

  const currencyData = CURRENCIES[currency];

  useEffect(() => {
    setAssets(getAssets());
  }, []);

  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const toggleWatchlist = (id: string) => {
    setWatchlist(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderContent = () => {
    if (selectedAsset) {
      return (
        <AssetDetail 
          asset={selectedAsset} 
          isWatched={watchlist.includes(selectedAsset.id)}
          onToggleWatch={() => toggleWatchlist(selectedAsset.id)}
          onBack={() => setSelectedAsset(null)} 
          currency={{ symbol: currencyData.symbol, code: currency }}
          rate={currencyData.rate}
        />
      );
    }

    if (activeTab === DashboardTab.TRADE) {
        // Return null here because we handle the full screen takeover below
        return null;
    }

    switch (activeTab) {
      case DashboardTab.HOME:
        return (
          <DashboardHome 
            assets={assets} 
            watchlist={watchlist} 
            onViewAsset={handleAssetClick} 
            onStartTrading={() => setActiveTab(DashboardTab.TRADE)} 
            currency={{ symbol: currencyData.symbol, code: currency }}
            rate={currencyData.rate}
          />
        );
      case DashboardTab.MARKET:
        return (
          <MarketList 
            assets={assets} 
            watchlist={watchlist} 
            toggleWatchlist={toggleWatchlist} 
            onViewAsset={handleAssetClick} 
            currency={{ symbol: currencyData.symbol, code: currency }}
            rate={currencyData.rate}
          />
        );
      case DashboardTab.WALLET:
        return <WalletDashboard currency={currencyData.symbol} rate={currencyData.rate} />;
      case DashboardTab.PROFILE:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 animate-in fade-in">
             <div className="relative mb-6 group">
                <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center overflow-hidden border-2 border-slate-200 dark:border-white/10">
                   {avatar ? (
                     <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                     <User className="w-10 h-10 text-slate-500 dark:text-slate-600" />
                   )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-amber-500 rounded-full text-white shadow-lg hover:bg-amber-600 transition-colors"
                  title="Change Avatar"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  capture="user"
                  onChange={handleAvatarChange}
                />
             </div>
             <h3 className="text-xl font-bold text-slate-900 dark:text-white">John Doe</h3>
             <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto mb-4">john.doe@example.com</p>
             <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto">Manage your personal information and settings.</p>
             <Button className="mt-6 w-auto" variant="secondary" onClick={() => setScreen(AppScreen.SIGN_IN)}>
                Log Out
             </Button>
          </div>
        );
      default:
        return (
          <DashboardHome 
            assets={assets} 
            watchlist={watchlist} 
            onViewAsset={handleAssetClick} 
            onStartTrading={() => setActiveTab(DashboardTab.TRADE)} 
            currency={{ symbol: currencyData.symbol, code: currency }}
            rate={currencyData.rate}
          />
        );
    }
  };

  // Full Screen Takeover for Trading Dashboard
  if (activeTab === DashboardTab.TRADE && !selectedAsset) {
     return <TradingDashboard setScreen={(s) => { 
        if(s === AppScreen.DASHBOARD) setActiveTab(DashboardTab.HOME); 
        else setScreen(s);
     }} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020617] text-slate-900 dark:text-white transition-colors duration-300">
      {/* Top Bar - Only show if not in Trade view (Trade view has its own header) */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 px-6 py-4 flex justify-between items-center transition-colors">
        <button 
          onClick={() => setActiveTab(DashboardTab.PROFILE)}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left"
        >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-black font-bold text-sm shadow-lg shadow-orange-500/20 overflow-hidden">
                {avatar ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" /> : "JD"}
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Welcome back</p>
              <span className="font-bold text-sm text-slate-900 dark:text-white">John Doe</span>
            </div>
        </button>
        <div className="flex gap-3 items-center">
             <CurrencySelector current={currency} onChange={setCurrency} />
             <LanguageSelector current={lang} onChange={setLang} />
             <ThemeToggle isDark={isDark} toggle={toggleTheme} />
             <button className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/5 transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <Search className="w-5 h-5" />
             </button>
             <button className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/5 transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
             </button>
             <button 
                onClick={() => setActiveTab(DashboardTab.PROFILE)}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/5 transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                title="Profile"
             >
                <User className="w-5 h-5" />
             </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="p-4 max-w-lg mx-auto md:max-w-4xl min-h-screen">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      {!selectedAsset && (
        <div className="fixed bottom-0 left-0 w-full bg-white/90 dark:bg-[#020617]/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 z-40 pb-safe transition-colors">
            <div className="flex justify-around items-center p-2 max-w-lg mx-auto md:max-w-4xl">
                {[
                    { id: DashboardTab.HOME, icon: LayoutDashboard, label: 'Home' },
                    { id: DashboardTab.MARKET, icon: LineChart, label: 'Market' },
                    { id: DashboardTab.TRADE, icon: ArrowRightLeft, label: 'Trade', highlight: true },
                    { id: DashboardTab.WALLET, icon: Wallet, label: 'Wallet' },
                    { id: DashboardTab.PROFILE, icon: User, label: 'Profile' },
                ].map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;
                    
                    if (item.highlight) {
                        return (
                            <button 
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className="relative -top-6 bg-gradient-to-b from-amber-400 to-orange-600 p-4 rounded-full shadow-lg shadow-orange-500/30 border-4 border-gray-50 dark:border-[#020617] hover:scale-105 transition-transform"
                            >
                                <Icon className="w-6 h-6 text-black" />
                            </button>
                        )
                    }

                    return (
                        <button 
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        >
                            <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    )
                })}
            </div>
        </div>
      )}
    </div>
  );
};