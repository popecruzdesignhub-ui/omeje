import React, { useState, useEffect } from 'react';
import { 
  ArrowDownLeft, ArrowUpRight, History, 
  Copy, Check, ChevronDown, QrCode,
  AlertCircle, ChevronLeft,
  Share2, FileText, ArrowRightLeft,
  Landmark, Globe, Building2, Wallet, Search
} from 'lucide-react';
import { GlassCard, Button, Input } from '../components/UI';
import { Asset, GlobalAccount } from '../types';
import { getAssets, getTransactions, getGlobalAccounts } from '../services/dataService';

// --- Components ---

const AssetSelector = ({ assets, selectedId, onSelect }: { assets: Asset[], selectedId: string, onSelect: (id: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selected = assets.find(a => a.id === selectedId) || assets[0];

    return (
        <div className="relative z-20">
            <label className="text-sm text-slate-500 dark:text-slate-400 mb-1 block">Select Asset</label>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl p-3 flex items-center justify-between text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    {selected.iconUrl ? (
                         <img src={selected.iconUrl} alt={selected.symbol} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/5 object-cover" />
                    ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{backgroundColor: `${selected.color}20`, color: selected.color}}>
                            {selected.symbol[0]}
                        </div>
                    )}
                    <div className="text-left">
                        <p className="font-bold text-sm">{selected.symbol}</p>
                        <p className="text-xs text-slate-500">{selected.name}</p>
                    </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>
            
            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                    {assets.map(asset => (
                        <button 
                            key={asset.id}
                            onClick={() => { onSelect(asset.id); setIsOpen(false); }}
                            className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left"
                        >
                             {asset.iconUrl ? (
                                <img src={asset.iconUrl} alt={asset.symbol} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/5 object-cover" />
                            ) : (
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{backgroundColor: `${asset.color}20`, color: asset.color}}>
                                    {asset.symbol[0]}
                                </div>
                            )}
                            <div>
                                <p className="font-bold text-sm text-slate-900 dark:text-white">{asset.symbol}</p>
                                <p className="text-xs text-slate-500">{asset.name}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const NetworkSelector = ({ networks, selected, onSelect }: { networks: string[], selected: string, onSelect: (n: string) => void }) => (
    <div className="space-y-2">
        <label className="text-sm text-slate-500 dark:text-slate-400">Select Network</label>
        <div className="grid grid-cols-2 gap-2">
            {networks.map(net => (
                <button 
                    key={net}
                    onClick={() => onSelect(net)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${selected === net ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'}`}
                >
                    {net}
                </button>
            ))}
        </div>
    </div>
);

// Define user's portfolio holdings for consistent calculation
const PORTFOLIO_HOLDINGS: Record<string, number> = {
    'BTC': 0.45,
    'ETH': 3.2,
    'SOL': 45.5,
    'DOT': 150,
    'ADA': 5000
};

const WalletOverview = ({ 
    assets, 
    onNavigate, 
    currency, 
    rate 
}: { 
    assets: Asset[], 
    onNavigate: (view: string) => void,
    currency: string,
    rate: number
}) => {
    // Manage local state for assets to simulate real-time price updates
    const [liveAssets, setLiveAssets] = useState(assets);

    // Simulate real-time market fluctuations
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveAssets(prevAssets => prevAssets.map(asset => ({
                ...asset,
                price: asset.price * (1 + (Math.random() - 0.5) * 0.004) // +/- 0.2% fluctuation
            })));
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    // Calculate total balance based on live prices and holdings
    const totalBalanceVal = liveAssets.reduce((acc, asset) => {
        const quantity = PORTFOLIO_HOLDINGS[asset.symbol] || 0;
        return acc + (asset.price * quantity);
    }, 0);

    const totalBalance = totalBalanceVal * rate;
    
    // Calculate BTC equivalent
    const btcPrice = liveAssets.find(a => a.symbol === 'BTC')?.price || 1;
    const btcEquivalent = totalBalanceVal / btcPrice;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
             {/* Total Balance Card */}
            <GlassCard className="relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
                <div className="relative z-10 text-center py-6">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Total Estimated Value</p>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">{currency}{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>
                    <p className="text-sm text-slate-500">≈ {btcEquivalent.toFixed(4)} BTC</p>
                
                    <div className="flex gap-4 mt-8 justify-center">
                        <button onClick={() => onNavigate('transfer')} className="flex flex-col items-center gap-2 group">
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform border border-blue-500/20">
                                <ArrowRightLeft className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-300">Transfer</span>
                        </button>
                        <button onClick={() => onNavigate('deposit')} className="flex flex-col items-center gap-2 group">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform border border-emerald-500/20">
                                <ArrowDownLeft className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-300">Deposit</span>
                        </button>
                        <button onClick={() => onNavigate('withdraw')} className="flex flex-col items-center gap-2 group">
                            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-white flex items-center justify-center group-hover:scale-110 transition-transform border border-slate-300 dark:border-white/10">
                                <ArrowUpRight className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-300">Withdraw</span>
                        </button>
                        <button onClick={() => onNavigate('history')} className="flex flex-col items-center gap-2 group">
                            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-white flex items-center justify-center group-hover:scale-110 transition-transform border border-slate-300 dark:border-white/10">
                                <History className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-300">History</span>
                        </button>
                    </div>
                </div>
            </GlassCard>

            {/* Asset List */}
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 px-1">Spot Assets</h3>
                <div className="space-y-3">
                    {liveAssets.map(asset => {
                        const quantity = PORTFOLIO_HOLDINGS[asset.symbol] || 0;
                        const value = asset.price * quantity * rate;
                        
                        return (
                            <div key={asset.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg`} style={{ backgroundColor: `${asset.color}20`, color: asset.color }}>
                                        {asset.symbol[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">{asset.symbol}</h4>
                                        <p className="text-xs text-slate-500">{asset.name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-slate-900 dark:text-white">{quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</p>
                                    <p className="text-xs text-slate-500">{currency}{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}

const DepositView = ({ assets, onBack }: { assets: Asset[], onBack: () => void }) => {
    const [depositType, setDepositType] = useState<'crypto' | 'fiat'>('crypto');
    const [selectedId, setSelectedId] = useState(assets[0].id);
    const [network, setNetwork] = useState('ERC20');
    const [copied, setCopied] = useState(false);
    const [address, setAddress] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Fiat State
    const [bankAccounts, setBankAccounts] = useState<GlobalAccount[]>([]);
    const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    const selectedBank = bankAccounts.find(b => b.id === selectedBankId);
    
    const referenceCode = `REF-${Math.floor(100000 + Math.random() * 900000)}`;
    const asset = assets.find(a => a.id === selectedId) || assets[0];

    useEffect(() => {
        const accounts = getGlobalAccounts();
        setBankAccounts(accounts);
        if (accounts.length > 0) {
            setSelectedBankId(accounts[0].id);
        }
    }, []);

    const filteredAccounts = bankAccounts.filter(acc => 
        acc.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.currency.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.bankName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleGenerate = () => {
        setIsGenerating(true);
        console.log(`[BACKEND] Requesting new deposit address for AssetID: ${asset.id} (${asset.symbol}) on Network: ${network}`);
        
        setTimeout(() => {
            const prefix = network === 'TRC20' ? 'T' : network === 'SOL' ? 'Sol' : '0x';
            const randomStr = Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join("");
            const newAddress = `${prefix}${randomStr}71C7656EC`;
            setAddress(newAddress);
            setIsGenerating(false);

            console.log(`[BACKEND] Assigned Address: ${newAddress}`);
            console.log(`[BACKEND] Monitoring blockchain for incoming deposits...`);
        }, 1500);
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
             <div className="flex items-center gap-3 mb-6">
                <button onClick={onBack} className="p-2 rounded-full bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 transition-colors">
                    <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-white" />
                </button>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Deposit Funds</h2>
            </div>
            
            {/* Deposit Type Toggle */}
            <div className="flex p-1 bg-slate-200 dark:bg-white/5 rounded-xl">
                <button 
                    onClick={() => setDepositType('crypto')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
                        depositType === 'crypto' 
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                >
                    <Wallet className="w-4 h-4" /> Crypto Transfer
                </button>
                <button 
                    onClick={() => setDepositType('fiat')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
                        depositType === 'fiat' 
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                >
                    <Landmark className="w-4 h-4" /> Bank Wire
                </button>
            </div>

            {depositType === 'crypto' ? (
                <GlassCard className="space-y-6">
                    <AssetSelector assets={assets} selectedId={selectedId} onSelect={(id) => { setSelectedId(id); setAddress(null); }} />
                    <NetworkSelector 
                        networks={['ERC20', 'TRC20', 'BEP20', 'SOL']} 
                        selected={network} 
                        onSelect={(n) => { setNetwork(n); setAddress(null); }} 
                    />

                    {!address ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 border border-dashed border-slate-300 dark:border-white/10 rounded-2xl bg-white/[0.02]">
                            <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800">
                                <QrCode className="w-8 h-8 text-slate-500" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-slate-900 dark:text-white font-medium">No Address Generated</h3>
                                <p className="text-xs text-slate-500 max-w-[250px] mx-auto">
                                    Generate a unique deposit address for {asset.symbol} on the {network} network.
                                </p>
                            </div>
                            <Button 
                                onClick={handleGenerate} 
                                isLoading={isGenerating}
                                className="w-auto px-8 mt-2"
                            >
                                Generate Address
                            </Button>
                        </div>
                    ) : (
                        <div className="animate-in fade-in zoom-in duration-300 space-y-6">
                            <div className="p-6 bg-white text-black rounded-2xl flex flex-col items-center justify-center space-y-4 border border-slate-200">
                                <div className="w-48 h-48 bg-slate-100 rounded-xl flex items-center justify-center border-2 border-slate-200 relative">
                                    <QrCode className="w-32 h-32 text-slate-900" />
                                </div>
                                <p className="text-xs font-medium text-slate-500 text-center max-w-[200px]">
                                    Scan to deposit {asset.symbol} via {network}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-slate-500 dark:text-slate-400">Wallet Address</label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl p-3.5 text-sm font-mono text-slate-700 dark:text-slate-300 truncate">
                                        {address}
                                    </div>
                                    <button 
                                        onClick={() => handleCopy(address)}
                                        className="p-3.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors"
                                    >
                                        {copied ? <Check className="w-5 h-5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-5 h-5 text-slate-500 dark:text-slate-400" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                <div className="text-xs text-amber-700 dark:text-amber-200/80 leading-relaxed">
                                    Send only <strong>{asset.symbol}</strong> to this address. Sending any other coins may result in permanent loss.
                                </div>
                            </div>
                        </div>
                    )}
                </GlassCard>
            ) : (
                <GlassCard className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm text-slate-500 dark:text-slate-400">Select Currency & Region</label>
                        
                        {/* Search Bar */}
                        <div className="relative mb-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input 
                                type="text" 
                                placeholder="Search country (e.g. Spain, Mexico) or currency..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-colors dark:text-white placeholder-slate-400"
                            />
                        </div>

                        {filteredAccounts.length === 0 ? (
                            <div className="text-center py-6 text-slate-500 text-sm border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                                No accounts found for "{searchQuery}".
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {filteredAccounts.map(acc => (
                                    <button
                                        key={acc.id}
                                        onClick={() => setSelectedBankId(acc.id)}
                                        className={`p-3 rounded-xl border text-left transition-all ${
                                            selectedBankId === acc.id
                                            ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                            : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        <span className="text-xs font-bold block mb-1">{acc.currency}</span>
                                        <span className="text-[10px] block truncate font-medium">{acc.country}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {selectedBank && (
                        <>
                            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-white/5">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                                        <Building2 className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">{selectedBank.bankName}</h3>
                                        <p className="text-xs text-slate-500">{selectedBank.address}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                        <div className="space-y-1 group cursor-pointer" onClick={() => handleCopy(selectedBank.accountHolder)}>
                                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Beneficiary Name</label>
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-slate-900 dark:text-white text-sm">{selectedBank.accountHolder}</p>
                                            <Copy className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        </div>
                                        <div className="w-full h-px bg-slate-100 dark:bg-white/5" />
                                        
                                        <div className="space-y-1 group cursor-pointer" onClick={() => handleCopy(selectedBank.accountNumber)}>
                                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">IBAN / Account Number</label>
                                        <div className="flex items-center justify-between">
                                            <p className="font-mono font-medium text-slate-900 dark:text-white text-sm">{selectedBank.accountNumber}</p>
                                            <Copy className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        </div>
                                        <div className="w-full h-px bg-slate-100 dark:bg-white/5" />

                                        <div className="space-y-1 group cursor-pointer" onClick={() => handleCopy(selectedBank.swift)}>
                                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">SWIFT / BIC Code</label>
                                        <div className="flex items-center justify-between">
                                            <p className="font-mono font-medium text-slate-900 dark:text-white text-sm">{selectedBank.swift}</p>
                                            <Copy className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        </div>
                                </div>
                            </div>

                            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                <div className="flex items-start gap-3 mb-2">
                                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0" />
                                        <p className="text-xs font-bold text-amber-800 dark:text-amber-200 uppercase tracking-wide">Important Requirement</p>
                                </div>
                                <p className="text-xs text-amber-800/80 dark:text-amber-200/80 mb-3">
                                    You MUST include the following Reference Code in your bank transfer description. Failure to do so will delay your deposit.
                                </p>
                                <div 
                                    onClick={() => handleCopy(referenceCode)}
                                    className="bg-white dark:bg-black/20 border border-amber-500/30 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-500/5 transition-colors"
                                >
                                    <span className="font-mono font-bold text-amber-700 dark:text-amber-400">{referenceCode}</span>
                                    <Copy className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                                </div>
                            </div>
                        </>
                    )}

                    <Button variant="secondary" className="gap-2">
                        <Share2 className="w-4 h-4" /> Share Bank Details
                    </Button>
                </GlassCard>
            )}
            
            {depositType === 'crypto' && address && (
                <div className="flex justify-center gap-4 animate-in fade-in slide-in-from-bottom-2">
                    <Button variant="secondary" className="w-auto gap-2">
                        <Share2 className="w-4 h-4" /> Share Address
                    </Button>
                    <Button variant="secondary" className="w-auto gap-2">
                        <FileText className="w-4 h-4" /> Save Image
                    </Button>
                </div>
            )}
        </div>
    );
};

const TransferView = ({ assets, onBack }: { assets: Asset[], onBack: () => void }) => {
    const [selectedId, setSelectedId] = useState(assets[0].id);
    const [amount, setAmount] = useState('');
    const [recipientId, setRecipientId] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Mock user balance for the selected asset
    const availableBalance = 1.2454;
    
    const asset = assets.find(a => a.id === selectedId) || assets[0];

    const handleTransfer = () => {
        const numAmount = parseFloat(amount);

        if(!amount || isNaN(numAmount) || numAmount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        if (numAmount > availableBalance) {
            alert("Insufficient funds for this transaction.");
            return;
        }

        if(!recipientId) {
            alert("Please enter a recipient User ID/Email.");
            return;
        }

        setLoading(true);
        console.log(`[BACKEND] Initiating Internal Transfer...`);
        
        setTimeout(() => {
            setLoading(false);

            // Simulate Balance Updates
            const newSenderBalance = availableBalance - numAmount;
            const recipientReceived = numAmount; // No fees for internal

            // Log Transaction
            console.log("--- TRANSACTION RECEIPT ---");
            console.log(`Type: INTERNAL_TRANSFER`);
            console.log(`Asset: ${asset.symbol}`);
            console.log(`From: Current User (ME)`);
            console.log(`To: ${recipientId}`);
            console.log(`Amount: ${numAmount.toFixed(8)} ${asset.symbol}`);
            console.log(`Sender Balance Updated: ${availableBalance.toFixed(8)} -> ${newSenderBalance.toFixed(8)}`);
            console.log(`Recipient Balance Updated: +${recipientReceived.toFixed(8)}`);
            console.log("---------------------------");

            alert(`Transfer of ${amount} ${asset.symbol} to ${recipientId} successful.`);
            onBack();
        }, 1500);
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
             <div className="flex items-center gap-3 mb-6">
                <button onClick={onBack} className="p-2 rounded-full bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 transition-colors">
                    <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-white" />
                </button>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Internal Transfer</h2>
            </div>

            <GlassCard className="space-y-6">
                <AssetSelector assets={assets} selectedId={selectedId} onSelect={setSelectedId} />
                
                <Input 
                    label="Recipient User ID / Email" 
                    placeholder="Enter user email or ID" 
                    value={recipientId}
                    onChange={(e) => setRecipientId(e.target.value)}
                />

                <div className="space-y-2">
                     <label className="text-sm text-slate-500 dark:text-slate-400">Amount</label>
                     <div className="relative">
                        <Input 
                            placeholder="0.00" 
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                        <button 
                            onClick={() => setAmount(availableBalance.toString())}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-500 hover:text-amber-400"
                        >
                            MAX
                        </button>
                     </div>
                     <div className="flex justify-between text-xs text-slate-500 px-1">
                        <span>Available: {availableBalance} {asset.symbol}</span>
                     </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
                    <p className="text-xs text-blue-600 dark:text-blue-300">Internal transfers are instant and free of charge.</p>
                </div>

                <Button variant="primary" onClick={handleTransfer} isLoading={loading}>Confirm Transfer</Button>
            </GlassCard>
        </div>
    );
};

const WithdrawView = ({ assets, onBack }: { assets: Asset[], onBack: () => void }) => {
    const [selectedId, setSelectedId] = useState(assets[0].id);
    const [network, setNetwork] = useState('ERC20');
    const [amount, setAmount] = useState('');
    const [recipient, setRecipient] = useState('');
    const [loading, setLoading] = useState(false);
    
    const asset = assets.find(a => a.id === selectedId) || assets[0];
    const fee = 0.0005;
    const availableBalance = PORTFOLIO_HOLDINGS[asset.symbol] || 0;

    const handleWithdraw = () => {
        const val = parseFloat(amount);
        if(!amount || val <= 0) {
            alert("Please enter a valid amount.");
            return;
        }
        if(!recipient || recipient.length < 10) {
            alert("Please enter a valid recipient address.");
            return;
        }
        if (val > availableBalance) {
            alert(`Insufficient funds. Available: ${availableBalance} ${asset.symbol}`);
            return;
        }
        if (val <= fee) {
            alert(`Amount must be greater than fee (${fee} ${asset.symbol})`);
            return;
        }

        setLoading(true);
        console.log(`[BACKEND] Initiating Withdrawal Request...`);
        
        setTimeout(() => {
            setLoading(false);
            
            // Simulate deduction
            PORTFOLIO_HOLDINGS[asset.symbol] = availableBalance - val;
            
            console.log(`[BACKEND] Withdrawal Request Processed.`);
            console.log(`--------------------------------------------------`);
            console.log(`Transaction ID: TX_${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
            console.log(`User: Current User`);
            console.log(`Asset: ${asset.symbol}`);
            console.log(`Network: ${network}`);
            console.log(`Recipient: ${recipient}`);
            console.log(`Gross Amount: ${val.toFixed(8)}`);
            console.log(`Network Fee: ${fee.toFixed(8)}`);
            console.log(`Net Received: ${(val - fee).toFixed(8)}`);
            console.log(`Old Balance: ${availableBalance.toFixed(8)}`);
            console.log(`New Balance: ${PORTFOLIO_HOLDINGS[asset.symbol].toFixed(8)}`);
            console.log(`Status: COMPLETED`);
            console.log(`--------------------------------------------------`);
            
            alert(`Withdrawal of ${amount} ${asset.symbol} successful.`);
            onBack();
        }, 2000);
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
             <div className="flex items-center gap-3 mb-6">
                <button onClick={onBack} className="p-2 rounded-full bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 transition-colors">
                    <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-white" />
                </button>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Withdraw {asset.symbol}</h2>
            </div>

            <GlassCard className="space-y-6">
                <AssetSelector assets={assets} selectedId={selectedId} onSelect={setSelectedId} />
                
                <Input 
                    label="Recipient Address" 
                    placeholder={`Enter ${asset.symbol} Address`} 
                    className="font-mono text-sm"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                />

                <NetworkSelector 
                    networks={['ERC20', 'TRC20', 'BEP20', 'SOL']} 
                    selected={network} 
                    onSelect={setNetwork} 
                />

                <div className="space-y-2">
                     <label className="text-sm text-slate-500 dark:text-slate-400">Amount</label>
                     <div className="relative">
                        <Input 
                            placeholder="Min 0.001" 
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                        <button 
                            onClick={() => setAmount(availableBalance.toString())}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-500 hover:text-amber-400"
                        >
                            MAX
                        </button>
                     </div>
                     <div className="flex justify-between text-xs text-slate-500 px-1">
                        <span>Available: {availableBalance.toFixed(4)} {asset.symbol}</span>
                        <span>Limit: 100.00 {asset.symbol}/24h</span>
                     </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Network Fee</span>
                        <span className="text-slate-900 dark:text-white">{fee} {asset.symbol}</span>
                    </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Receive Amount</span>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">
                            {amount ? (parseFloat(amount) - fee).toFixed(4) : '0.0000'} <span className="text-sm font-normal text-slate-500">{asset.symbol}</span>
                        </span>
                    </div>
                </div>

                <Button variant="primary" onClick={handleWithdraw} isLoading={loading}>Confirm Withdrawal</Button>
            </GlassCard>
        </div>
    );
};

const TransactionHistoryView = ({ onBack }: { onBack: () => void }) => {
    const transactions = getTransactions();
    return (
        <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-3 mb-4">
                <button onClick={onBack} className="p-2 rounded-full bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 transition-colors">
                    <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-white" />
                </button>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Transaction History</h2>
            </div>
            
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {['All', 'Deposit', 'Withdraw', 'Buy', 'Sell'].map(filter => (
                    <button key={filter} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-sm font-medium whitespace-nowrap text-slate-700 dark:text-slate-300">
                        {filter}
                    </button>
                ))}
            </div>

            <div className="space-y-3">
                {transactions.map(t => (
                    <GlassCard key={t.id} className="flex items-center justify-between py-4">
                         <div className="flex items-center gap-4">
                             <div className={`p-3 rounded-full ${t.type === 'deposit' || t.type === 'buy' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                {t.type === 'deposit' || t.type === 'buy' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                             </div>
                             <div>
                                 <p className="font-bold text-slate-900 dark:text-white capitalize">{t.type} {t.assetSymbol || 'USD'}</p>
                                 <p className="text-xs text-slate-500">{t.date}</p>
                             </div>
                         </div>
                         <div className="text-right">
                             <p className={`font-bold ${t.type === 'deposit' || t.type === 'buy' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                                {t.type === 'deposit' || t.type === 'buy' ? '+' : '-'}{t.amount} {t.assetSymbol || 'USD'}
                             </p>
                             <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{t.status}</p>
                         </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    )
}

export const WalletDashboard: React.FC<{ currency?: string; rate?: number }> = ({ currency = '$', rate = 1 }) => {
    const [view, setView] = useState<'overview' | 'deposit' | 'withdraw' | 'history' | 'transfer'>('overview');
    const assets = getAssets();

    return (
        <div className="pb-24">
            {view === 'overview' && <WalletOverview assets={assets} onNavigate={(v: any) => setView(v)} currency={currency} rate={rate} />}
            {view === 'deposit' && <DepositView assets={assets} onBack={() => setView('overview')} />}
            {view === 'withdraw' && <WithdrawView assets={assets} onBack={() => setView('overview')} />}
            {view === 'history' && <TransactionHistoryView onBack={() => setView('overview')} />}
            {view === 'transfer' && <TransferView assets={assets} onBack={() => setView('overview')} />}
        </div>
    );
};