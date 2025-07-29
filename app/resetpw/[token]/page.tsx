"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../utility/supabase';
import Head from 'next/head';
import Navbar from "../../navbar/page";
import { motion } from 'framer-motion';

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

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [language, setLanguage] = useState<'en' | 'si'>('en');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

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
      if (event === 'PASSWORD_RECOVERY') {
        // Handle password recovery
        setMessage('Password updated successfully!');
        setMessageType('success');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const translations = {
    en: {
      updatePassword: "Update Password",
      updatePasswordDescription: "Enter your new password below to complete the password reset.",
      backToLogin: "Back to Login",
      passwordUpdated: "Password updated successfully! Redirecting to login...",
      errorUpdating: "Error updating password. Please try again.",
    },
    si: {
      updatePassword: "මුරපදය යාවත්කාලීන කරන්න",
      updatePasswordDescription: "මුරපදය යළි පිහිටුවීම සම්පූර්ණ කිරීමට ඔබගේ නව මුරපදය පහතින් ඇතුළත් කරන්න.",
      backToLogin: "ලොග් වීමට ආපසු යන්න",
      passwordUpdated: "මුරපදය සාර්ථකව යාවත්කාලීන කරන ලදී! පිවිසුමට යළි-යොමු කරමින්...",
      errorUpdating: "මුරපදය යාවත්කාලීන කිරීමේ දෝෂයක්. කරුණාකර නැවත උත්සාහ කරන්න.",
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
    <div className={`relative min-h-screen ${
      isDarkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'
    } overflow-hidden`}>
      <Head>
        <title>Update Password | CeylonMine</title>
        <meta
          name="description"
          content="Update your password for CeylonMine account"
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
              className="text-3xl md:text-4xl font-bold mb-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {t.updatePassword}
            </motion.h1>
            
            <motion.p
              className={`text-lg max-w-3xl mx-auto mb-8 text-center ${
                isDarkMode ? 'opacity-80' : 'opacity-90'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {t.updatePasswordDescription}
            </motion.p>
            
            {/* Supabase Auth UI for Password Update */}
            {typeof window !== 'undefined' && (
              <Auth
                supabaseClient={supabase}
                appearance={appearance}
                view="update_password"
                redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/login` : '/login'}
                localization={{
                  variables: {
                    update_password: {
                      button_label: language === 'si' ? 'මුරපදය යාවත්කාලීන කරන්න' : 'Update password',
                      loading_button_label: language === 'si' ? 'යාවත්කාලීන කරමින්...' : 'Updating...',
                      password_label: language === 'si' ? 'නව මුරපදය' : 'New password',
                      password_input_placeholder: language === 'si' ? 'ඔබගේ නව මුරපදය' : 'Your new password',
                      confirmation_text: language === 'si' ? 'මුරපදය සාර්ථකව යාවත්කාලීන කරන ලදී' : 'Your password has been updated',
                    },
                  },
                }}
              />
            )}
            
            {message && (
              <div className={`mt-4 p-4 rounded-md ${
                messageType === 'success'
                  ? (isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                  : (isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800')
              }`}>
                {message}
              </div>
            )}
            
            <div className="text-center mt-6">
              <a href="/login" className="text-orange-500 hover:text-orange-600 font-medium">
                {t.backToLogin}
              </a>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
} 