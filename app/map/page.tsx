"use client";

import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Navbar from "../navbar/page";
import { useScroll } from "framer-motion";
import * as THREE from "three";

// Import the Map component - use type assertion to fix type issues
import MapComponent from "./map";
const Map = MapComponent as React.ComponentType<{ isDarkMode: boolean }>;

// Add MapDetails component
interface MapDetailsProps {
  isDarkMode: boolean;
}

const MapDetails: React.FC<MapDetailsProps> = ({ isDarkMode }) => {
  return (
    <div className={`container mx-auto px-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
      <h2 className="text-2xl font-bold mb-4">Mining Details</h2>
      <p className="mb-4">Information about mining activities in Sri Lanka.</p>
      {/* Add more details as needed */}
    </div>
  );
};

export default function MapPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<"map" | "details">("map");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Handle theme change from navbar
  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      setIsDarkMode(event.detail.isDarkMode);
    };

    window.addEventListener("themeChange", handleThemeChange as EventListener);

    return () => {
      window.removeEventListener(
        "themeChange",
        handleThemeChange as EventListener
      );
    };
  }, []);

  // Initialize scroll ref for future use
  useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  });

  return (
    <div
      className={`relative min-h-screen ${
        isDarkMode ? "bg-black text-white" : "bg-gray-50 text-gray-900"
      } overflow-hidden`}
      ref={scrollRef}
    >
      <Head>
        <title>Sri Lanka Mining Map</title>
        <meta
          name="description"
          content="Explore Sri Lanka's mining activities with an interactive map and detailed information."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      
      
      {/* Content Container */}
      <div className="relative z-10 pt-32 pb-16">
        {/* Render Map or MapDetails based on activeTab */}
        {activeTab === "map" ? (
          <Map isDarkMode={isDarkMode} />
        ) : (
          <MapDetails isDarkMode={isDarkMode} />
        )}
      </div>

      {/* Three.js Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0" />

      <footer
      className={`relative z-10 py-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-800'}`}
    >
        <div className="container mx-auto px-4 text-center">
          <p
            className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-300'}`}
          >
            &copy; {new Date().getFullYear()} CeylonMine. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}