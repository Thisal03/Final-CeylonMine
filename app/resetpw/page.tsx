"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Navbar from "../navbar/page";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../utility/supabase';
import Link from 'next/link';

interface ThemeChangeEvent extends CustomEvent {
  detail: {
    isDarkMode: boolean;
  };
}

interface LanguageChangeEvent extends CustomEvent {
  detail: {
    language: string;
  };
}

export default function ForgotPasswordPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [language, setLanguage] = useState<'en' | 'si'>('en');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleThemeChange = (event: ThemeChangeEvent) => {
      setIsDarkMode(event.detail.isDarkMode);
    };

    const handleLanguageChange = (event: LanguageChangeEvent) => {
      setLanguage(event.detail.language as 'en' | 'si');
    };

    window.addEventListener('themeChange', handleThemeChange as EventListener);
    window.addEventListener('languageChange', handleLanguageChange as EventListener);

    // Set initial theme based on local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }

    // Set initial language based on local storage
    const savedLang = localStorage.getItem('language');
    if (savedLang === 'si') {
      setLanguage('si');
    } else {
      setLanguage('en');
    }

    return () => {
      window.removeEventListener('themeChange', handleThemeChange as EventListener);
      window.removeEventListener('languageChange', handleLanguageChange as EventListener);
    };
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session) => {
      if (event === 'PASSWORD_RECOVERY' && session?.user) {
        // Handle password recovery success
        console.log('Password recovery successful');
        // Redirect to login page after successful password reset
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const translations = {
    en: {
      resetPassword: "Reset Password",
      resetPasswordDescription: "Enter your email address below and we'll send you a link to reset your password.",
      backToLogin: "Back to Login",
      allRightsReserved: "All rights reserved.",
    },
    si: {
      resetPassword: "මුරපදය යළි සකසන්න",
      resetPasswordDescription: "ඔබගේ විද්‍යුත් තැපැල් ලිපිනය පහතින් ඇතුළත් කරන්න, අපි ඔබට මුරපදය යළි පිහිටුවීම සඳහා සබැඳියක් යවන්නෙමු.",
      backToLogin: "ලොග් වීමට ආපසු යන්න",
      allRightsReserved: "සියලු හිමිකම් ඇවිරිණි.",
    }
  };

  const t = translations[language];

  // Supabase Auth UI appearance configuration
  const appearance = {
    theme: ThemeSupa,
    variables: {
      default: {
        colors: {
          brand: isDarkMode ? '#f97316' : '#ea580c', // Orange color
          brandAccent: isDarkMode ? '#ea580c' : '#dc2626',
          brandButtonText: 'white',
          defaultButtonBackground: isDarkMode ? '#374151' : '#f3f4f6',
          defaultButtonBackgroundHover: isDarkMode ? '#4b5563' : '#e5e7eb',
          defaultButtonBorder: isDarkMode ? '#6b7280' : '#d1d5db',
          defaultButtonText: isDarkMode ? '#f9fafb' : '#374151',
          dividerBackground: isDarkMode ? '#374151' : '#e5e7eb',
          inputBackground: isDarkMode ? '#374151' : '#ffffff',
          inputBorder: isDarkMode ? '#6b7280' : '#d1d5db',
          inputBorderHover: isDarkMode ? '#9ca3af' : '#9ca3af',
          inputBorderFocus: isDarkMode ? '#f97316' : '#ea580c',
          inputText: isDarkMode ? '#f9fafb' : '#111827',
          inputLabelText: isDarkMode ? '#d1d5db' : '#6b7280',
          inputPlaceholder: isDarkMode ? '#9ca3af' : '#9ca3af',
          messageText: isDarkMode ? '#f9fafb' : '#111827',
          messageTextDanger: isDarkMode ? '#fca5a5' : '#dc2626',
          anchorTextColor: isDarkMode ? '#f97316' : '#ea580c',
          anchorTextHoverColor: isDarkMode ? '#ea580c' : '#dc2626',
        },
        space: {
          inputPadding: '12px 16px',
          buttonPadding: '12px 16px',
        },
        fontSizes: {
          baseBodySize: '14px',
          baseInputSize: '14px',
          baseLabelSize: '14px',
          baseButtonSize: '14px',
        },
        fonts: {
          bodyFontFamily: 'Inter, system-ui, sans-serif',
          buttonFontFamily: 'Inter, system-ui, sans-serif',
          inputFontFamily: 'Inter, system-ui, sans-serif',
          labelFontFamily: 'Inter, system-ui, sans-serif',
        },
        borderWidths: {
          buttonBorderWidth: '1px',
          inputBorderWidth: '1px',
        },
        radii: {
          borderRadiusButton: '8px',
          buttonBorderRadius: '8px',
          inputBorderRadius: '8px',
        },
      },
    },
  };

  return (
    <div
      className={`relative min-h-screen ${
        isDarkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'
      } overflow-hidden`}
    >
      <Head>
        <title>Reset Password | CeylonMine</title>
        <meta
          name="description"
          content="Reset your password for CeylonMine account"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="relative z-10 pt-32 pb-16 flex items-center justify-center">
        <div className="container max-w-md mx-auto px-4">
          {/* Form Section */}
          <motion.div 
            className={`rounded-xl p-8 ${
              isDarkMode ? 'bg-gray-900 bg-opacity-70' : 'bg-white shadow-lg'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1
              className="text-2xl font-bold mb-3 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {t.resetPassword}
            </motion.h1>
            
            <motion.p
              className={`text-sm max-w-3xl mx-auto mb-6 text-center ${
                isDarkMode ? 'opacity-80' : 'opacity-90'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {t.resetPasswordDescription}
            </motion.p>
            
            {/* Supabase Auth UI for Password Reset */}
            {typeof window !== 'undefined' && (
              <Auth
                supabaseClient={supabase}
                appearance={appearance}
                view="forgotten_password"
                redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/login` : '/login'}
                showLinks={false}
                localization={{
                  variables: {
                    forgotten_password: {
                      button_label: language === 'si' ? 'යළි පිහිටුවීමේ සබැඳිය යවන්න' : 'Send reset link',
                      loading_button_label: language === 'si' ? 'යවමින්...' : 'Sending...',
                      link_text: language === 'si' ? 'මුරපදය අමතක වුණාද?' : 'Forgot your password?',
                      confirmation_text: language === 'si' ? 'ඔබගේ විද්‍යුත් තැපැල් ලිපිනය පරීක්ෂා කරන්න' : 'Check your email for the reset link',
                      email_label: language === 'si' ? 'විද්‍යුත් තැපැල් ලිපිනය' : 'Email',
                      email_input_placeholder: language === 'si' ? 'ඔබගේ විද්‍යුත් තැපැල් ලිපිනය' : 'Your email address',
                    },
                  },
                }}
              />
            )}
            
            {/* Custom Links */}
            <div className="text-center mt-6">
              <Link 
                href="/login" 
                className={`text-sm hover:underline ${
                  isDarkMode ? 'text-amber-400 hover:text-amber-300' : 'text-orange-600 hover:text-orange-500'
                }`}
              >
                {t.backToLogin}
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}