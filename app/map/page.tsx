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

  // Three.js background effect
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
    const particlesCount = 5000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 5;
    }
    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.004,
      color: isDarkMode ? 0xd2b48c : 0xffd700,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
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
    window.addEventListener("themeChange", themeChangeListener);

    return () => {
      document.removeEventListener("mousemove", onDocumentMouseMove);
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("themeChange", themeChangeListener);
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, [isDarkMode]);

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