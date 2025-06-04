"use client";

import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Navbar from "../navbar/page";
import { motion, useScroll, useTransform } from "framer-motion";
import * as THREE from "three";
import Cookies from "js-cookie";

interface LicenseData {
  license_status: string;
  license_number: string;
  active_date: string;
  period_of_validation: string;
  expires: string;
}

interface RoyaltyData {
  royalty_amount_due: number;
}

interface Announcement {
  content: string;
  id?: number;
  created_at?: string;
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
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [announcementsError, setAnnouncementsError] = useState<string | null>(
    null
  );

  // Fetch license and royalty data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user ID from cookies
        const userId = Cookies.get("id");
        if (!userId) {
          throw new Error("User ID not found in cookies");
        }

        console.log("Fetching data for user ID:", userId);

        // Base URL for API
        const baseUrl = "https://web-production-28de.up.railway.app";

        // Set headers for all requests - don't include Cookie in headers
        const headers = {
          "X-User-ID": userId,
          "Content-Type": "application/json",
        };

        try {
          // Fetch license data with proper error handling
          console.log("Fetching license data...");
          const licenseResponse = await fetch(
            `${baseUrl}/miner/license?user_id=${userId}`,
            {
              method: "GET",
              headers,
            }
          );

          console.log("License response status:", licenseResponse.status);

          if (!licenseResponse.ok) {
            const errorText = await licenseResponse.text();
            console.error("License error response:", errorText);
            throw new Error(
              `License API returned ${licenseResponse.status}: ${errorText}`
            );
          }

          const licenseData = await licenseResponse.json();
          console.log("License data:", licenseData);
          setLicenseData(licenseData);

          // Fetch royalty data with proper error handling
          console.log("Fetching royalty data...");
          const royaltyResponse = await fetch(
            `${baseUrl}/miner/royalty?user_id=${userId}`,
            {
              method: "GET",
              headers,
            }
          );

          console.log("Royalty response status:", royaltyResponse.status);

          if (!royaltyResponse.ok) {
            const errorText = await royaltyResponse.text();
            console.error("Royalty error response:", errorText);
            throw new Error(
              `Royalty API returned ${royaltyResponse.status}: ${errorText}`
            );
          }

          const royaltyData = await royaltyResponse.json();
          console.log("Royalty data:", royaltyData);
          setRoyaltyData(royaltyData);
        } catch (fetchError) {
          console.error("API fetch error:", fetchError);

          // If the API fails, use mock data for demonstration
          setLicenseData({
            license_status: "Active",
            license_number: `EXP-${userId}-2023`,
            active_date: "2023-01-01",
            period_of_validation: "2 years",
            expires: "2025-01-01",
          });

          setRoyaltyData({
            royalty_amount_due: 12500,
          });

          setError(
            `Could not fetch from API: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}. Using mock data.`
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error in fetchData:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch announcements from backend
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setAnnouncementsLoading(true);
        setAnnouncementsError(null);

        // Get user ID from cookies
        const userId = Cookies.get("id");
        if (!userId) {
          throw new Error("User ID not found in cookies");
        }
        console.log("Fetching announcements for userId:", userId);

        // Base URL for API
        const baseUrl = "https://web-production-28de.up.railway.app";

        try {
          // Use /miner endpoint for announcements with proper error handling
          console.log("Fetching announcements...");
          const response = await fetch(
            `${baseUrl}/miner/announcements?user_id=${userId}`,
            {
              method: "GET",
              headers: {
                "X-User-ID": userId,
                "Content-Type": "application/json",
              },
            }
          );

          console.log("Announcements response status:", response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error("Announcements error response:", errorText);
            throw new Error(
              `Announcements API returned ${response.status}: ${errorText}`
            );
          }

          const data = await response.json();
          console.log("Raw announcements data:", data);

          // Transform data to match the expected format if needed
          const formattedAnnouncements = Array.isArray(data)
            ? data.map((item) => ({
                content: item.text || "",
                created_at:
                  item.date || item.created_at || new Date().toISOString(),
                id: Math.random(), // Generate random ID if not provided
              }))
            : [];

          setAnnouncements(formattedAnnouncements);
        } catch (fetchError) {
          console.error("API fetch error:", fetchError);

          // If the API fails, use mock announcements for demonstration
          setAnnouncements([
            {
              content:
                "Welcome to CeylonMine! Your mining license is being processed.",
              created_at: new Date().toISOString(),
              id: 1,
            },
            {
              content:
                "Please check your email for important updates about your application.",
              created_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
              id: 2,
            },
          ]);

          setAnnouncementsError(
            `Could not fetch from API: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}. Using mock data.`
          );
        }
      } catch (err) {
        console.error("Error in fetchAnnouncements:", err);
        setAnnouncementsError(
          err instanceof Error ? err.message : "An error occurred"
        );
        setAnnouncements([]); // Set empty array on error
      } finally {
        setAnnouncementsLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

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

  // Three.js Sand (Particle) Effect
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 8000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 5;
    }
    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.005,
      color: isDarkMode ? 0xd2b48c : 0xffd700, // Sand color
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(
      particlesGeometry,
      particlesMaterial
    );
    scene.add(particlesMesh);

    camera.position.z = 2;

    let mouseX = 0;
    let mouseY = 0;

    function onDocumentMouseMove(event: MouseEvent) {
      mouseX = (event.clientX - window.innerWidth / 2) / 100;
      mouseY = (event.clientY - window.innerHeight / 2) / 100;
    }
    document.addEventListener("mousemove", onDocumentMouseMove);

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", onWindowResize);

    const animate = () => {
      requestAnimationFrame(animate);
      particlesMesh.rotation.x += 0.0002 + mouseY * 0.0002;
      particlesMesh.rotation.y += 0.0002 + mouseX * 0.0002;
      renderer.render(scene, camera);
    };
    animate();

    const updateParticleColor = () => {
      particlesMaterial.color.set(isDarkMode ? 0xd2b48c : 0xffd700);
    };

    const themeChangeListener = () => {
      updateParticleColor();
    };
    window.addEventListener(
      "themeChange",
      themeChangeListener as EventListener
    );

    return () => {
      document.removeEventListener("mousemove", onDocumentMouseMove);
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener(
        "themeChange",
        themeChangeListener as EventListener
      );
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, [isDarkMode]);

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
      licenseStatus: "License Status",
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
    },
    si: {
      welcome: "සාදරයෙන් පිළිගනිමු!",
      description: "මෙහි ඔබගේ වත්මන් පතල් බලපත්‍ර සහ රාජ්‍ය මුදල් තොරතුරු ඇත.",
      royaltyAmount: "ගෙවිය යුතු රාජ්‍ය මුදල් ප්‍රමාණය",
      dueBy: "ගෙවීමට නියමිත දිනය",
      licenseStatus: "බලපත්‍ර තත්ත්වය",
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
    },
  };

  const t = translations[language];

  return (
    <div
      className={`relative min-h-screen ${
        isDarkMode ? "bg-black text-white" : "bg-orange-50 text-gray-900"
      } overflow-hidden`}
      ref={scrollRef}
    >
      <Head>
        <title>Licensed Dashboard | CeylonMine</title>
        <meta
          name="description"
          content="Licensed Dashboard for CeylonMine's digital platform for mining licensing and royalty calculation in Sri Lanka."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="relative z-10 pt-32 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <motion.h1
              className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-4 ${
                isDarkMode ? "text-amber-500" : "text-orange-600"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              style={{ scale }}
            >
              {t.welcome} to CeylonMine
            </motion.h1>
            <motion.p
              className={`text-lg md:text-xl max-w-3xl mx-auto ${
                isDarkMode ? "text-amber-300/90" : "text-orange-700/90"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {t.description}
            </motion.p>
          </div>

          {/* Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Royalty Amount Card */}
            <motion.div
              className={`rounded-xl p-8 ${
                isDarkMode
                  ? "bg-gray-900/80 backdrop-blur-md border border-amber-500/30"
                  : "bg-white/90 backdrop-blur-md border border-orange-200 shadow-orange-200/30"
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
                className={`absolute top-0 left-0 w-full h-1 ${
                  isDarkMode
                    ? "bg-gradient-to-r from-amber-500 to-amber-300/50"
                    : "bg-gradient-to-r from-orange-500 to-orange-300/50"
                }`}
              ></div>
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
                $
                {loading
                  ? "Loading..."
                  : royaltyData
                  ? royaltyData.royalty_amount_due.toLocaleString()
                  : "0.00"}
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
                {t.dueBy}: {dueDate}
              </p>
            </motion.div>

            {/* License Status Card */}
            <motion.div
              className={`rounded-xl p-8 ${
                isDarkMode
                  ? "bg-gray-900/80 backdrop-blur-md border border-amber-500/30"
                  : "bg-white/90 backdrop-blur-md border border-orange-200 shadow-orange-200/30"
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
                className={`absolute top-0 left-0 w-full h-1 ${
                  isDarkMode
                    ? "bg-gradient-to-r from-amber-500 to-amber-300/50"
                    : "bg-gradient-to-r from-orange-500 to-orange-300/50"
                }`}
              ></div>
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
                {t.licenseStatus}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`inline-block w-3 h-3 rounded-full ${
                    loading ? "bg-yellow-500" : "bg-green-500"
                  } shadow-sm ${
                    loading ? "shadow-yellow-500/50" : "shadow-green-500/50"
                  } animate-pulse`}
                ></span>
                <p
                  className={`text-lg font-medium ${
                    loading ? "text-yellow-500" : "text-green-500"
                  }`}
                >
                  {loading
                    ? "Loading..."
                    : licenseData?.license_status || t.active}
                </p>
              </div>
              <p
                className={`mt-2 ${
                  isDarkMode ? "text-amber-300/80" : "text-orange-700/90"
                }`}
              >
                {t.licenseNumber}:{" "}
                {loading ? "Loading..." : licenseData?.license_number || "N/A"}
              </p>
              <p
                className={`${
                  isDarkMode ? "text-amber-300/80" : "text-orange-700/90"
                }`}
              >
                {t.expires}:{" "}
                {loading ? "Loading..." : licenseData?.expires || "N/A"}
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
              isDarkMode
                ? "bg-gray-900/80 backdrop-blur-md border border-amber-500/30"
                : "bg-white/90 backdrop-blur-md border border-orange-200 shadow-orange-200/30"
            } shadow-xl overflow-hidden relative mb-8`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div
              className={`absolute top-0 left-0 w-full h-1 ${
                isDarkMode
                  ? "bg-gradient-to-r from-amber-500 to-amber-300/50"
                  : "bg-gradient-to-r from-orange-500 to-orange-300/50"
              }`}
            ></div>
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
                        {announcement.content}
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
          isDarkMode ? "bg-gray-900/95" : "bg-gray-800/95"
        } backdrop-blur-sm`}
      >
        <div className="container mx-auto px-4 text-center">
          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-300"
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