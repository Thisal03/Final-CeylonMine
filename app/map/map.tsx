"use client";
import Head from 'next/head';
import Map from '../components/map';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Listen for theme changes from navbar
    const handleThemeChange = (event) => {
      setIsDarkMode(event.detail.isDarkMode);
    };

    window.addEventListener('themeChange', handleThemeChange);

    // Get initial theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }

    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-[#1a2942] via-[#111827] to-[#1a2942]' : 'bg-gradient-to-br from-[#f0f4f8] via-[#e0e7ec] to-[#f0f4f8]'} text-${isDarkMode ? 'white' : 'gray-900'}`}>
      <Head>
        <title>Sri Lanka Map</title>
      </Head>
      <Map />
    </div>
  );
}