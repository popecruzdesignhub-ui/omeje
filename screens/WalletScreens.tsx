import React, { useState } from 'react';
import { 
  ArrowDownLeft, ArrowUpRight, History, 
  Copy, Check, ChevronDown, QrCode,
  AlertCircle, ChevronLeft,
  Share2, FileText, ArrowRightLeft
} from 'lucide-react';
import { GlassCard, Button, Input } from '../components/UI';
import { Asset } from '../types';
import { getAssets, getTransactions } from '../services/dataService';

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
                         <img src={selected.iconUrl} alt={selected.symbol} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/5" />
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
                                <img src={asset.iconUrl} alt={asset.symbol} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/5" />
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

const WalletOverview = ({ assets, onNavigate }: { assets: Asset[], onNavigate: (view: string) => void }) => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
             {/* Total Balance Card */}
            <GlassCard className="relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
                <div className="relative z-10 text-center py-6">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Total Estimated Value</p>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">$42,850.25</h1>
                    <p className="text-sm text-slate-500">≈ 0.6542 BTC</p>
                
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
                    {assets.map(asset => (
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
                                <p className="font-medium text-slate-900 dark:text-white">{(asset.price / 1000).toFixed(4)}</p>
                                <p className="text-xs text-slate-500">${(asset.price * (asset.price/1000)).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

const DepositView = ({ assets, onBack }: { assets: Asset[], onBack: () => void }) => {
    const [selectedId, setSelectedId] = useState(assets[0].id);
    const [network, setNetwork] = useState('ERC20');
    const [copied, setCopied] = useState(false);
    const [address, setAddress] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    
    const asset = assets.find(a => a.id === selectedId) || assets[0];

    const handleGenerate = () => {
        setIsGenerating(true);
        console.log(`[BACKEND] Requesting new deposit address for AssetID: ${asset.id} (${asset.symbol}) on Network: ${network}`);
        
        setTimeout(() => {
            const prefix = network === 'TRC20' ? 'T' : network === 'SOL' ? 'Sol' : '0x';
            const randomStr = Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join("");
            const newAddress = `${prefix}${randomStr}71C7656EC`;
            setAddress(newAddress);
            setIsGenerating(false);

            console.log(`[BACKEND] Address Generation Successful.`);
            console.log(`[BACKEND] Assigned Address: ${newAddress}`);
            console.log(`[BACKEND] Monitoring blockchain for incoming deposits...`);
        }, 1500);
    };

    const handleCopy = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
             <div className="flex items-center gap-3 mb-6">
                <button onClick={onBack} className="p-2 rounded-full bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 transition-colors">
                    <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-white" />
                </button>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Deposit {asset.symbol}</h2>
            </div>

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
                                    onClick={handleCopy}
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
            
            {address && (
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
    
    const asset = assets.find(a => a.id === selectedId) || assets[0];

    const handleTransfer = () => {
        if(!amount || parseFloat(amount) <= 0) {
            alert("Please enter a valid amount.");
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
            console.log(`Transfer Successful: ${amount} ${asset.symbol} sent to ${recipientId}`);
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
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-500 hover:text-amber-400">MAX</button>
                     </div>
                     <div className="flex justify-between text-xs text-slate-500 px-1">
                        <span>Available: 1.2454 {asset.symbol}</span>
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

    const handleWithdraw = () => {
        if(!amount || parseFloat(amount) <= 0) {
            alert("Please enter a valid amount.");
            return;
        }
        if(!recipient || recipient.length < 10) {
            alert("Please enter a valid recipient address.");
            return;
        }

        setLoading(true);
        console.log(`[BACKEND] Initiating Withdrawal Request...`);
        
        setTimeout(() => {
            setLoading(false);
            console.log(`[BACKEND] Withdrawal Request Submitted Successfully.`);
            console.log(`--------------------------------------------------`);
            console.log(`Transaction ID: TX_${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
            console.log(`User: Current User`);
            console.log(`Asset: ${asset.symbol}`);
            console.log(`Network: ${network}`);
            console.log(`Recipient: ${recipient}`);
            console.log(`Amount: ${amount}`);
            console.log(`Fee: ${fee}`);
            console.log(`Net Amount: ${(parseFloat(amount) - fee).toFixed(8)}`);
            console.log(`Status: PENDING_APPROVAL`);
            console.log(`--------------------------------------------------`);
            
            alert(`Withdrawal of ${amount} ${asset.symbol} submitted for processing.`);
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
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-500 hover:text-amber-400">MAX</button>
                     </div>
                     <div className="flex justify-between text-xs text-slate-500 px-1">
                        <span>Available: 1.2454 {asset.symbol}</span>
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

export const WalletDashboard: React.FC = () => {
    const [view, setView] = useState<'overview' | 'deposit' | 'withdraw' | 'history' | 'transfer'>('overview');
    const assets = getAssets();

    return (
        <div className="pb-24">
            {view === 'overview' && <WalletOverview assets={assets} onNavigate={(v: any) => setView(v)} />}
            {view === 'deposit' && <DepositView assets={assets} onBack={() => setView('overview')} />}
            {view === 'withdraw' && <WithdrawView assets={assets} onBack={() => setView('overview')} />}
            {view === 'history' && <TransactionHistoryView onBack={() => setView('overview')} />}
            {view === 'transfer' && <TransferView assets={assets} onBack={() => setView('overview')} />}
        </div>
    );
};