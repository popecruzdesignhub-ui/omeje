import React from 'react';
import { Loader2, Moon, Sun, Globe } from 'lucide-react';
import { Language } from '../services/translations';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading,
  ...props 
}) => {
  const baseStyles = "relative w-full py-3.5 px-6 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 border border-orange-400/20",
    secondary: "bg-white/10 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10",
    danger: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20",
    ghost: "bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string, icon?: React.ReactNode }> = ({ 
  label, 
  icon,
  className = '', 
  ...props 
}) => (
  <div className="w-full space-y-2">
    {label && <label className="text-sm text-slate-500 dark:text-slate-400 ml-1">{label}</label>}
    <div className="relative group">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 group-focus-within:text-amber-500 transition-colors">{icon}</div>}
      <input 
        className={`w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 ${icon ? 'pl-11' : 'pl-4'} pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all ${className}`}
        {...props}
      />
    </div>
  </div>
);

export const GlassCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`glass-panel p-5 rounded-2xl ${className} ${onClick ? 'cursor-pointer glass-card-hover transition-colors' : ''}`}>
    {children}
  </div>
);

export const Badge: React.FC<{ value: number; type?: 'percent' | 'price' }> = ({ value, type = 'percent' }) => {
  const isPositive = value >= 0;
  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${isPositive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
      {isPositive ? '▲' : '▼'}
      {Math.abs(value).toFixed(2)}{type === 'percent' ? '%' : ''}
    </div>
  );
};

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-slate-900 dark:text-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const Logo: React.FC<{ className?: string, onClick?: () => void }> = ({ className = "w-10 h-10", onClick }) => (
  <div className={`relative ${className} ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
    <img 
      src="https://i.imgur.com/wpi6oXa.png" 
      alt="Psychology Trade"
      className="w-full h-full object-contain"
    />
  </div>
);

// --- New Components for Theme/Lang ---

export const ThemeToggle: React.FC<{ isDark: boolean; toggle: () => void }> = ({ isDark, toggle }) => (
  <button 
    onClick={toggle}
    className="p-2 rounded-full bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-all"
    title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
  >
    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
  </button>
);

export const LanguageSelector: React.FC<{ current: Language; onChange: (l: Language) => void }> = ({ current, onChange }) => {
  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-200 dark:bg-white/5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/10 transition-colors">
        <Globe className="w-4 h-4" />
        <span className="uppercase">{current}</span>
      </button>
      <div className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-[#1e2329] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden hidden group-hover:block z-50">
        {(['en', 'es', 'fr'] as Language[]).map(lang => (
          <button 
            key={lang}
            onClick={() => onChange && onChange(lang)}
            className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/5 transition-colors ${current === lang ? 'text-amber-500' : 'text-slate-700 dark:text-slate-300'}`}
          >
            {lang === 'en' ? 'English' : lang === 'es' ? 'Español' : 'Français'}
          </button>
        ))}
      </div>
    </div>
  )
}