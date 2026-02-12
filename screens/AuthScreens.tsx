import React, { useState } from 'react';
import { Shield, ChevronRight, Mail, Lock, User as UserIcon, Smartphone, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button, Input, GlassCard, Logo } from '../components/UI';
import { AppScreen } from '../types';

interface AuthScreenProps {
  setScreen: (screen: AppScreen) => void;
}

// --- Onboarding Component ---
export const Onboarding: React.FC<AuthScreenProps> = ({ setScreen }) => {
  const [step, setStep] = useState(0);

  const slides = [
    {
      icon: <Logo className="w-20 h-20" />,
      title: "Bank-Grade Security",
      desc: "Your assets are protected by industry-leading encryption and cold storage protocols."
    },
    {
      icon: <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-2xl">$</div>,
      title: "Zero Commission",
      desc: "Trade crypto, stocks, and ETFs with zero hidden fees and lightning-fast execution."
    },
    {
      icon: <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500"><CheckCircle2 className="w-8 h-8" /></div>,
      title: "Real-Time Analytics",
      desc: "Advanced charting and AI-powered insights to help you make smarter moves."
    }
  ];

  return (
    <div className="h-screen w-full flex flex-col items-center justify-between p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-[#020617]">
      <div className="w-full flex justify-end">
        <button onClick={() => setScreen(AppScreen.SIGN_IN)} className="text-sm text-slate-400 font-medium">Skip</button>
      </div>

      <div className="flex flex-col items-center text-center max-w-xs space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="p-6 rounded-3xl bg-white/5 border border-white/5 shadow-2xl backdrop-blur-xl">
          {slides[step].icon}
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-white tracking-tight">{slides[step].title}</h1>
          <p className="text-slate-400 leading-relaxed">{slides[step].desc}</p>
        </div>
      </div>

      <div className="w-full max-w-xs space-y-6">
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-amber-500' : 'w-2 bg-slate-700'}`} />
          ))}
        </div>
        
        <Button onClick={() => {
          if (step < slides.length - 1) setStep(step + 1);
          else setScreen(AppScreen.SIGN_UP);
        }}>
          {step === slides.length - 1 ? 'Get Started' : 'Next'} <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// --- Auth Component (Sign In / Sign Up) ---
export const Auth: React.FC<AuthScreenProps & { isSignUp?: boolean }> = ({ setScreen, isSignUp = false }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (isSignUp) {
        setScreen(AppScreen.VERIFICATION);
      } else {
        // Role Detection Logic: Restored admin@demo.com access
        if (email.toLowerCase() === 'admin@demo.com' || email.toLowerCase() === 'admin@psychologytrade.com') {
          setScreen(AppScreen.ADMIN_DASHBOARD);
        } else {
          setScreen(AppScreen.DASHBOARD);
        }
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#020617]">
      <div className="w-full max-w-md animate-in zoom-in-95 duration-500">
        <div className="mb-8 text-center flex flex-col items-center">
          <Logo className="w-16 h-16 mb-4" onClick={() => setScreen(AppScreen.ONBOARDING)} />
          <h2 className="text-3xl font-bold text-white">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="text-slate-400 mt-2">Enter your details to access your portfolio.</p>
        </div>

        <GlassCard>
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <Input icon={<UserIcon className="w-5 h-5" />} placeholder="Full Name" required />
            )}
            <div className="space-y-1">
              <Input 
                icon={<Mail className="w-5 h-5" />} 
                type="email" 
                placeholder="Email Address" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <Input icon={<Lock className="w-5 h-5" />} type="password" placeholder="Password" required />
            
            {isSignUp && (
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 accent-amber-500" required />
                <p className="text-xs text-slate-400 leading-relaxed">
                  I agree to the <a href="#" className="text-white hover:underline">Terms of Service</a> and <a href="#" className="text-white hover:underline">Privacy Policy</a>.
                </p>
              </div>
            )}
            
            {!isSignUp && (
              <div className="flex justify-end">
                <a href="#" className="text-sm text-amber-500 hover:text-amber-400">Forgot Password?</a>
              </div>
            )}

            <Button type="submit" isLoading={loading}>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>
        </GlassCard>

        <p className="text-center mt-8 text-slate-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => setScreen(isSignUp ? AppScreen.SIGN_IN : AppScreen.SIGN_UP)} className="text-white font-medium hover:text-amber-500 transition-colors">
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

// --- Verification Component ---
export const Verification: React.FC<AuthScreenProps> = ({ setScreen }) => {
  const [code, setCode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);

  const handleInput = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Auto-focus next input
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleVerify = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // New users (signup flow) are always regular users
      setScreen(AppScreen.DASHBOARD);
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#020617]">
      <div className="w-full max-w-md text-center space-y-8 animate-in fade-in duration-500">
        <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-500/20">
          <Smartphone className="w-8 h-8" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-white">Verify it's you</h2>
          <p className="text-slate-400 mt-2">We sent a code to <span className="text-white">+1 234 *** **89</span>. Enter it below to secure your account.</p>
        </div>

        <div className="flex justify-center gap-4">
          {code.map((digit, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInput(i, e.target.value)}
              className="w-14 h-16 rounded-xl bg-white/5 border border-white/10 text-center text-2xl font-bold text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
            />
          ))}
        </div>

        <div className="space-y-4">
          <Button onClick={handleVerify} isLoading={loading}>Verify & Continue</Button>
          <button className="text-sm text-slate-500 hover:text-white transition-colors">Resend Code in 30s</button>
        </div>
      </div>
    </div>
  );
};