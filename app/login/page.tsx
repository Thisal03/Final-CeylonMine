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

export default function LoginPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [language, setLanguage] = useState('en');
  const canvasRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleThemeChange = (event: CustomEvent<{ isDarkMode: boolean }>) => {
      setIsDarkMode(event.detail.isDarkMode);
    };

    const handleLanguageChange = (event: CustomEvent<{ language: string }>) => {
      setLanguage(event.detail.language);
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
      if (event === 'SIGNED_IN' && session?.user) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify({
          id: session.user.id,
          email: session.user.email,
          firstName: session.user.user_metadata?.full_name?.split(' ')[0] || '',
          lastName: session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          username: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
          role: 'miner' // Default role, you can fetch from your users table
        }));
        
        // Dispatch auth change event
        window.dispatchEvent(new CustomEvent('authChange'));
        
        // Redirect to home page
        router.push('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const translations = {
    en: {
      login: "Login",
      email: "Email",
      password: "Password",
      loginButton: "Sign In",
      noAccount: "Don't have an account?",
      signup: "Sign up",
      forgotPassword: "Forgot your password?",
      resetPassword: "Reset Password",
      or: "or",
      continueWithGoogle: "Continue with Google",
      welcomeBack: "Welcome Back",
      loginDescription: "Sign in to your CeylonMine account to access your mining dashboard."
    },
    si: {
      login: "පිවිසුම",
      email: "විද්‍යුත් තැපෑල",
      password: "මුරපදය",
      loginButton: "පිවිසෙන්න",
      noAccount: "ගිණුමක් නැද්ද?",
      signup: "ලියාපදිංචි වන්න",
      forgotPassword: "මුරපදය අමතක වුණාද?",
      resetPassword: "මුරපදය යළි සකස් කරන්න",
      or: "හෝ",
      continueWithGoogle: "Google සමඟ ඉදිරියට",
      welcomeBack: "නැවත සාදරයෙන් පිළිගනිමු",
      loginDescription: "ඔබගේ පතල් උපකරණ පුවරුවට ප්‍රවේශ වීමට ඔබගේ CeylonMine ගිණුමට පිවිසෙන්න."
    }
  };

  const t = translations[language as keyof typeof translations];

  return (
    <div className={`relative min-h-screen ${
      isDarkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'
    } overflow-hidden`}>
      <Head>
        <title>Login | CeylonMine</title>
        <meta
          name="description"
          content="Login to CeylonMine, the digital platform for mining licensing and royalty calculation in Sri Lanka."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="relative z-10 pt-32 pb-16 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md">
          {/* Login Form Card */}
          <motion.div 
            className={`rounded-xl p-8 w-full ${
              isDarkMode ? 'bg-gray-900 bg-opacity-70' : 'bg-white shadow-lg'
            }`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <motion.h1
                className="text-2xl font-bold mb-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                {t.welcomeBack}
              </motion.h1>
              <motion.p
                className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                {t.loginDescription}
              </motion.p>
            </div>

            {/* Supabase Auth UI */}
            <div className="space-y-6">
              {typeof window !== 'undefined' && (
                <Auth
                  supabaseClient={supabase}
                  appearance={{
                    theme: ThemeSupa,
                    variables: {
                      default: {
                        colors: {
                          brand: isDarkMode ? '#f59e0b' : '#ea580c',
                          brandAccent: isDarkMode ? '#d97706' : '#dc2626',
                          brandButtonText: 'white',
                          defaultButtonBackground: isDarkMode ? '#374151' : '#f3f4f6',
                          defaultButtonBackgroundHover: isDarkMode ? '#4b5563' : '#e5e7eb',
                          defaultButtonBorder: isDarkMode ? '#6b7280' : '#d1d5db',
                          defaultButtonText: isDarkMode ? '#f9fafb' : '#374151',
                          dividerBackground: isDarkMode ? '#374151' : '#e5e7eb',
                          inputBackground: isDarkMode ? '#1f2937' : '#ffffff',
                          inputBorder: isDarkMode ? '#4b5563' : '#d1d5db',
                          inputBorderHover: isDarkMode ? '#6b7280' : '#9ca3af',
                          inputBorderFocus: isDarkMode ? '#f59e0b' : '#ea580c',
                          inputText: isDarkMode ? '#f9fafb' : '#111827',
                          inputLabelText: isDarkMode ? '#d1d5db' : '#6b7280',
                          inputPlaceholder: isDarkMode ? '#9ca3af' : '#9ca3af',
                          messageText: isDarkMode ? '#f9fafb' : '#111827',
                          messageTextDanger: isDarkMode ? '#fca5a5' : '#dc2626',
                          anchorTextColor: isDarkMode ? '#f59e0b' : '#ea580c',
                          anchorTextHoverColor: isDarkMode ? '#d97706' : '#dc2626',
                        },
                        space: {
                          inputPadding: '12px',
                          buttonPadding: '12px',
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
                  }}
                  providers={['google']}
                  redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/` : '/'}
                  showLinks={false}
                  view="sign_in"
                  localization={{
                    variables: {
                      sign_in: {
                        email_label: t.email,
                        password_label: t.password,
                        button_label: t.loginButton,
                        loading_button_label: 'Signing in...',
                        social_provider_text: t.continueWithGoogle,
                        link_text: t.noAccount,
                      },
                      sign_up: {
                        email_label: t.email,
                        password_label: t.password,
                        button_label: 'Sign up',
                        loading_button_label: 'Signing up...',
                        social_provider_text: t.continueWithGoogle,
                        link_text: 'Already have an account?',
                      },
                      forgotten_password: {
                        email_label: t.email,
                        button_label: t.resetPassword,
                        loading_button_label: 'Sending reset instructions...',
                        link_text: 'Back to sign in',
                      },
                    },
                  }}
                />
              )}

              {/* Custom Links */}
              <div className="text-center space-y-4 mt-6">
                <Link 
                  href="/sign" 
                  className={`block text-sm hover:underline ${
                    isDarkMode ? 'text-amber-400 hover:text-amber-300' : 'text-orange-600 hover:text-orange-500'
                  }`}
                >
                  {t.noAccount}
                </Link>
                <Link 
                  href="/resetpw" 
                  className={`block text-sm hover:underline ${
                    isDarkMode ? 'text-amber-400 hover:text-amber-300' : 'text-orange-600 hover:text-orange-500'
                  }`}
                >
                  {t.forgotPassword}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Three.js Canvas Background */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none" />
    </div>
  );
}