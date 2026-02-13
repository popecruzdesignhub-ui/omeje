import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, Users, Activity, Settings, LogOut, 
  Search, Bell, AlertTriangle, CheckCircle2, XCircle,
  MoreVertical, Server, Database, FileText, DollarSign,
  Lock, TrendingUp, Menu, ChevronRight, Wallet, CreditCard,
  Ban, Check, RefreshCcw, Eye, Trash2, Unlock, Clock,
  Filter, ExternalLink, Calendar, Loader2, X
} from 'lucide-react';
import { GlassCard, Button, Input, Modal, Badge, Logo, ThemeToggle, LanguageSelector } from '../components/UI';
import { AppScreen } from '../types';
import { translations, Language } from '../services/translations';

// --- Types & Mock Data ---

type AdminTab = 'overview' | 'users' | 'kyc' | 'withdrawals' | 'transactions' | 'fees' | 'security';

interface SecurityLog {
  id: number;
  event: string;
  ip: string;
  location: string;
  time: string;
  timestamp: number; // For sorting
  severity: 'low' | 'medium' | 'high';
}

const SECURITY_LOGS: SecurityLog[] = [
  { id: 1, event: 'Failed Login Attempt', ip: '192.168.1.45', location: 'Moscow, RU', time: '10 mins ago', timestamp: Date.now() - 600000, severity: 'medium' },
  { id: 2, event: 'Large Withdrawal Flagged', ip: '45.22.19.11', location: 'New York, US', time: '1 hour ago', timestamp: Date.now() - 3600000, severity: 'high' },
  { id: 3, event: 'Admin Login', ip: '10.0.0.1', location: 'Internal', time: '2 hours ago', timestamp: Date.now() - 7200000, severity: 'low' },
  { id: 4, event: 'API Key Generated', ip: '88.12.44.21', location: 'London, UK', time: '3 hours ago', timestamp: Date.now() - 10800000, severity: 'low' },
  { id: 5, event: 'Suspicious IP Detected', ip: '12.34.56.78', location: 'Unknown', time: '5 hours ago', timestamp: Date.now() - 18000000, severity: 'medium' },
];

const INITIAL_USERS = [
    { id: 1, name: "Alice Freeman", email: "alice@example.com", balance: 12450.00, kyc: "Verified", status: "Active", risk: "Low", lastLogin: "Today, 10:42 AM", lastLoginTs: Date.now() - 100000 },
    { id: 2, name: "Bob Smith", email: "bob@crypto.net", balance: 450.00, kyc: "Pending", status: "Active", risk: "Medium", lastLogin: "Yesterday", lastLoginTs: Date.now() - 86400000 },
    { id: 3, name: "Charlie Day", email: "charlie@trade.io", balance: 1200000.00, kyc: "Verified", status: "Locked", risk: "High", lastLogin: "2 days ago", lastLoginTs: Date.now() - 172800000 },
    { id: 4, name: "Diana Prince", email: "diana@themyscira.com", balance: 85000.00, kyc: "Verified", status: "Active", risk: "Low", lastLogin: "1 hour ago", lastLoginTs: Date.now() - 3600000 },
    { id: 5, name: "Evan Wright", email: "evan@darkweb.net", balance: 0.00, kyc: "Unverified", status: "Banned", risk: "Critical", lastLogin: "Never", lastLoginTs: 0 },
];

const RECENT_ACTIVITY = [
    { id: 'act_1', user: 'Alice Freeman', action: 'Deposit', detail: '1,000 USDT', time: '2 min ago', status: 'success' },
    { id: 'act_2', user: 'Bob Smith', action: 'KYC Submit', detail: 'Passport', time: '5 min ago', status: 'pending' },
    { id: 'act_3', user: 'Charlie Day', action: 'Trade', detail: 'Buy 0.5 BTC', time: '12 min ago', status: 'success' },
    { id: 'act_4', user: 'System', action: 'Auto-Flag', detail: 'High Volume Volatility', time: '15 min ago', status: 'warning' },
    { id: 'act_5', user: 'Diana Prince', action: 'Withdraw', detail: '500 USDT', time: '22 min ago', status: 'pending' },
];

const PENDING_KYC = [
  { id: 101, name: "Sarah Connor", email: "sarah@skynet.com", docType: "Passport", submitted: "2 hours ago" },
  { id: 102, name: "John Wick", email: "john@continental.com", docType: "Driver License", submitted: "5 hours ago" },
];

const INITIAL_PENDING_WITHDRAWALS = [
  { id: 'tx_992', user: 'Alice Freeman', amount: '2.5 BTC', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', risk: 'Low', time: '15m ago', network: 'Bitcoin' },
  { id: 'tx_993', user: 'Charlie Day', amount: '50,000 USDT', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', risk: 'High', time: '1h ago', network: 'ERC20' },
];

const INITIAL_WITHDRAWAL_HISTORY = [
  { id: 'tx_881', user: 'Bob Smith', amount: '100 USDT', address: '0x123...', status: 'Completed', time: 'Yesterday', network: 'TRC20', txHash: '0xabc...def' },
  { id: 'tx_882', user: 'Diana Prince', amount: '0.5 ETH', address: '0xabc...', status: 'Rejected', time: '2 days ago', network: 'ERC20', txHash: '' },
];

// --- Sub-Components ---

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick, 
  badge 
}: { 
  icon: any, label: string, active: boolean, onClick: () => void, badge?: number 
}) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all mb-1 ${
      active 
        ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20 shadow-lg shadow-rose-900/20' 
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon className={`w-5 h-5 ${active ? 'fill-rose-500/20' : ''}`} />
      <span className="font-medium text-sm">{label}</span>
    </div>
    {badge && (
      <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
        {badge}
      </span>
    )}
  </button>
);

interface AdminProps {
  setScreen: (screen: AppScreen) => void;
  isDark: boolean;
  toggleTheme: () => void;
  lang: Language;
  setLang: (l: Language) => void;
}

const UserManagement = ({ t }: { t: any }) => {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [fundingModalOpen, setFundingModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [fundAmount, setFundAmount] = useState('');
  const [fundAsset, setFundAsset] = useState('USDT');
  const [searchQuery, setSearchQuery] = useState('');
  const [kycFilter, setKycFilter] = useState<'All' | 'Verified' | 'Pending' | 'Unverified'>('All');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter and Sort Users
  const filteredUsers = useMemo(() => {
    return users
      .filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesKyc = kycFilter === 'All' || user.kyc === kycFilter;
        return matchesSearch && matchesKyc;
      })
      .sort((a, b) => b.lastLoginTs - a.lastLoginTs); // Sort by most recent login
  }, [users, searchQuery, kycFilter]);

  const handleFundClick = (user: any) => {
    setSelectedUser(user);
    setFundingModalOpen(true);
  };

  const handleFundSubmit = () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
        alert("Please enter a valid amount.");
        return;
    }
    
    setIsProcessing(true);

    // Simulate network delay for backend processing
    setTimeout(() => {
        // Simulate Backend Update
        setUsers(prevUsers => prevUsers.map(u => u.id === selectedUser.id ? { ...u, balance: u.balance + parseFloat(fundAmount) } : u));
        
        // Log Transaction (Simulated Backend Log)
        console.log("--- ADMIN FUNDING TRANSACTION LOG ---");
        console.log(`Transaction ID: ADM_TX_${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
        console.log(`Timestamp: ${new Date().toISOString()}`);
        console.log(`Admin User: CURRENT_ADMIN_SESSION`);
        console.log(`Target User: ${selectedUser.name} (ID: ${selectedUser.id})`);
        console.log(`Asset: ${fundAsset}`);
        console.log(`Amount: ${fundAmount}`);
        console.log(`New Balance: ${selectedUser.balance + parseFloat(fundAmount)}`);
        console.log("-------------------------------------");

        setIsProcessing(false);
        setFundingModalOpen(false);
        setFundAmount('');
        alert(`Successfully credited ${fundAmount} ${fundAsset} to ${selectedUser.name}. Transaction logged.`);
    }, 1500);
  };

  const toggleLockUser = (userId: number) => {
      setUsers(users.map(u => {
          if (u.id === userId) {
              const newStatus = u.status === 'Locked' ? 'Active' : 'Locked';
              return { ...u, status: newStatus };
          }
          return u;
      }));
  };

  const deleteUser = (userId: number) => {
      if(confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
          setUsers(users.filter(u => u.id !== userId));
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.userManagement}</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
             {/* Filter Tabs */}
            <div className="flex p-1 bg-slate-200 dark:bg-slate-900/50 rounded-lg border border-slate-300 dark:border-white/10">
                {(['All', 'Verified', 'Pending', 'Unverified'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setKycFilter(status)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                            kycFilter === status 
                            ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input 
                    type="text" 
                    placeholder={t.searchPlaceholder} 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-sm w-full sm:w-64 focus:outline-none focus:border-rose-500/50 dark:text-white" 
                />
            </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl dark:shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-white/5 uppercase text-xs tracking-wider">
              <tr>
                <th className="p-4">{t.userIdentity}</th>
                <th className="p-4">Last Login</th>
                <th className="p-4">{t.walletBalance}</th>
                <th className="p-4">{t.kycStatus}</th>
                <th className="p-4">{t.status}</th>
                <th className="p-4">{t.risk}</th>
                <th className="p-4 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-white/5">
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400 text-xs">
                    {user.lastLogin}
                  </td>
                  <td className="p-4 font-mono text-slate-700 dark:text-white text-base">${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide border ${
                          user.kyc === 'Verified' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 
                          user.kyc === 'Pending' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' : 
                          'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20'
                      }`}>
                          {user.kyc}
                      </span>
                  </td>
                  <td className="p-4">
                    <span className={`flex items-center gap-1.5 text-xs font-medium ${
                      user.status === 'Active' ? 'text-emerald-600 dark:text-emerald-400' :
                      user.status === 'Locked' ? 'text-rose-600 dark:text-rose-400' :
                      'text-slate-500 dark:text-slate-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                          user.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.5)]' :
                          user.status === 'Locked' ? 'bg-rose-500 animate-pulse' :
                          'bg-slate-400'
                      }`} />
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="w-20 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full rounded-full ${
                            user.risk === 'High' ? 'bg-rose-500 w-[90%]' :
                            user.risk === 'Medium' ? 'bg-amber-500 w-[50%]' :
                            'bg-emerald-500 w-[15%]'
                        }`} />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">{user.risk} {t.risk}</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleFundClick(user)}
                        className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all hover:scale-105"
                        title={t.fundUser}
                      >
                        <DollarSign className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => toggleLockUser(user.id)}
                        className={`p-2 rounded-lg border transition-all hover:scale-105 ${
                            user.status === 'Locked' 
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20' 
                            : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600/50 hover:bg-slate-200 dark:hover:bg-slate-600/50'
                        }`}
                        title={user.status === 'Locked' ? t.lockAccount : t.lockAccount}
                      >
                        {user.status === 'Locked' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </button>
                      <button 
                          onClick={() => deleteUser(user.id)}
                          className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all hover:scale-105"
                          title={t.deleteUser}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={fundingModalOpen} 
        onClose={() => !isProcessing && setFundingModalOpen(false)} 
        title={`${t.adminDeposit}: ${selectedUser?.name}`}
      >
        <div className="space-y-4 py-2">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0" />
            <p className="text-xs text-amber-800 dark:text-amber-200">
              You are manually crediting funds to a user wallet. This action bypasses the blockchain and is recorded in the immutable security log.
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-slate-500 dark:text-slate-400">{t.assetClass}</label>
            <div className="flex gap-2">
              {['USDT', 'BTC', 'ETH', 'SOL'].map(asset => (
                <button 
                  key={asset}
                  onClick={() => setFundAsset(asset)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-all ${
                    fundAsset === asset 
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white shadow-lg' 
                      : 'bg-transparent border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {asset}
                </button>
              ))}
            </div>
          </div>

          <Input 
            label={t.amount}
            type="number" 
            placeholder="0.00" 
            value={fundAmount}
            onChange={(e) => setFundAmount(e.target.value)}
            className="text-lg font-mono text-emerald-600 dark:text-emerald-400"
          />
          
          <div className="flex gap-3 mt-4">
              <Button variant="secondary" onClick={() => setFundingModalOpen(false)} disabled={isProcessing}>{t.cancel}</Button>
              <Button 
                onClick={handleFundSubmit} 
                variant="primary" 
                isLoading={isProcessing}
                className="bg-emerald-500 hover:bg-emerald-600 border-none text-white shadow-lg shadow-emerald-500/20"
              >
                {t.confirmDeposit}
              </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const KYCQueue = ({ t }: { t: any }) => (
  <div className="space-y-6 animate-in fade-in">
    <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.kycQueue}</h2>
        <div className="flex gap-2">
            <Button variant="secondary" className="w-auto text-xs py-2 h-9">Bulk Approve</Button>
            <Button variant="secondary" className="w-auto text-xs py-2 h-9">Export Data</Button>
        </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {PENDING_KYC.map(item => (
        <GlassCard key={item.id} className="flex flex-col gap-4 border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-white/10">
                <span className="font-bold text-lg">{item.name[0]}</span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {item.name} 
                    <Badge value={0} type="percent" />
                </h4>
                <p className="text-xs text-slate-500">{item.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-white/5">{item.docType}</span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {item.submitted}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="h-32 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-900 transition-colors cursor-pointer group">
            <FileText className="w-6 h-6 text-slate-400 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400" />
            <p className="text-slate-500 dark:text-slate-600 text-xs group-hover:text-slate-600 dark:group-hover:text-slate-400">Click to review document</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-auto">
            <Button variant="danger" className="h-10 text-sm bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border-rose-500/20">{t.reject}</Button>
            <Button variant="primary" className="h-10 text-sm bg-emerald-500 hover:bg-emerald-600 border-none text-white">{t.approve}</Button>
          </div>
        </GlassCard>
      ))}
    </div>
  </div>
);

const WithdrawalQueue = ({ t }: { t: any }) => {
    const [tab, setTab] = useState<'pending' | 'history'>('pending');
    const [selectedTx, setSelectedTx] = useState<any>(null);
    const [pendingWithdrawals, setPendingWithdrawals] = useState(INITIAL_PENDING_WITHDRAWALS);
    const [withdrawalHistory, setWithdrawalHistory] = useState(INITIAL_WITHDRAWAL_HISTORY);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleApprove = (tx: any) => {
        if (confirm(`Approve withdrawal of ${tx.amount} for ${tx.user}?`)) {
            setProcessingId(tx.id);
            console.log(`[BACKEND] Processing withdrawal approval for ${tx.id}...`);
            
            setTimeout(() => {
                // Move to history
                const completedTx = { ...tx, status: 'Completed', time: 'Just now', txHash: `0x${Math.random().toString(36).substr(2, 40)}` };
                setWithdrawalHistory([completedTx, ...withdrawalHistory]);
                setPendingWithdrawals(pendingWithdrawals.filter(p => p.id !== tx.id));
                setProcessingId(null);
                
                console.log("--- WITHDRAWAL APPROVED ---");
                console.log(`Transaction ID: ${tx.id}`);
                console.log(`User: ${tx.user}`);
                console.log(`Amount: ${tx.amount}`);
                console.log(`Status: COMPLETED`);
                console.log(`Backend Action: Deduct ${tx.amount} from locked balance. Release to blockchain.`);
                console.log("---------------------------");
            }, 1500);
        }
    };

    const handleReject = (tx: any) => {
        if (confirm(`Reject withdrawal of ${tx.amount} for ${tx.user}?`)) {
            setProcessingId(tx.id);
            console.log(`[BACKEND] Processing withdrawal rejection for ${tx.id}...`);
            
            setTimeout(() => {
                 // Move to history
                const rejectedTx = { ...tx, status: 'Rejected', time: 'Just now' };
                setWithdrawalHistory([rejectedTx, ...withdrawalHistory]);
                setPendingWithdrawals(pendingWithdrawals.filter(p => p.id !== tx.id));
                 setProcessingId(null);
                 
                console.log("--- WITHDRAWAL REJECTED ---");
                console.log(`Transaction ID: ${tx.id}`);
                console.log(`User: ${tx.user}`);
                console.log(`Reason: Admin Decision`);
                console.log(`Backend Action: Return ${tx.amount} to user main balance.`);
                console.log("---------------------------");
            }, 1500);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.withdrawalRequests}</h2>
                <div className="flex p-1 bg-slate-200 dark:bg-slate-900/50 rounded-lg border border-slate-300 dark:border-white/10">
                    <button
                        onClick={() => setTab('pending')}
                        className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${tab === 'pending' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setTab('history')}
                        className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${tab === 'history' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        History
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-white/5">
                    <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">{t.amount}</th>
                    <th className="p-4">{t.destination}</th>
                    <th className="p-4">{tab === 'pending' ? t.risk : t.status}</th>
                    <th className="p-4 text-right">{t.actions}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {(tab === 'pending' ? pendingWithdrawals : withdrawalHistory).map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                        <td className="p-4 font-medium text-slate-900 dark:text-white flex flex-col">
                            <span>{tx.user}</span>
                            <span className="text-xs text-slate-500 font-normal">{tx.time}</span>
                        </td>
                        <td className="p-4 font-mono text-slate-900 dark:text-white text-lg">{tx.amount}</td>
                        <td className="p-4">
                            <div className="flex items-center gap-2">
                                <code className="bg-slate-100 dark:bg-black/30 px-2 py-1 rounded text-xs text-slate-600 dark:text-slate-400 font-mono border border-slate-200 dark:border-white/5 truncate max-w-[120px]">{tx.address}</code>
                            </div>
                        </td>
                        <td className="p-4">
                            {tab === 'pending' ? (
                                <span className={`px-2 py-1 rounded text-xs font-bold border ${
                                    tx.risk === 'High' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/20' : 
                                    'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                }`}>
                                    {tx.risk} Risk
                                </span>
                            ) : (
                                 <span className={`px-2 py-1 rounded text-xs font-bold border ${
                                    tx.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 
                                    'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/20'
                                }`}>
                                    {tx.status}
                                </span>
                            )}
                        </td>
                        <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" className="h-9 w-9 p-0 border border-slate-200 dark:border-white/10" onClick={() => setSelectedTx(tx)} title="View Details">
                                <Eye className="w-4 h-4" />
                            </Button>
                            {tab === 'pending' && (
                                <>
                                    <button 
                                        onClick={() => handleReject(tx)}
                                        disabled={!!processingId}
                                        className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 border border-rose-500/20 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={t.reject}
                                    >
                                        {processingId === tx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                                    </button>
                                    <button 
                                        onClick={() => handleApprove(tx)}
                                        disabled={!!processingId}
                                        className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 border border-emerald-500/20 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={t.approve}
                                    >
                                        {processingId === tx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    </button>
                                </>
                            )}
                        </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>

            <Modal
                isOpen={!!selectedTx}
                onClose={() => setSelectedTx(null)}
                title="Withdrawal Details"
            >
                {selectedTx && (
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-slate-5 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-slate-500 dark:text-slate-400">User</span>
                                <span className="font-medium text-slate-900 dark:text-white">{selectedTx.user}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Amount</span>
                                <span className="font-bold text-lg text-slate-900 dark:text-white">{selectedTx.amount}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Network</span>
                                <span className="font-medium text-slate-900 dark:text-white">{selectedTx.network || 'Unknown'}</span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Destination Address</span>
                                <div className="p-2 bg-slate-200 dark:bg-black/30 rounded-lg text-xs font-mono break-all text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10">
                                    {selectedTx.address}
                                </div>
                            </div>
                            {selectedTx.txHash && (
                                <div className="space-y-1">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Blockchain Hash</span>
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 flex-1 bg-slate-200 dark:bg-black/30 rounded-lg text-xs font-mono break-all text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10">
                                            {selectedTx.txHash}
                                        </div>
                                        <a href="#" className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20" title="View on Explorer">
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                             <Button variant="secondary" onClick={() => setSelectedTx(null)}>Close</Button>
                             {tab === 'pending' && (
                                <>
                                   <Button 
                                      variant="danger" 
                                      className="w-auto"
                                      onClick={() => { handleReject(selectedTx); setSelectedTx(null); }}
                                      isLoading={processingId === selectedTx.id}
                                   >
                                      Reject
                                   </Button>
                                   <Button 
                                      variant="primary" 
                                      className="w-auto bg-emerald-500 hover:bg-emerald-600 border-none"
                                      onClick={() => { handleApprove(selectedTx); setSelectedTx(null); }}
                                      isLoading={processingId === selectedTx.id}
                                   >
                                      Approve
                                   </Button>
                                </>
                             )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

const FeesConfig = ({ t }: { t: any }) => (
  <div className="max-w-2xl space-y-6 animate-in fade-in">
    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.platformFees}</h2>
    <GlassCard className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm text-slate-500 dark:text-slate-400">Spot Trading Fee (%)</label>
          <Input placeholder="0.1" defaultValue="0.1" className="font-mono" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-500 dark:text-slate-400">Futures Trading Fee (%)</label>
          <Input placeholder="0.02" defaultValue="0.02" className="font-mono" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-500 dark:text-slate-400">Withdrawal Fee (Flat USDT)</label>
          <Input placeholder="1.0" defaultValue="1.0" className="font-mono" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-500 dark:text-slate-400">Instant Buy Spread (%)</label>
          <Input placeholder="0.5" defaultValue="0.5" className="font-mono" />
        </div>
      </div>
      <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex justify-end">
        <Button className="w-auto">{t.saveChanges}</Button>
      </div>
    </GlassCard>
  </div>
);

const SecurityAudit = ({ t }: { t: any }) => {
    const [severityFilter, setSeverityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

    const filteredLogs = useMemo(() => {
        return SECURITY_LOGS
            .filter(log => severityFilter === 'all' || log.severity === severityFilter)
            .sort((a, b) => sortOrder === 'newest' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp);
    }, [severityFilter, sortOrder]);

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <ShieldAlert className="w-6 h-6 text-rose-500" /> {t.securityAudit}
                </h2>
                <div className="flex gap-3">
                    <div className="flex p-1 bg-slate-200 dark:bg-slate-900/50 rounded-lg border border-slate-300 dark:border-white/10">
                        <button onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')} className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1">
                            {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
                        </button>
                    </div>
                     <div className="flex p-1 bg-slate-200 dark:bg-slate-900/50 rounded-lg border border-slate-300 dark:border-white/10">
                        {(['all', 'low', 'medium', 'high'] as const).map(sev => (
                            <button
                                key={sev}
                                onClick={() => setSeverityFilter(sev)}
                                className={`px-3 py-1.5 text-xs font-medium capitalize rounded-md transition-all ${
                                    severityFilter === sev 
                                    ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' 
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                {sev}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 font-mono text-xs h-[500px] overflow-y-auto custom-scrollbar">
            {filteredLogs.map(log => (
                <div key={log.id} className="flex flex-col sm:flex-row gap-2 sm:gap-4 py-3 border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 px-2 rounded">
                    <span className="text-slate-500 w-24 shrink-0">{log.time}</span>
                    <span className={`w-16 shrink-0 font-bold uppercase ${
                        log.severity === 'high' ? 'text-rose-500' : 
                        log.severity === 'medium' ? 'text-amber-500' : 'text-emerald-500'
                    }`}>{log.severity}</span>
                    <span className="text-slate-900 dark:text-white flex-1 font-medium">{log.event}</span>
                    <span className="text-slate-400 w-32 shrink-0">{log.ip}</span>
                    <span className="text-slate-500 w-32 shrink-0">{log.location}</span>
                </div>
            ))}
            <div className="text-slate-600 italic py-2 text-center">-- End of log stream --</div>
            </div>
        </div>
    );
};

const AdminOverview = ({ t }: { t: any }) => (
    <div className="space-y-8 animate-in fade-in">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 bg-emerald-500/10 blur-2xl rounded-full group-hover:bg-emerald-500/20 transition-all" />
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{t.totalAssets}</p>
                        <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">$45.2M</h3>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[75%] shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">+12.5% vs last month</p>
            </GlassCard>

            <GlassCard className="relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 bg-blue-500/10 blur-2xl rounded-full group-hover:bg-blue-500/20 transition-all" />
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{t.activeUsers}</p>
                        <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">12,450</h3>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        <Users className="w-6 h-6" />
                    </div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                     <div className="bg-blue-500 h-full w-[45%] shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">+8% new signups</p>
            </GlassCard>

             <GlassCard className="relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 bg-amber-500/10 blur-2xl rounded-full group-hover:bg-amber-500/20 transition-all" />
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{t.pendingActions}</p>
                        <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">24</h3>
                    </div>
                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                     <div className="bg-amber-500 h-full w-[30%] shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">Requires attention</p>
            </GlassCard>
        </div>

        {/* Live Feed */}
        <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.liveFeed}</h2>
                <button className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white">View Full Log</button>
             </div>
             <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-xs uppercase font-medium">
                        <tr>
                            <th className="p-4">Action</th>
                            <th className="p-4">User</th>
                            <th className="p-4">Detail</th>
                            <th className="p-4 text-right">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {RECENT_ACTIVITY.map(act => (
                            <tr key={act.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                        act.status === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                        act.status === 'warning' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                                        'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                    }`}>
                                        {act.action}
                                    </span>
                                </td>
                                <td className="p-4 font-medium text-slate-900 dark:text-white">{act.user}</td>
                                <td className="p-4 text-slate-600 dark:text-slate-400">{act.detail}</td>
                                <td className="p-4 text-right text-slate-500 text-xs">{act.time}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>
    </div>
);

export const AdminDashboard: React.FC<AdminProps> = ({ setScreen, isDark, toggleTheme, lang, setLang }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[lang];

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-slate-200 dark:border-white/5">
           <div className="flex items-center gap-2 mb-1 cursor-pointer" onClick={() => setScreen(AppScreen.DASHBOARD)}>
            <Logo className="w-8 h-8" />
            <span className="font-bold text-lg tracking-tight">Psychology Trade</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 bg-amber-500/10 rounded border border-amber-500/20 w-fit mt-2">
            <ShieldAlert className="w-3 h-3 text-amber-600 dark:text-amber-500" />
            <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-500 tracking-wider">Admin Access</span>
          </div>
      </div>

      <div className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider mb-2 mt-2">Main</p>
          <SidebarItem icon={Activity} label={t.overview} active={activeTab === 'overview'} onClick={() => {setActiveTab('overview'); setMobileMenuOpen(false);}} />
          <SidebarItem icon={Users} label={t.usersAccess} active={activeTab === 'users'} onClick={() => {setActiveTab('users'); setMobileMenuOpen(false);}} badge={24} />
          
          <p className="px-3 text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider mb-2 mt-6">Operations</p>
          <SidebarItem icon={CheckCircle2} label={t.kycApprovals} active={activeTab === 'kyc'} onClick={() => {setActiveTab('kyc'); setMobileMenuOpen(false);}} badge={5} />
          <SidebarItem icon={Wallet} label={t.withdrawals} active={activeTab === 'withdrawals'} onClick={() => {setActiveTab('withdrawals'); setMobileMenuOpen(false);}} badge={2} />
          <SidebarItem icon={FileText} label={t.transactions} active={activeTab === 'transactions'} onClick={() => {setActiveTab('transactions'); setMobileMenuOpen(false);}} />
          
          <p className="px-3 text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider mb-2 mt-6">System</p>
          <SidebarItem icon={DollarSign} label={t.feeSettings} active={activeTab === 'fees'} onClick={() => {setActiveTab('fees'); setMobileMenuOpen(false);}} />
          <SidebarItem icon={ShieldAlert} label={t.securityLogs} active={activeTab === 'security'} onClick={() => {setActiveTab('security'); setMobileMenuOpen(false);}} />
          <SidebarItem icon={Settings} label={t.settings} active={false} onClick={() => setMobileMenuOpen(false)} />
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-white/5">
           <button 
             onClick={() => setScreen(AppScreen.SIGN_IN)}
             className="w-full flex items-center gap-3 p-3 text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
           >
             <LogOut className="w-5 h-5" />
             <span className="font-medium text-sm">{t.logout}</span>
           </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020617] text-slate-900 dark:text-white flex transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-[#020617] border-r border-slate-200 dark:border-white/5 flex flex-col animate-in slide-in-from-left duration-300 shadow-2xl">
                <div className="absolute top-4 right-4">
                     <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10">
                        <X className="w-5 h-5 text-slate-500" />
                     </button>
                </div>
                <SidebarContent />
            </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-r border-slate-200 dark:border-white/5 flex-col hidden lg:flex fixed h-full z-20">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-8">
           <div className="lg:hidden flex items-center gap-3">
              <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10">
                  <Menu className="w-6 h-6 text-slate-900 dark:text-white" />
              </button>
              <Logo className="w-8 h-8" />
           </div>
           
           <div className="hidden lg:block">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.adminConsole}</h1>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                 {t.systemStable}
              </p>
           </div>

           <div className="flex items-center gap-4">
              <LanguageSelector current={lang} onChange={setLang} />
              <ThemeToggle isDark={isDark} toggle={toggleTheme} />
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-white/10">
                 <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Admin User</p>
                    <p className="text-xs text-slate-500">Super Admin</p>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                 </div>
              </div>
           </div>
        </header>

        {/* Tab Content */}
        {activeTab === 'overview' && <AdminOverview t={t} />}
        {activeTab === 'users' && <UserManagement t={t} />}
        {activeTab === 'kyc' && <KYCQueue t={t} />}
        {activeTab === 'withdrawals' && <WithdrawalQueue t={t} />}
        {activeTab === 'fees' && <FeesConfig t={t} />}
        {activeTab === 'security' && <SecurityAudit t={t} />}
      </main>
    </div>
  );
};