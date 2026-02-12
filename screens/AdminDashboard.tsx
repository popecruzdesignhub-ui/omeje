import React, { useState } from 'react';
import { 
  ShieldAlert, Users, Activity, Settings, LogOut, 
  Search, Bell, AlertTriangle, CheckCircle2, XCircle,
  MoreVertical, Server, Database, FileText, DollarSign,
  Lock, TrendingUp, Menu, ChevronRight, Wallet, CreditCard,
  Ban, Check, RefreshCcw, Eye, Trash2, Unlock, Clock
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
  severity: 'low' | 'medium' | 'high';
}

const SECURITY_LOGS: SecurityLog[] = [
  { id: 1, event: 'Failed Login Attempt', ip: '192.168.1.45', location: 'Moscow, RU', time: '10 mins ago', severity: 'medium' },
  { id: 2, event: 'Large Withdrawal Flagged', ip: '45.22.19.11', location: 'New York, US', time: '1 hour ago', severity: 'high' },
  { id: 3, event: 'Admin Login', ip: '10.0.0.1', location: 'Internal', time: '2 hours ago', severity: 'low' },
  { id: 4, event: 'API Key Generated', ip: '88.12.44.21', location: 'London, UK', time: '3 hours ago', severity: 'low' },
];

const INITIAL_USERS = [
    { id: 1, name: "Alice Freeman", email: "alice@example.com", balance: 12450.00, kyc: "Verified", status: "Active", risk: "Low", lastLogin: "Today, 10:42 AM" },
    { id: 2, name: "Bob Smith", email: "bob@crypto.net", balance: 450.00, kyc: "Pending", status: "Active", risk: "Medium", lastLogin: "Yesterday" },
    { id: 3, name: "Charlie Day", email: "charlie@trade.io", balance: 1200000.00, kyc: "Verified", status: "Locked", risk: "High", lastLogin: "2 days ago" },
    { id: 4, name: "Diana Prince", email: "diana@themyscira.com", balance: 85000.00, kyc: "Verified", status: "Active", risk: "Low", lastLogin: "1 hour ago" },
    { id: 5, name: "Evan Wright", email: "evan@darkweb.net", balance: 0.00, kyc: "Unverified", status: "Banned", risk: "Critical", lastLogin: "Never" },
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

const PENDING_WITHDRAWALS = [
  { id: 'tx_992', user: 'Alice Freeman', amount: '2.5 BTC', address: 'bc1qxy...', risk: 'Low', time: '15m ago' },
  { id: 'tx_993', user: 'Charlie Day', amount: '50,000 USDT', address: '0x71c...', risk: 'High', time: '1h ago' },
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

  const handleFundClick = (user: any) => {
    setSelectedUser(user);
    setFundingModalOpen(true);
  };

  const handleFundSubmit = () => {
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, balance: u.balance + parseFloat(fundAmount) } : u));
    setFundingModalOpen(false);
    setFundAmount('');
    alert(`Successfully credited ${fundAmount} ${fundAsset} to ${selectedUser.name}`);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.userManagement}</h2>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder={t.searchPlaceholder} 
            className="pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-sm w-full sm:w-80 focus:outline-none focus:border-rose-500/50 dark:text-white" 
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl dark:shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-white/5 uppercase text-xs tracking-wider">
              <tr>
                <th className="p-4">{t.userIdentity}</th>
                <th className="p-4">{t.walletBalance}</th>
                <th className="p-4">{t.kycStatus}</th>
                <th className="p-4">{t.status}</th>
                <th className="p-4">{t.risk}</th>
                <th className="p-4 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-white/5">
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Last: {user.lastLogin}</p>
                      </div>
                    </div>
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
                    <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
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
        onClose={() => setFundingModalOpen(false)} 
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
              <Button variant="secondary" onClick={() => setFundingModalOpen(false)}>{t.cancel}</Button>
              <Button onClick={handleFundSubmit} variant="primary" className="bg-emerald-500 hover:bg-emerald-600 border-none text-white shadow-lg shadow-emerald-500/20">
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

const WithdrawalQueue = ({ t }: { t: any }) => (
  <div className="space-y-6 animate-in fade-in">
    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.withdrawalRequests}</h2>
    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-white/5">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">{t.amount}</th>
              <th className="p-4">{t.destination}</th>
              <th className="p-4">{t.risk}</th>
              <th className="p-4 text-right">{t.decision}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {PENDING_WITHDRAWALS.map(tx => (
              <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                <td className="p-4 font-medium text-slate-900 dark:text-white flex flex-col">
                    <span>{tx.user}</span>
                    <span className="text-xs text-slate-500 font-normal">{tx.time}</span>
                </td>
                <td className="p-4 font-mono text-slate-900 dark:text-white text-lg">{tx.amount}</td>
                <td className="p-4">
                    <div className="flex items-center gap-2">
                        <code className="bg-slate-100 dark:bg-black/30 px-2 py-1 rounded text-xs text-slate-600 dark:text-slate-400 font-mono border border-slate-200 dark:border-white/5">{tx.address}</code>
                        <Button variant="ghost" className="h-6 w-6 p-0"><Eye className="w-3 h-3" /></Button>
                    </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold border ${
                      tx.risk === 'High' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/20' : 
                      'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  }`}>
                    {tx.risk} Risk
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 border border-rose-500/20 hover:text-white transition-all">
                        <Ban className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 border border-emerald-500/20 hover:text-white transition-all">
                        <Check className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

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

const SecurityAudit = ({ t }: { t: any }) => (
  <div className="space-y-6 animate-in fade-in">
    <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
      <ShieldAlert className="w-6 h-6 text-rose-500" /> {t.securityAudit}
    </h2>
    <div className="bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 font-mono text-xs h-[500px] overflow-y-auto custom-scrollbar">
      {SECURITY_LOGS.map(log => (
        <div key={log.id} className="flex gap-4 py-2 border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 px-2 rounded">
          <span className="text-slate-500 w-24 shrink-0">{log.time}</span>
          <span className={`w-16 shrink-0 font-bold uppercase ${
            log.severity === 'high' ? 'text-rose-500' : 
            log.severity === 'medium' ? 'text-amber-500' : 'text-emerald-500'
          }`}>{log.severity}</span>
          <span className="text-slate-900 dark:text-white flex-1">{log.event}</span>
          <span className="text-slate-400 w-32 shrink-0">{log.ip}</span>
          <span className="text-slate-500 w-32 shrink-0">{log.location}</span>
        </div>
      ))}
      <div className="text-slate-600 italic py-2">-- End of log stream --</div>
    </div>
  </div>
);

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
                <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 mt-4">
                    <span className="bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">+124 today</span>
                    <span className="text-slate-500">Online: 842</span>
                </div>
            </GlassCard>

            <GlassCard className="relative overflow-hidden border-rose-500/30 bg-rose-500/5 group">
                <div className="absolute top-0 right-0 p-8 bg-rose-500/10 blur-2xl rounded-full group-hover:bg-rose-500/20 transition-all" />
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">{t.pendingActions}</p>
                        <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">5</h3>
                    </div>
                    <div className="p-3 bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400 border border-rose-500/20 animate-pulse">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                </div>
                 <div className="text-xs text-rose-600 dark:text-rose-400 mt-4 font-medium flex gap-3">
                    <span className="underline cursor-pointer hover:text-rose-500 dark:hover:text-rose-300">2 KYC Approvals</span>
                    <span className="underline cursor-pointer hover:text-rose-500 dark:hover:text-rose-300">3 Withdrawals</span>
                </div>
            </GlassCard>
        </div>

        {/* Live System Feed Table */}
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-500" /> {t.liveFeed}
            </h3>
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-white/5 uppercase text-xs">
                        <tr>
                            <th className="p-4">Time</th>
                            <th className="p-4">User</th>
                            <th className="p-4">Action</th>
                            <th className="p-4">Details</th>
                            <th className="p-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {RECENT_ACTIVITY.map(act => (
                            <tr key={act.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                <td className="p-4 text-slate-500 font-mono text-xs">{act.time}</td>
                                <td className="p-4 font-bold text-slate-900 dark:text-white">{act.user}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        act.action === 'Deposit' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                        act.action === 'Withdraw' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                                        act.action === 'System' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                                        'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                    }`}>
                                        {act.action}
                                    </span>
                                </td>
                                <td className="p-4 text-slate-600 dark:text-slate-300">{act.detail}</td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end">
                                         {act.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                         {act.status === 'pending' && <Clock className="w-4 h-4 text-amber-500 animate-pulse" />}
                                         {act.status === 'warning' && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
                <div className="p-3 text-center border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
                    <button className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">View All Activity Log</button>
                </div>
            </div>
        </div>
    </div>
);

// --- Main Admin Layout ---

export const AdminDashboard: React.FC<AdminProps> = ({ setScreen, isDark, toggleTheme, lang, setLang }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020617] text-slate-900 dark:text-white flex transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-[#0B0E14] border-r border-slate-200 dark:border-white/5 hidden lg:flex flex-col fixed h-full z-20 transition-colors duration-300 shadow-xl dark:shadow-none">
        <div className="p-6 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-3">
             <Logo className="w-10 h-10" />
            <div>
              <h1 className="font-bold text-lg leading-tight">Admin</h1>
              <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">Console</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase px-3 mb-2">Management</p>
          <SidebarItem icon={Activity} label={t.overview} active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <SidebarItem icon={Users} label={t.usersAccess} active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
          <SidebarItem icon={CheckCircle2} label={t.kycApprovals} active={activeTab === 'kyc'} onClick={() => setActiveTab('kyc')} badge={2} />
          
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase px-3 mb-2 mt-6">Finance</p>
          <SidebarItem icon={Wallet} label={t.withdrawals} active={activeTab === 'withdrawals'} onClick={() => setActiveTab('withdrawals')} badge={3} />
          <SidebarItem icon={CreditCard} label={t.transactions} active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} />
          <SidebarItem icon={DollarSign} label={t.feeSettings} active={activeTab === 'fees'} onClick={() => setActiveTab('fees')} />
          
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase px-3 mb-2 mt-6">System</p>
          <SidebarItem icon={Lock} label={t.securityLogs} active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
          <SidebarItem icon={Settings} label={t.settings} active={false} onClick={() => {}} />
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-white/5 space-y-3">
           <div className="flex justify-between items-center px-1">
              <ThemeToggle isDark={isDark} toggle={toggleTheme} />
              <LanguageSelector current={lang} onChange={setLang} />
           </div>
          <button 
             onClick={() => setScreen(AppScreen.SIGN_IN)}
             className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
          >
             <LogOut className="w-5 h-5" />
             <span className="font-medium text-sm">{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 px-6 py-4 flex justify-between items-center lg:hidden">
          <div className="flex items-center gap-3">
             <ShieldAlert className="w-6 h-6 text-rose-500" />
             <span className="font-bold">{t.adminConsole}</span>
          </div>
          <button><Menu className="w-6 h-6 text-slate-900 dark:text-white" /></button>
        </header>

        {/* Desktop Header Content (Right Side) */}
        <header className="hidden lg:flex sticky top-0 z-30 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 px-8 py-4 justify-between items-center transition-colors duration-300">
             <h2 className="text-lg font-bold capitalize text-slate-900 dark:text-white">{activeTab.replace('-', ' ')}</h2>
             <div className="flex items-center gap-4">
                 <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-900/50 rounded-full px-4 py-1.5 border border-slate-200 dark:border-white/10">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-300">{t.systemStable}</span>
                 </div>
                 <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full"></span>
                 </button>
                 <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-rose-500/20">AD</div>
             </div>
        </header>

        <main className="p-6 max-w-7xl mx-auto w-full">
           {activeTab === 'overview' && <AdminOverview t={t} />}
           {activeTab === 'users' && <UserManagement t={t} />}
           {activeTab === 'kyc' && <KYCQueue t={t} />}
           {activeTab === 'withdrawals' && <WithdrawalQueue t={t} />}
           {activeTab === 'fees' && <FeesConfig t={t} />}
           {activeTab === 'security' && <SecurityAudit t={t} />}
           {activeTab === 'transactions' && (
              <div className="text-center py-20 text-slate-500">
                  <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Transaction explorer loading...</p>
              </div>
           )}
        </main>
      </div>
    </div>
  );
};