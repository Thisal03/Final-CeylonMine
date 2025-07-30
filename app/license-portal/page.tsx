'use client';

import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../navbar/page';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AuthGuard from '../components/AuthGuard';
import { useRouter } from 'next/navigation';

interface SuccessStory {
  title: string;
  region: string;
  license: string;
  description: string;
  fullCaseStudy: string;
}

interface ThemeChangeEvent extends CustomEvent {
  detail: {
    isDarkMode: boolean;
  };
}

declare global {
  interface WindowEventMap {
    'themeChange': ThemeChangeEvent;
  }
}

export default function LicensePortal() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showCheckStatus, setShowCheckStatus] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  // Initialize theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDarkMode = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    setIsDarkMode(initialDarkMode);

    // Apply theme class to document
    if (initialDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Listen for theme changes from other components
    const handleThemeChange = (event: ThemeChangeEvent) => {
      setIsDarkMode(event.detail.isDarkMode);
      
      // Apply to html element
      if (event.detail.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    window.addEventListener('themeChange', handleThemeChange);
    
    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  // Check user and application status on mount
  useEffect(() => {
    const checkApplication = async () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return;
      const user = JSON.parse(storedUser);
      if (user.role === 'miner') {
        setShowCheckStatus(false);
        return;
      }
      // Fetch application(s) for this user
      const res = await fetch('/api/application/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ miner_id: user.id })
      });
      const data = await res.json();
      if (data && data.applications && data.applications.length > 0) {
        setShowCheckStatus(true);
        setApplicationStatus(data.applications[0]); // or handle multiple
      } else {
        setShowCheckStatus(false);
      }
    };
    checkApplication();
  }, []);

  // Toggle dark/light mode
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);

    // Apply to html element
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Save preference
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');

    // Emit themeChange event for other components
    const event = new CustomEvent('themeChange', { detail: { isDarkMode: newTheme } });
    window.dispatchEvent(event);
  };

  // Licenses data
  const licenses = [
    {
      id: 1,
      name: 'IML Type A License',
      description: 'Standard mining operations license for small-scale projects.',
      features: ['Suitable for operations under 5 hectares', 'Valid for 3 years', 'Basic environmental compliance'],
      path: '/license-portal/type-a',
      color: 'bg-amber-500'
    },
    {
      id: 2,
      name: 'IML Type B License',
      description: 'Advanced license for medium-scale mineral extraction operations.',
      features: ['Operations between 5-20 hectares', 'Valid for 5 years', 'Advanced safety protocols required'],
      path: '/license-portal/type-b',
      color: 'bg-amber-500'
    },
    {
      id: 3,
      name: 'IML Type C License',
      description: 'Comprehensive license for large-scale mining operations.',
      features: ['Operations over 20 hectares', 'Valid for 7 years', 'Full environmental impact assessment required'],
      path: '/license-portal/type-c',
      color: 'bg-amber-500'
    },
    {
      id: 4,
      name: 'IML Type D License',
      description: 'Specialized license for rare minerals and precious metals.',
      features: ['For restricted minerals and metals', 'Valid for 10 years', 'Requires enhanced security measures'],
      path: '/license-portal/type-d',
      color: 'bg-amber-500'
    }
  ];

  return (
    <AuthGuard>
      <div className={`relative min-h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'} overflow-hidden`}>
        <Navbar />
        {/* 3D Background Canvas */}
        <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0" />
        {/* Main Content */}
        <main className="relative z-10 pt-28 pb-16">
          <div className="container mx-auto px-4">
            {/* Hero Section */}
            <div className="flex flex-col items-center justify-center mb-16">
              <motion.h1
                className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight text-center drop-shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                LICENSE PORTAL
              </motion.h1>
              <motion.p
                className="text-lg md:text-2xl max-w-2xl mx-auto text-center font-light mb-2 text-black"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Apply for your mining permits and licenses easily through this portal. Choose the license type that is relevant to you.
              </motion.p>
            </div>

            {/* License Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
              {licenses.map((license, index) => (
                <Link href={license.path} key={license.id} legacyBehavior>
                  <a className="block h-full">
                    <motion.div
                      className={`flex flex-col h-full rounded-2xl overflow-hidden shadow-xl border border-opacity-10 transition-all backdrop-blur-sm ${isDarkMode ? 'bg-gray-900/90 hover:bg-gray-800/95 border-gray-700' : 'bg-white/95 hover:bg-gray-100 border-gray-200'}`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className={`${license.color} h-2 w-full`} />
                      <div className="flex flex-col flex-1 p-8">
                        <h3 className="text-xl md:text-2xl font-bold mb-2 text-amber-600 tracking-tight text-center">
                          {license.name}
                        </h3>
                        <p className={`mb-4 text-center text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{license.description}</p>
                        <ul className={`flex-1 mb-6 space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {license.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-base">
                              <span className="text-green-500 text-lg">✓</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <motion.button 
                          className={`w-full py-3 px-6 rounded-lg text-lg font-semibold shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 ${license.color} text-white hover:scale-105 active:scale-100`}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Apply Now
                        </motion.button>
                      </div>
                    </motion.div>
                  </a>
                </Link>
              ))}
            </div>
          </div>
        </main>
        {/* Footer Section */}
        <footer
          className={`relative z-10 py-8 ${
            isDarkMode ? 'bg-gray-900' : 'bg-gray-800'
          }`}
        >
          <div className="container mx-auto px-4 text-center">
            <p
              className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-300'
              }`}
            >
              &copy; {new Date().getFullYear()} CeylonMine. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </AuthGuard>
  );
}