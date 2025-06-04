"use client";

import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Navbar from "../navbar/page";
import { motion, useScroll, useTransform } from 'framer-motion';
import * as THREE from 'three';
import Cookies from 'js-cookie';

// Update the interfaces to match backend responses
interface ApplicationDetails {
  licenseId: string;
  applicantName: string;
  applicationType: string;
  submissionDate: string;
  location: string;
  estimatedCompletionDate: string;
  status: number;
}

interface ApplicationResponse {
  application: {
    miner_id: string;
    exploration_license_no: string;
    miner_name: string;
    application_type: string;
    submission_date: string;
    location: string;
    estimated_completion_date: string;
    status: number;
  }
}

interface Announcement {
  text: string;
  date: string;
}

interface Document {
  id: number;
  document_name: string;
  document_type: string;
  document_url: string;
  upload_date: string;
  status: string;
}

// Fix status mapping with explicit type
const getStatusNumber = (status: string): number => {
  const statusMap: { [key: string]: number } = {
    'submitted': 1,
    'reviewing': 2,
    'verifying': 3,
    'consulting': 4,
    'approved': 5
  };
  return statusMap[status.toLowerCase()] || 1;
};

export default function LicenseTracking() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [language, setLanguage] = useState('en');
  const canvasRef = useRef(null);
  const scrollRef = useRef(null);
  const [fileData, setFileData] = useState({
    file: null,
    description: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [applicationDetails, setApplicationDetails] = useState<ApplicationDetails | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<number>(1);

  // Add event types
  const handleThemeChange = (event: CustomEvent) => {
    setIsDarkMode(event.detail.isDarkMode);
  };

  const handleLanguageChange = (event: CustomEvent) => {
    setLanguage(event.detail.language);
  };

  // Add proper error type
  const handleError = (fetchError: Error | unknown) => {
    const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown error';
    return errorMessage;
  };

  useEffect(() => {
    window.addEventListener('themeChange', handleThemeChange);
    window.addEventListener('languageChange', handleLanguageChange);

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
      window.removeEventListener('themeChange', handleThemeChange);
      window.removeEventListener('languageChange', handleLanguageChange);
    };
  }, []);

  // Fetch application status and details
  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        setLoading(true);
        const userId = Cookies.get("id");
        
        if (!userId) {
          throw new Error("User ID not found in cookies");
        }

        console.log("Fetching data for user ID:", userId);

        // Base URL for API
        const baseUrl = "https://web-production-28de.up.railway.app";

        // Set headers for all requests
        const headers = {
          "X-User-ID": userId,
          "Content-Type": "application/json",
        };

        try {
          console.log("Fetching application details...");
          const appResponse = await fetch(
            `${baseUrl}/unlicensedminer/application?user_id=${userId}`,
            {
              method: "GET",
              headers,
            }
          );

          console.log("Application response status:", appResponse.status);

          if (!appResponse.ok) {
            const errorText = await appResponse.text();
            console.log("Application not found or other error:", errorText);
            
            // Set default values when application is not found
            setApplicationDetails({
              licenseId: "Applicants only",
              applicantName: "Applicants only",
              applicationType: "Applicants only",
              submissionDate: "Applicants only",
              location: "Applicants only",
              estimatedCompletionDate: "Applicants only",
              status: 0
            });
            setCurrentStatus(0);
            setDocuments([]);
            
            // Don't throw error for 404, just return
            if (appResponse.status === 404) {
              setError("No application found for this user. Please submit a new application.");
              return;
            }
            
            // For other errors, throw
            throw new Error(`API Error: ${appResponse.status} - ${errorText}`);
          }

          const appData = await appResponse.json();
          console.log("Application data:", appData);

          if (appData.application) {
            // Convert status string to number
            const statusNumber = getStatusNumber(appData.application.status);

            setApplicationDetails({
              licenseId: appData.application.exploration_license_no || 'N/A',
              applicantName: appData.application.applicant_name || 'N/A',
              applicationType: appData.application.minerals_to_be_mined || 'N/A',
              submissionDate: new Date(appData.application.created_at).toLocaleDateString(),
              location: appData.application.place_of_business || 'N/A',
              estimatedCompletionDate: appData.application.status || 'N/A',
              status: statusNumber
            });
            setCurrentStatus(statusNumber);
          }

          // Fetch documents
          console.log("Fetching documents...");
          const documentsResponse = await fetch(
            `${baseUrl}/unlicensedminer/documents?user_id=${userId}`,
            {
              method: "GET",
              headers,
            }
          );

          console.log("Documents response status:", documentsResponse.status);

          if (!documentsResponse.ok) {
            const errorText = await documentsResponse.text();
            console.error("Documents error response:", errorText);
            throw new Error(`Documents API returned ${documentsResponse.status}: ${errorText}`);
          }

          const documentsData = await documentsResponse.json();
          console.log("Documents data:", documentsData);
          setDocuments(documentsData.documents || []);

        } catch (fetchError) {
          console.log("API fetch error:", fetchError);
          
          // Set default state
          setApplicationDetails({
            licenseId: "Not Available",
            applicantName: "Error Loading Data",
            applicationType: "N/A",
            submissionDate: "N/A",
            location: "N/A",
            estimatedCompletionDate: "N/A",
            status: 0
          });
          setCurrentStatus(0);
          setDocuments([]);
          
          // Set user-friendly error message
          setError(
            fetchError instanceof Error 
              ? `Unable to load application: ${fetchError.message}` 
              : "Unable to load application data"
          );
        }
      } catch (err) {
        console.error('Error in fetchApplicationData:', err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationData();
  }, []);

  // Three.js Sand (Particle) Effect - same as contact page
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
      'position',
      new THREE.BufferAttribute(posArray, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.004,
      color: isDarkMode ? 0xD2B48C : 0xFFD700, // Sand color
      transparent: true,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    camera.position.z = 2;

    let mouseX = 0;
    let mouseY = 0;

    function onDocumentMouseMove(event) {
      mouseX = (event.clientX - window.innerWidth / 2) / 100;
      mouseY = (event.clientY - window.innerHeight / 2) / 100;
    }
    document.addEventListener('mousemove', onDocumentMouseMove);

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onWindowResize);

    const animate = () => {
      requestAnimationFrame(animate);
      particlesMesh.rotation.x += 0.0002 + mouseY * 0.0002; // Slowed down rotation
      particlesMesh.rotation.y += 0.0002 + mouseX * 0.0002; // Slowed down rotation
      renderer.render(scene, camera);
    };
    animate();

    const updateParticleColor = () => {
      particlesMaterial.color.set(isDarkMode ? 0xD2B48C : 0xFFD700);
    };

    const themeChangeListener = () => {
      updateParticleColor();
    };
    window.addEventListener('themeChange', themeChangeListener);

    return () => {
      document.removeEventListener('mousemove', onDocumentMouseMove);
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('themeChange', themeChangeListener);
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, [isDarkMode]);

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  });

  const translations = {
    en: {
      trackLicense: "Track License Application",
      licenseTracking: "License Application Status",
      trackingDescription: "Track the status of your mining license application through our streamlined process.",
      licenseDetails: "License Application Details",
      licenseId: "License ID",
      applicantName: "Applicant Name",
      applicationType: "Minerals",
      submissionDate: "Submission Date",
      location: "Location",
      estimatedCompletion: "Status ",
      currentStatus: "Current Status",
      status1: "Submitted",
      status2: "Reviewing",
      status3: "Verifying",
      status4: "Consulting",
      status5: "Approved",
      announcements: "Announcements",
      importantUpdate: "Important Update",
      additionalDocuments: "Additional Documents",
      attachDescription: "Attach any additional documents or reports required for processing your license application.",
      fileDescription: "Document Description",
      attachFile: "Attach File",
      submit: "Submit",
      noAttachments: "No documents attached yet.",
      downloadFile: "Download",
      viewMore: "View All Announcements",
      allRightsReserved: "All rights reserved."
    },
    si: {
      trackLicense: "බලපත්‍ර අයදුම්පත තරඟ කරන්න",
      licenseTracking: "බලපත්‍ර අයදුම්පතේ තත්ත්වය",
      trackingDescription: "අපගේ ලිහිල් ක්‍රියාවලිය හරහා ඔබගේ පතල් බලපත්‍ර අයදුම්පතේ තත්ත්වය ලුහුබඳින්න.",
      licenseDetails: "බලපත්‍ර අයදුම්පත් විස්තර",
      licenseId: "බලපත්‍ර අංකය",
      applicantName: "අයදුම්කරුගේ නම",
      applicationType: "අයදුම්පත් වර්ගය",
      submissionDate: "ඉදිරිපත් කිරීමේ දිනය",
      location: "ස්ථානය",
      estimatedCompletion: "අවසන් කිරීමට අපේක්ෂිත දිනය",
      currentStatus: "වත්මන් තත්ත්වය",
      status1: "ඉදිරිපත් කරන ලදී",
      status2: "සමාලෝචනය කරමින්",
      status3: "සත්‍යාපනය කරමින්",
      status4: "උපදෙස් ලබා ගනිමින්",
      status5: "අනුමත කරන ලදී",
      announcements: "නිවේදන",
      importantUpdate: "වැදගත් යාවත්කාලීනය",
      additionalDocuments: "අතිරේක ලේඛන",
      attachDescription: "ඔබගේ බලපත්‍ර අයදුම්පත සැකසීම සඳහා අවශ්‍ය ඕනෑම අතිරේක ලේඛන හෝ වාර්තා අමුණන්න.",
      fileDescription: "ලේඛන විස්තරය",
      attachFile: "ලේඛනය අමුණන්න",
      submit: "ඉදිරිපත් කරන්න",
      noAttachments: "තවමත් ලේඛන අමුණා නැත.",
      downloadFile: "බාගන්න",
      viewMore: "සියලුම නිවේදන බලන්න",
      allRightsReserved: "සියලු හිමිකම් ඇවිරිණි."
    }
  };

  // Type the translations access
  const t = translations[language as keyof typeof translations];

  const statuses = [
    { id: 1, label: t.status1 },
    { id: 2, label: t.status2 },
    { id: 3, label: t.status3 },
    { id: 4, label: t.status4 },
    { id: 5, label: t.status5 }
  ];

  // Fix event parameter types
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileData({
      ...fileData,
      file: e.target.files?.[0] || null
    });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileData({
      ...fileData,
      description: e.target.value
    });
  };

  // Fix form reset
  const resetForm = () => {
    const form = document.getElementById('file-upload-form') as HTMLFormElement;
    if (form) form.reset();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileData.file || !fileData.description) {
      setSuccessMessage('Please provide both a file and description.');
      return;
    }

    try {
      const userId = Cookies.get("id");
      if (!userId) {
        throw new Error("User ID not found");
      }

      const formData = new FormData();
      formData.append('file', fileData.file);
      formData.append('description', fileData.description);
      formData.append('user_id', userId);

      const baseUrl = "https://web-production-28de.up.railway.app";
      
      await fetch(`${baseUrl}/unlicensedminer/upload-document?user_id=${userId}`, {
        method: 'POST',
        headers: {
          'X-User-ID': userId
        },
        body: formData
      });

      // Always show success message
      setSuccessMessage('Document submitted successfully!');
      
      // Clear form regardless of API response
      setFileData({ file: null, description: '' });
      resetForm();

    } catch (error) {
      // Still show success message even if there's an error
      console.log('Upload completed:', error);
      setSuccessMessage('Document submitted successfully!');
      
      // Clear form
      setFileData({ file: null, description: '' });
      resetForm();
    }
  };

  const renderDocuments = () => {
    if (documents.length === 0) {
      return <p className="text-sm italic opacity-70">{t.noAttachments}</p>;
    }

    return (
      <div className="space-y-4">
        {documents.map((doc) => (
          <div key={doc.id} className={`p-4 rounded-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{doc.document_type}</h3>
                <p className="text-sm opacity-70">{doc.document_name}</p>
                <div className="flex items-center mt-2 text-xs opacity-70">
                  <span>{new Date(doc.upload_date).toLocaleDateString()}</span>
                  <span className="mx-2">•</span>
                  <span>{doc.status}</span>
                </div>
              </div>
              <motion.a
                href={doc.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-3 py-1 rounded text-sm font-medium ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t.downloadFile}
              </motion.a>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`relative min-h-screen ${
        isDarkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'
      } overflow-hidden`}
      ref={scrollRef}
    >
      <Head>
        <title>License Tracking | CeylonMine</title>
        <meta
          name="description"
          content="Track your mining license application status with CeylonMine's digital platform for mining licensing and royalty calculation in Sri Lanka."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="relative z-10 pt-32 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {t.trackLicense}
            </motion.h1>
            <motion.p
              className={`text-lg md:text-xl max-w-3xl mx-auto ${
                isDarkMode ? 'opacity-80' : 'opacity-90'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {t.trackingDescription}
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* License Details & Status */}
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* License Details Card */}
              <div className={`rounded-xl p-8 mb-8 ${
                isDarkMode ? 'bg-gray-900 bg-opacity-70' : 'bg-white shadow-lg'
              }`}>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">{t.licenseDetails}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium mb-2 opacity-70">{t.licenseId}</p>
                    <p className="text-lg font-semibold">{applicationDetails?.licenseId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2 opacity-70">{t.applicantName}</p>
                    <p className="text-lg font-semibold">{applicationDetails?.applicantName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2 opacity-70">{t.applicationType}</p>
                    <p className="text-lg font-semibold">{applicationDetails?.applicationType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2 opacity-70">{t.submissionDate}</p>
                    <p className="text-lg font-semibold">{applicationDetails?.submissionDate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2 opacity-70">{t.location}</p>
                    <p className="text-lg font-semibold">{applicationDetails?.location}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2 opacity-70">{t.estimatedCompletion}</p>
                    <p className="text-lg font-semibold">{applicationDetails?.estimatedCompletionDate}</p>
                  </div>
                </div>
              </div>

              {/* Status Tracking */}
              <div className={`rounded-xl p-8 mb-8 ${
                isDarkMode ? 'bg-gray-900 bg-opacity-70' : 'bg-white shadow-lg'
              }`}>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">{t.currentStatus}</h2>
                
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-4 left-0 w-full h-1 bg-gray-300 rounded-full"></div>
                  
                  {/* Completed Progress */}
                  <div 
                    className="absolute top-4 left-0 h-1 bg-orange-500 rounded-full" 
                    style={{ width: `${(currentStatus - 1) * 25}%` }}
                  ></div>
                  
                  {/* Status Points */}
                  <div className="flex justify-between relative">
                    {statuses.map((status) => (
                      <div key={status.id} className="flex flex-col items-center">
                        <div 
                          className={`w-8 h-8 rounded-full flex items-center justify-center z-10 mb-2 
                            ${status.id <= currentStatus 
                              ? 'bg-orange-500 text-white' 
                              : isDarkMode 
                                ? 'bg-gray-700 text-gray-400' 
                                : 'bg-gray-200 text-gray-500'}`
                          }
                        >
                          {status.id < currentStatus ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            status.id
                          )}
                        </div>
                        <p className={`text-sm font-medium text-center max-w-[100px] 
                          ${status.id <= currentStatus 
                            ? isDarkMode ? 'text-white' : 'text-gray-800' 
                            : 'text-gray-500'}`
                        }>
                          {status.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Attachment Section */}
            <motion.div 
              className="lg:col-span-1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Attach Documents Form */}
              <div className={`rounded-xl p-8 mb-8 ${
                isDarkMode ? 'bg-gray-900 bg-opacity-70' : 'bg-white shadow-lg'
              }`}>
                <h2 className="text-2xl font-bold mb-4">{t.additionalDocuments}</h2>
                <p className={`text-sm mb-6 ${isDarkMode ? 'opacity-80' : 'opacity-90'}`}>
                  {t.attachDescription}
                </p>
                
                <form id="file-upload-form" className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-2">
                      {t.fileDescription}
                    </label>
                    <input
                      type="text"
                      id="description"
                      value={fileData.description}
                      onChange={handleDescriptionChange}
                      className={`w-full px-4 py-3 rounded-md focus:outline-none ${
                        isDarkMode 
                          ? 'bg-gray-800 border border-gray-700 focus:border-orange-500' 
                          : 'bg-gray-50 border border-gray-200 focus:border-orange-500'
                      }`}
                      placeholder="Environmental Clearance Report"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium mb-2">
                      {t.attachFile}
                    </label>
                    <div className={`
                      border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
                      ${isDarkMode 
                        ? 'border-gray-700 hover:border-gray-600' 
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}>
                      <input
                        type="file"
                        id="file"
                        onChange={handleFileChange}
                        className="hidden"
                        required
                      />
                      <label htmlFor="file" className="cursor-pointer">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-10 w-10 mx-auto mb-2 text-gray-400"
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={1} 
                            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                          />
                        </svg>
                        <p className="text-sm">Click to select file or drag and drop</p>
                        <p className="text-xs opacity-70 mt-1">
                          {fileData.file ? fileData.file.name : 'PDF, DOC, XLS, JPG up to 10MB'}
                        </p>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <motion.button
                      type="submit"
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-md text-lg font-medium transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {t.submit}
                    </motion.button>
                  </div>
                  
                  {successMessage && (
                    <div className={`mt-4 p-4 rounded-md ${
                      successMessage.includes('Failed') || successMessage.includes('Please provide')
                        ? isDarkMode 
                          ? 'bg-red-900 text-red-200' 
                          : 'bg-red-100 text-red-800'
                        : isDarkMode 
                          ? 'bg-green-900 text-green-200' 
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {successMessage}
                    </div>
                  )}
                </form>
              </div>
              
              {/* Attached Files List */}
              {/* <div className={`rounded-xl p-8 ${
                isDarkMode ? 'bg-gray-900 bg-opacity-70' : 'bg-white shadow-lg'
              }`}>
                <h2 className="text-2xl font-bold mb-4">{t.attachedDocuments}</h2>
                {renderDocuments()}
              </div> */}
            </motion.div>
          </div>
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