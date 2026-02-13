import React, { useState, useEffect } from 'react';
import { AppScreen } from './types';
import { Onboarding, Auth, Verification } from './screens/AuthScreens';
import { MainApp } from './screens/MainApp';
import { AdminDashboard } from './screens/AdminDashboard';
import { Language } from './services/translations';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.ONBOARDING);
  
  // Theme State
  const [isDark, setIsDark] = useState(true);

  // Language State
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    // Apply theme class to html element
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  switch (screen) {
    case AppScreen.ONBOARDING:
      return <Onboarding setScreen={setScreen} />;
    case AppScreen.SIGN_UP:
      return <Auth setScreen={setScreen} isSignUp={true} />;
    case AppScreen.SIGN_IN:
      return <Auth setScreen={setScreen} isSignUp={false} />;
    case AppScreen.VERIFICATION:
      return <Verification setScreen={setScreen} />;
    case AppScreen.DASHBOARD:
      // Pass required props for localization
      return (
        <MainApp 
          setScreen={setScreen} 
          isDark={isDark} 
          toggleTheme={toggleTheme} 
          lang={lang}
          setLang={setLang}
        />
      );
    case AppScreen.ADMIN_DASHBOARD:
      return (
        <AdminDashboard 
          setScreen={setScreen} 
          isDark={isDark} 
          toggleTheme={toggleTheme} 
          lang={lang} 
          setLang={setLang} 
        />
      );
    default:
      return <Onboarding setScreen={setScreen} />;
  }
}