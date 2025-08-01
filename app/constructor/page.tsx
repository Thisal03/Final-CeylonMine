"use client";

import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Navbar from "../navbar/page";
import { motion, useScroll, useTransform } from "framer-motion";
import Cookies from "js-cookie";

interface LicenseData {
  id: number;
  status: string;
  miner_id: string;
  created_at: string;
  expires_at?: string;
}

interface RoyaltyData {
  id: number;
  royalty_with_sscl: number;
  total_amount: number;
  miner_id: string;
  calculation_date: string;
  payment_due_date: string;
}

interface Comment {
  id: number;
  text: string;
  created_at: string;
  miner_id: string;
}

export default function LicensedPage() {
  // Default values
  const userName = "User";
  const dueDate = "March 15, 2025";

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [language, setLanguage] = useState<"en" | "si">("en");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Backend data states
  const [licenseData, setLicenseData] = useState<LicenseData | null>(null);
  const [royaltyData, setRoyaltyData] = useState<RoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Announcements state and loading/error indicators
  const [announcements, setAnnouncements] = useState<Comment[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [announcementsError, setAnnouncementsError] = useState<string | null>(
    null
  );

  // Add userRole state
  const [userRole, setUserRole] = useState<string>("public");

  // Fetch license, royalty, and user role data from new backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user ID from localStorage (client-side only) - match navbar pattern
        let userId: string | null = null;
        if (typeof window !== "undefined") {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              userId = userData.id;
            } catch (e) {
              console.error('Error parsing user data from localStorage:', e);
            }
          }
        }
        if (!userId) {
          throw new Error("User ID not found in localStorage");
        }

        // Fetch from new API route
        const response = await fetch(`/api/constructor?user_id=${userId}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API returned ${response.status}: ${errorText}`);
        }
        const data = await response.json();

        // Set user role
        const userRole = data.user?.role || "public";
        setUserRole(userRole);

        // Set license and royalty data
        setLicenseData(data.license || null);
        setRoyaltyData(data.royalty || null);
        
        // Set announcements data from comments
        setAnnouncements(data.comments || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLicenseData(null);
        setRoyaltyData(null);
        setAnnouncements([]);
      } finally {
        setLoading(false);
        setAnnouncementsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Theme and language event listeners
  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      setIsDarkMode(event.detail.isDarkMode);
    };

    const handleLanguageChange = (event: CustomEvent) => {
      setLanguage(event.detail.language);
    };

    window.addEventListener("themeChange", handleThemeChange as EventListener);
    window.addEventListener(
      "languageChange",
      handleLanguageChange as EventListener
    );

    // Set initial theme based on local storage or system preference
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }

    // Set initial language based on local storage
    const savedLang = localStorage.getItem("language");
    if (savedLang === "si") {
      setLanguage("si");
    } else {
      setLanguage("en");
    }

    return () => {
      window.removeEventListener(
        "themeChange",
        handleThemeChange as EventListener
      );
      window.removeEventListener(
        "languageChange",
        handleLanguageChange as EventListener
      );
    };
  }, []);

  // Scroll animations
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  const translations = {
    en: {
      welcome: "Welcome!",
      description:
        "Here is your current mining license and royalty information.",
      royaltyAmount: "Royalty Amount Due",
      dueBy: "Due by",
      status: "License Status",
      active: "Active",
      licenseNumber: "License #",
      expires: "Expires",
      additionalDocuments: "Additional Documents",
      attachDescription:
        "Attach any additional documents or reports required for processing your license application.",
      fileDescription: "Document Description",
      attachFile: "Attach File",
      submit: "Submit",
      attachedDocuments: "Attached Documents",
      noAttachments: "No documents attached yet.",
      downloadFile: "Download",
      recentActivity: "Announcements",
      allRightsReserved: "All rights reserved.",
      inactive: "Inactive",
    },
    si: {
      welcome: "සාදරයෙන් පිළිගනිමු!",
      description: "මෙහි ඔබගේ වත්මන් පතල් බලපත්‍ර සහ රාජ්‍ය මුදල් තොරතුරු ඇත.",
      royaltyAmount: "ගෙවිය යුතු රාජ්‍ය මුදල් ප්‍රමාණය",
      dueBy: "ගෙවීමට නියමිත දිනය",
      status: "බලපත්‍ර තත්ත්වය",
      active: "සක්‍රියයි",
      licenseNumber: "බලපත්‍ර අංකය",
      expires: "කල් ඉකුත් වන දිනය",
      additionalDocuments: "අතිරේක ලේඛන",
      attachDescription:
        "ඔබගේ බලපත්‍ර අයදුම්පත සැකසීම සඳහා අවශ්‍ය ඕනෑම අතිරේක ලේඛන හෝ වාර්තා අමුණන්න.",
      fileDescription: "ලේඛන විස්තරය",
      attachFile: "ලේඛනය අමුණන්න",
      submit: "ඉදිරිපත් කරන්න",
      attachedDocuments: "අමුණා ඇති ලේඛන",
      noAttachments: "තවමත් ලේඛන අමුණා නැත.",
      downloadFile: "බාගන්න",
      recentActivity: "මෑත ප්‍රකාශන",
      allRightsReserved: "සියලු හිමිකම් ඇවිරිණි.",
      inactive: "සක්‍රිය නොවේ",
    },
  };

  const t = translations[language];

  return (
    <div
      className={`relative min-h-screen ${
        isDarkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'
      } overflow-hidden`}
      ref={scrollRef}
    >
      <Head>
        <title>Constructor Dashboard | CeylonMine</title>
        <meta
          name="description"
          content="Constructor Dashboard for CeylonMine's digital platform for mining licensing and royalty calculation in Sri Lanka."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="relative z-10 pt-32 pb-16">
        <div className="container mx-auto px-4 space-y-12">
          {/* Hero Section */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Welcome! to CeylonMine
            </motion.h1>
            <motion.p
              className={`text-lg md:text-xl max-w-3xl mx-auto ${
                isDarkMode ? 'opacity-80' : 'opacity-90'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Here is your current mining license and royalty information.
            </motion.p>
          </motion.div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Royalty Amount Card */}
            <motion.div
              className={`rounded-xl p-8 ${
                isDarkMode ? 'bg-gray-900 bg-opacity-70' : 'bg-white shadow-lg'
              } shadow-xl overflow-hidden relative`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{
                y: -5,
                boxShadow: isDarkMode
                  ? "0 15px 30px rgba(251, 191, 36, 0.1)"
                  : "0 15px 30px rgba(249, 115, 22, 0.15)",
              }}
            >
              <div
                className={`text-4xl mb-4 p-3 inline-block rounded-full ${
                  isDarkMode
                    ? "bg-gray-800/70 text-amber-400"
                    : "bg-orange-100/90 text-orange-500"
                } shadow-inner`}
              >
                💰
              </div>
              <h3
                className={`text-xl font-bold mb-3 ${
                  isDarkMode ? "text-amber-300" : "text-orange-700"
                }`}
              >
                {t.royaltyAmount}
              </h3>
              <p
                className={`text-4xl font-bold ${
                  isDarkMode ? "text-amber-500" : "text-orange-500"
                }`}
              >
                {loading
                  ? " Loading..."
                  : royaltyData
                  ? "LKR " + royaltyData.royalty_with_sscl.toLocaleString()
                  : "LKR 0.00"}
              </p>
              {error && (
                <p
                  className={`mt-2 text-sm ${
                    isDarkMode ? "text-red-400" : "text-red-600"
                  }`}
                >
                  {error}
                </p>
              )}
              <p
                className={`mt-2 ${
                  isDarkMode ? "text-amber-300/80" : "text-orange-700/90"
                }`}
              >
                {t.dueBy}: {royaltyData?.payment_due_date || "N/A"}
              </p>
            </motion.div>

            {/* License Status Card */}
            <motion.div
              className={`rounded-xl p-8 ${
                isDarkMode ? 'bg-gray-900 bg-opacity-70' : 'bg-white shadow-lg'
              } shadow-xl overflow-hidden relative`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{
                y: -5,
                boxShadow: isDarkMode
                  ? "0 15px 30px rgba(251, 191, 36, 0.1)"
                  : "0 15px 30px rgba(249, 115, 22, 0.15)",
              }}
            >
              <div
                className={`text-4xl mb-4 p-3 inline-block rounded-full ${
                  isDarkMode
                    ? "bg-gray-800/70 text-amber-400"
                    : "bg-orange-100/90 text-orange-500"
                } shadow-inner`}
              >
                📄
              </div>
              <h3
                className={`text-xl font-bold mb-3 ${
                  isDarkMode ? "text-amber-300" : "text-orange-700"
                }`}
              >
                {t.status}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`inline-block w-3 h-3 rounded-full ${
                    loading
                      ? "bg-yellow-500"
                      : licenseData?.status === "active"
                      ? "bg-green-500"
                      : "bg-red-500"
                  } shadow-sm animate-pulse`}
                ></span>
                <p
                  className={`text-lg font-medium ${
                    loading
                      ? "text-yellow-500"
                      : licenseData?.status === "active"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {loading
                    ? "Loading..."
                    : licenseData?.status || (userRole === "miner" ? t.inactive : t.active)}
                </p>
              </div>
              <p
                className={`mt-2 ${
                  isDarkMode ? "text-amber-300/80" : "text-orange-700/90"
                }`}
              >
                {t.licenseNumber}: {loading ? "Loading..." : licenseData?.id || "N/A"}
              </p>
              <p
                className={`${
                  isDarkMode ? "text-amber-300/80" : "text-orange-700/90"
                }`}
              >
                {t.expires}: {loading ? "Loading..." : licenseData?.expires_at || "N/A"}
              </p>
              {error && (
                <p
                  className={`mt-2 text-sm ${
                    isDarkMode ? "text-red-400" : "text-red-600"
                  }`}
                >
                  {error}
                </p>
              )}
            </motion.div>
          </div>

          {/* Recent Announcements Section */}
          <motion.div 
            className={`rounded-xl p-8 ${
              isDarkMode ? 'bg-gray-900 bg-opacity-70' : 'bg-white shadow-lg'
            } shadow-xl overflow-hidden relative mb-8`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3
              className={`text-2xl font-bold mb-6 ${
                isDarkMode ? "text-amber-500" : "text-orange-600"
              }`}
            >
              {t.recentActivity}
            </h3>

            {announcementsLoading ? (
              <p className="text-sm">Loading announcements...</p>
            ) : announcementsError ? (
              <p
                className={`text-sm ${
                  isDarkMode ? "text-red-400" : "text-red-600"
                }`}
              >
                {announcementsError}
                <br />
                <small>Check console for details</small>
              </p>
            ) : announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <motion.div
                    key={announcement.id || Math.random()}
                    className={`flex items-center p-3 rounded-lg ${
                      isDarkMode
                        ? "bg-gray-800/50 hover:bg-gray-800/80"
                        : "bg-orange-50/80 hover:bg-orange-50"
                    } transition-colors duration-300`}
                    whileHover={{ x: 5 }}
                  >
                    <div
                      className={`p-3 rounded-full mr-4 ${
                        isDarkMode
                          ? "bg-gray-900/70 text-amber-400"
                          : "bg-white/70 text-orange-500"
                      }`}
                    >
                      🗣️
                    </div>
                    <div className="flex-grow">
                      <p
                        className={`font-medium ${
                          isDarkMode ? "text-amber-300" : "text-orange-700"
                        }`}
                      >
                        {announcement.text}
                      </p>
                      {announcement.created_at && (
                        <p
                          className={`text-sm ${
                            isDarkMode
                              ? "text-amber-300/70"
                              : "text-orange-700/80"
                          }`}
                        >
                          {new Date(
                            announcement.created_at
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm italic opacity-70">
                No announcements available.
              </p>
            )}
          </motion.div>
        </div>
      </main>

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
            &copy; {new Date().getFullYear()} CeylonMine. {t.allRightsReserved}
          </p>
        </div>
      </footer>

      {/* 3D Background */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none"
      />
    </div>
  );
}