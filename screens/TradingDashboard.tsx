import React, { useState, useEffect } from 'react';
import { 
  Bell, Search, User, LogOut, ChevronDown, 
  ArrowUp, ArrowDown, Settings, Clock, 
  BarChart2, List, Activity, Layers
} from 'lucide-react';
import { GlassCard, Button, Input, Badge, Logo } from '../components/UI';
import { TradingViewWidget } from '../components/Charts';
import { AppScreen, Asset, Transaction, ChartDataPoint } from '../types';
import { getAssets, generateHistory } from '../services/dataService';

export const TradingDashboard: React.FC<{ setScreen: (s: AppScreen) => void }> = ({ setScreen }) => {
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'limit' | 'market' | 'stop'>('limit');
  const [price, setPrice] = useState('64230.50');
  const [amount, setAmount] = useState('');
  const [sliderVal, setSliderVal] = useState(0);
  
  // Mock Data
  const assets = getAssets();
  const activeAsset = assets.find(a => a.symbol === selectedPair.split('/')[0]) || assets[0];
  
  // Real-time Simulation State (for Header/OrderBook only)
  const [currentPrice, setCurrentPrice] = useState(activeAsset.price);
  const [priceChange, setPriceChange] = useState(activeAsset.change24h);

  // Initialize data on asset change
  useEffect(() => {
    setCurrentPrice(activeAsset.price);
    setPriceChange(activeAsset.change24h);
    setPrice(activeAsset.price.toFixed(2));
  }, [activeAsset]);

  // Simulate Real-time Data for header and orderbook
  useEffect(() => {
    const interval = setInterval(() => {
        // Simulate Volatility
        const volatility = currentPrice * 0.0005; 
        const change = (Math.random() - 0.5) * volatility;
        const newPrice = currentPrice + change;
        
        setCurrentPrice(newPrice);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPrice]);

  // Mock Order Book
  const asks = Array.from({length: 12}, (_, i) => ({ 
    price: (currentPrice + (i * 5) + Math.random() * 2).toFixed(2), 
    amount: (Math.random() * 2).toFixed(4), 
    total: (Math.random() * 10000).toFixed(2)
  })).reverse();
  
  const bids = Array.from({length: 12}, (_, i) => ({ 
    price: (currentPrice - (i * 5) - Math.random() * 2).toFixed(2), 
    amount: (Math.random() * 2).toFixed(4), 
    total: (Math.random() * 10000).toFixed(2)
  }));

  const handleLogoClick = () => {
    // Navigate back to the main dashboard (Home)
    setScreen(AppScreen.DASHBOARD);
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#EAECEF] font-sans flex flex-col">
      {/* 1. Top Navigation */}
      <header className="h-14 bg-[#181a20] border-b border-[#2b3139] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={handleLogoClick}>
            <Logo className="w-8 h-8 group-hover:scale-105 transition-transform" />
            <span className="font-bold text-lg tracking-tight hidden sm:block">Psychology Trade</span>
          </div>
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-[#848e9c]">
            <a href="#" className="text-[#EAECEF] hover:text-amber-500 transition-colors">Markets</a>
            <a href="#" className="hover:text-[#EAECEF] transition-colors">Spot</a>
            <a href="#" className="hover:text-[#EAECEF] transition-colors">Futures</a>
            <a href="#" className="hover:text-[#EAECEF] transition-colors">Wallet</a>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-xs font-medium">
             <div className="flex flex-col items-end">
                <span className="text-[#EAECEF]">BTC/USDT</span>
                <span className="text-emerald-500">${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
             </div>
             <div className="flex flex-col items-end">
                <span className="text-[#848e9c]">24h Change</span>
                <span className={priceChange >= 0 ? "text-emerald-500" : "text-rose-500"}>
                    {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </span>
             </div>
          </div>
          <div className="h-6 w-px bg-[#2b3139] mx-2 hidden sm:block"></div>
          <button className="p-2 hover:bg-[#2b3139] rounded-full text-[#848e9c] hover:text-[#EAECEF]"><Bell className="w-5 h-5" /></button>
          <div className="w-8 h-8 rounded-full bg-[#2b3139] flex items-center justify-center text-xs font-bold text-[#EAECEF]">JD</div>
          <button onClick={() => setScreen(AppScreen.SIGN_IN)} className="text-[#848e9c] hover:text-[#EAECEF]"><LogOut className="w-5 h-5" /></button>
        </div>
      </header>

      {/* 2. Main Layout Grid */}
      <main className="flex-1 p-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-1">
        
        {/* Left Panel: Trading Form (3 cols) */}
        <div className="lg:col-span-3 bg-[#1e2329] rounded-sm flex flex-col border border-[#2b3139]">
           <div className="flex border-b border-[#2b3139]">
              <button 
                onClick={() => setSide('buy')} 
                className={`flex-1 py-3 text-sm font-bold transition-colors ${side === 'buy' ? 'bg-[#0ECB81] text-white' : 'text-[#848e9c] hover:text-[#EAECEF] hover:bg-[#2b3139]'}`}
              >
                Buy
              </button>
              <button 
                onClick={() => setSide('sell')} 
                className={`flex-1 py-3 text-sm font-bold transition-colors ${side === 'sell' ? 'bg-[#F6465D] text-white' : 'text-[#848e9c] hover:text-[#EAECEF] hover:bg-[#2b3139]'}`}
              >
                Sell
              </button>
           </div>
           
           <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="flex gap-2 text-xs font-medium mb-2">
                 {['Limit', 'Market', 'Stop-Limit'].map(type => (
                    <button 
                        key={type}
                        onClick={() => setOrderType(type.toLowerCase().split('-')[0] as any)}
                        className={`px-3 py-1 rounded-full ${orderType === type.toLowerCase().split('-')[0] ? 'bg-[#2b3139] text-[#FCD535]' : 'text-[#848e9c] hover:text-[#EAECEF]'}`}
                    >
                        {type}
                    </button>
                 ))}
              </div>

              <div className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-xs text-[#848e9c]">Avail. Balance</label>
                    <div className="text-sm font-medium text-[#EAECEF]">42,850.25 USDT</div>
                 </div>

                 <div className="bg-[#2b3139] rounded-lg p-2 flex items-center justify-between border border-transparent focus-within:border-[#FCD535] transition-colors">
                    <span className="text-xs text-[#848e9c] uppercase px-2 w-16">Price</span>
                    <input 
                        type="text" 
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="bg-transparent text-right w-full text-sm font-medium text-[#EAECEF] focus:outline-none" 
                    />
                    <span className="text-xs text-[#EAECEF] px-2">USDT</span>
                 </div>

                 <div className="bg-[#2b3139] rounded-lg p-2 flex items-center justify-between border border-transparent focus-within:border-[#FCD535] transition-colors">
                    <span className="text-xs text-[#848e9c] uppercase px-2 w-16">Amount</span>
                    <input 
                        type="text" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Min 10"
                        className="bg-transparent text-right w-full text-sm font-medium text-[#EAECEF] focus:outline-none" 
                    />
                    <span className="text-xs text-[#EAECEF] px-2">BTC</span>
                 </div>

                 {/* Percentage Slider */}
                 <div className="px-1">
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="25"
                        value={sliderVal}
                        onChange={(e) => setSliderVal(Number(e.target.value))}
                        className="w-full h-1 bg-[#474d57] rounded-lg appearance-none cursor-pointer accent-[#FCD535]"
                    />
                    <div className="flex justify-between text-[10px] text-[#848e9c] mt-1">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                    </div>
                 </div>

                 <div className="bg-[#2b3139] rounded-lg p-2 flex items-center justify-between">
                    <span className="text-xs text-[#848e9c] uppercase px-2 w-16">Total</span>
                    <span className="text-sm font-medium text-[#EAECEF] text-right w-full px-2">
                        {amount && price ? (Number(amount) * Number(price)).toLocaleString() : '0.00'}
                    </span>
                    <span className="text-xs text-[#EAECEF] px-2">USDT</span>
                 </div>

                 <button className={`w-full py-3 rounded-lg font-bold text-base transition-transform active:scale-[0.99] ${side === 'buy' ? 'bg-[#0ECB81] hover:bg-[#0ECB81]/90 text-white' : 'bg-[#F6465D] hover:bg-[#F6465D]/90 text-white'}`}>
                    {side === 'buy' ? 'Buy BTC' : 'Sell BTC'}
                 </button>
              </div>

              {/* Mini Portfolio */}
              <div className="mt-8 pt-6 border-t border-[#2b3139]">
                 <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#EAECEF]">Your Assets</span>
                    <Settings className="w-3 h-3 text-[#848e9c]" />
                 </div>
                 <div className="space-y-2">
                    {assets.slice(0,3).map(asset => (
                        <div key={asset.id} className="flex justify-between items-center text-xs">
                            <span className="text-[#848e9c]">{asset.symbol}</span>
                            <span className="text-[#EAECEF] font-mono">{Math.random().toFixed(4)}</span>
                        </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Center Panel: Chart (6 cols) */}
        <div className="lg:col-span-6 bg-[#1e2329] rounded-sm border border-[#2b3139] flex flex-col relative overflow-hidden">
           {/* Chart Header removed as TV widget has its own */}
           
           {/* Chart Area */}
           <div className="flex-1 w-full h-full bg-[#161a1e] relative">
              <TradingViewWidget 
                  symbol={`BINANCE:${selectedPair.replace('/', '')}`} 
                  theme="dark" 
                  height="100%"
              />
           </div>
        </div>

        {/* Right Panel: Order Book (3 cols) */}
        <div className="lg:col-span-3 bg-[#1e2329] rounded-sm border border-[#2b3139] flex flex-col">
           <div className="flex items-center justify-between p-3 border-b border-[#2b3139]">
              <h3 className="text-xs font-bold text-[#EAECEF]">Order Book</h3>
              <div className="flex gap-2">
                 <button className="p-1 hover:bg-[#2b3139] rounded"><Layers className="w-3 h-3 text-[#848e9c]" /></button>
              </div>
           </div>
           
           <div className="flex-1 overflow-hidden flex flex-col">
              <div className="grid grid-cols-3 px-3 py-2 text-[10px] text-[#848e9c] font-medium">
                 <span>Price(USDT)</span>
                 <span className="text-right">Amount(BTC)</span>
                 <span className="text-right">Total</span>
              </div>
              
              {/* Asks (Sell Orders) - Red */}
              <div className="flex-1 overflow-hidden relative">
                 {asks.map((ask, i) => (
                    <div key={i} className="grid grid-cols-3 px-3 py-0.5 text-xs relative hover:bg-[#2b3139] cursor-pointer group">
                       <span className="text-[#F6465D] font-mono z-10 relative">{ask.price}</span>
                       <span className="text-[#EAECEF] text-right font-mono z-10 relative group-hover:text-white opacity-80">{ask.amount}</span>
                       <span className="text-[#EAECEF] text-right font-mono z-10 relative opacity-60">{ask.total}</span>
                       {/* Depth Bar */}
                       <div className="absolute top-0 right-0 h-full bg-[#F6465D]/10 z-0" style={{width: `${Math.random() * 80}%`}} />
                    </div>
                 ))}
              </div>

              {/* Current Price */}
              <div className="py-2 px-4 flex items-center gap-2 border-y border-[#2b3139] bg-[#161a1e]">
                 <span className={`text-lg font-bold ${priceChange >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                    {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                 </span>
                 {priceChange >= 0 ? <ArrowUp className="w-4 h-4 text-[#0ECB81]" /> : <ArrowDown className="w-4 h-4 text-[#F6465D]" />}
                 <span className="text-xs text-[#848e9c]">${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              {/* Bids (Buy Orders) - Green */}
              <div className="flex-1 overflow-hidden relative">
                 {bids.map((bid, i) => (
                    <div key={i} className="grid grid-cols-3 px-3 py-0.5 text-xs relative hover:bg-[#2b3139] cursor-pointer group">
                       <span className="text-[#0ECB81] font-mono z-10 relative">{bid.price}</span>
                       <span className="text-[#EAECEF] text-right font-mono z-10 relative group-hover:text-white opacity-80">{bid.amount}</span>
                       <span className="text-[#EAECEF] text-right font-mono z-10 relative opacity-60">{bid.total}</span>
                       {/* Depth Bar */}
                       <div className="absolute top-0 right-0 h-full bg-[#0ECB81]/10 z-0" style={{width: `${Math.random() * 80}%`}} />
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* 3. Bottom Panel: Orders & History (Full Width) */}
        <div className="lg:col-span-12 bg-[#1e2329] rounded-sm border border-[#2b3139] flex flex-col min-h-[200px]">
           <div className="flex items-center gap-6 px-4 border-b border-[#2b3139]">
              {['Open Orders (2)', 'Order History', 'Trade History', 'Funds'].map((tab, i) => (
                 <button key={tab} className={`py-3 text-xs font-bold border-b-2 transition-colors ${i === 0 ? 'border-[#FCD535] text-[#FCD535]' : 'border-transparent text-[#848e9c] hover:text-[#EAECEF]'}`}>
                    {tab}
                 </button>
              ))}
           </div>
           
           <div className="p-4 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="text-xs text-[#848e9c]">
                       <th className="pb-2 font-medium">Time</th>
                       <th className="pb-2 font-medium">Pair</th>
                       <th className="pb-2 font-medium">Type</th>
                       <th className="pb-2 font-medium">Side</th>
                       <th className="pb-2 font-medium text-right">Price</th>
                       <th className="pb-2 font-medium text-right">Amount</th>
                       <th className="pb-2 font-medium text-right">Filled</th>
                       <th className="pb-2 font-medium text-right">Total</th>
                       <th className="pb-2 font-medium text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="text-xs text-[#EAECEF]">
                    <tr className="border-b border-[#2b3139]/50 hover:bg-[#2b3139]/50">
                       <td className="py-2">{new Date().toLocaleDateString()} 14:20:05</td>
                       <td className="py-2">BTC/USDT</td>
                       <td className="py-2">Limit</td>
                       <td className="py-2 text-[#0ECB81]">Buy</td>
                       <td className="py-2 text-right">62,500.00</td>
                       <td className="py-2 text-right">0.1500</td>
                       <td className="py-2 text-right">0.00%</td>
                       <td className="py-2 text-right">9,375.00</td>
                       <td className="py-2 text-right text-[#FCD535] cursor-pointer hover:underline">Cancel</td>
                    </tr>
                    <tr className="border-b border-[#2b3139]/50 hover:bg-[#2b3139]/50">
                       <td className="py-2">{new Date().toLocaleDateString()} 12:15:30</td>
                       <td className="py-2">ETH/USDT</td>
                       <td className="py-2">Stop-Limit</td>
                       <td className="py-2 text-[#F6465D]">Sell</td>
                       <td className="py-2 text-right">3,500.00</td>
                       <td className="py-2 text-right">2.5000</td>
                       <td className="py-2 text-right">0.00%</td>
                       <td className="py-2 text-right">8,750.00</td>
                       <td className="py-2 text-right text-[#FCD535] cursor-pointer hover:underline">Cancel</td>
                    </tr>
                 </tbody>
              </table>
              <div className="mt-8 text-center text-xs text-[#848e9c]">
                 No more active orders
              </div>
           </div>
        </div>

      </main>
    </div>
  );
};