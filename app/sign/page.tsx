"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from "../navbar/page";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../utility/supabase';

export default function SignupPage() {
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session) => {
      if (event === 'SIGNED_UP' && session?.user) {
        // Create user profile in your users table
        try {
          const { error } = await supabase
            .from('users')
            .insert({
              id: session.user.id,
              email: session.user.email,
              first_name: session.user.user_metadata?.full_name?.split(' ')[0] || '',
              last_name: session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
              username: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
              role: 'miner' // Default role
            });

          if (error) {
            console.error('Error creating user profile:', error);
          }
        } catch (error) {
          console.error('Error creating user profile:', error);
        }

        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify({
          id: session.user.id,
          email: session.user.email,
          firstName: session.user.user_metadata?.full_name?.split(' ')[0] || '',
          lastName: session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          username: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
          role: 'miner'
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
      signup: "Sign Up",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      firstName: "First Name",
      lastName: "Last Name",
      username: "Username",
      signupButton: "Create Account",
      haveAccount: "Already have an account?",
      login: "Sign in",
      or: "or",
      continueWithGoogle: "Continue with Google",
      joinCeylonMine: "Join CeylonMine",
      signupDescription: "Create your account to access the digital mining platform for licensing and royalty calculation.",
      forgotPassword: "Forgot Password?"
    },
    si: {
      signup: "ලියාපදිංචිය",
      email: "විද්‍යුත් තැපෑල",
      password: "මුරපදය",
      confirmPassword: "මුරපදය තහවුරු කරන්න",
      firstName: "මුල් නම",
      lastName: "අවසන් නම",
      username: "පරිශීලක නම",
      signupButton: "ගිණුම සාදන්න",
      haveAccount: "දැනටමත් ගිණුමක් තිබේද?",
      login: "පිවිසෙන්න",
      or: "හෝ",
      continueWithGoogle: "Google සමඟ ඉදිරියට",
      joinCeylonMine: "CeylonMine සමඟ එකතු වන්න",
      signupDescription: "බලපත්‍ර සහ රාජ කාර්ය ගණන් බැලීමේ සඳහා ඩිජිටල් පතල් වේදිකාවට ප්‍රවේශ වීමට ඔබගේ ගිණුම සාදන්න.",
      forgotPassword: "මුරපදය නැත්නම්?"
    }
  };

  const t = translations[language as keyof typeof translations];

  return (
    <div className={`relative min-h-screen ${
      isDarkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'
    } overflow-hidden`}>
      <Head>
        <title>Sign Up | CeylonMine</title>
        <meta
          name="description"
          content="Sign up for CeylonMine, the digital platform for mining licensing and royalty calculation in Sri Lanka."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="relative z-10 pt-32 pb-16 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md">
          {/* Signup Form Card */}
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
                className="text-3xl md:text-4xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                {t.joinCeylonMine}
              </motion.h1>
              <motion.p
                className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                {t.signupDescription}
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
                  view="sign_up"
                  localization={{
                    variables: {
                      sign_in: {
                        email_label: t.email,
                        password_label: t.password,
                        button_label: 'Sign in',
                        loading_button_label: 'Signing in...',
                        social_provider_text: t.continueWithGoogle,
                        link_text: 'Already have an account?',
                      },
                      sign_up: {
                        email_label: t.email,
                        password_label: t.password,
                        button_label: t.signupButton,
                        loading_button_label: 'Creating account...',
                        social_provider_text: t.continueWithGoogle,
                        link_text: t.haveAccount,
                      },
                      forgotten_password: {
                        email_label: t.email,
                        button_label: 'Reset Password',
                        loading_button_label: 'Sending reset instructions...',
                        link_text: 'Back to sign in',
                      },
                    },
                  }}
                />
              )}

              {/* Custom Links */}
              <div className="text-center space-y-4">
                <Link 
                  href="/login" 
                  className={`block text-sm hover:underline ${
                    isDarkMode ? 'text-amber-400 hover:text-amber-300' : 'text-orange-600 hover:text-orange-500'
                  }`}
                >
                  {t.login}
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
