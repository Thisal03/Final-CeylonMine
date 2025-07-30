'use client'
import React, { useState, useEffect, useRef } from 'react'
import Navbar from '../../navbar/page'
import * as THREE from 'three';
import Swal from 'sweetalert2';
import Cookies from "js-cookie";
import { motion } from 'framer-motion';

interface FormData {
  exploration_license_no: string;
  applicant_name: string;
  national_id: string;
  address: string;
  nationality: string;
  employment: string;
  place_of_business: string;
  residence: string;
  company_name: string;
  country_of_incorporation: string;
  head_office_address: string;
  registered_address_in_sri_lanka: string;
  capitalization: string;
  blasting_method: string;
  depth_of_borehole: string;
  production_volume: string;
  machinery_used: string;
  underground_mining_depth: string;
  explosives_type: string;
  land_name: string;
  land_owner_name: string;
  village_name: string;
  grama_niladhari_division: string;
  divisional_secretary_division: string;
  administrative_district: string;
  nature_of_bound: string;
  minerals_to_be_mined: string;
  industrial_mining_license_no: string;
  period_of_validity: string;
  royalty_payable: string;
  // File uploads
  articles_of_association: File | null;
  annual_reports: File | null;
  licensed_boundary_survey: File | null;
  project_team_credentials: File | null;
  economic_viability_report: File | null;
  deed_copy: File | null;
  survey_plan: File | null;
  lease_agreement: File | null;
  mine_restoration_plan: File | null;
  license_fee_receipt: File | null;
}

interface FormErrors {
  [key: string]: string;
}

export default function TypeALicense() {
  const [formData, setFormData] = useState<FormData>({
    exploration_license_no: '',
    applicant_name: '',
    national_id: '',
    address: '',
    nationality: '',
    employment: '',
    place_of_business: '',
    residence: '',
    company_name: '',
    country_of_incorporation: '',
    head_office_address: '',
    registered_address_in_sri_lanka: '',
    capitalization: '',
    blasting_method: '',
    depth_of_borehole: '',
    production_volume: '',
    machinery_used: '',
    underground_mining_depth: '',
    explosives_type: '',
    land_name: '',
    land_owner_name: '',
    village_name: '',
    grama_niladhari_division: '',
    divisional_secretary_division: '',
    administrative_district: '',
    nature_of_bound: '',
    minerals_to_be_mined: '',
    industrial_mining_license_no: '',
    period_of_validity: '',
    royalty_payable: '',
    // File uploads
    articles_of_association: null,
    annual_reports: null,
    licensed_boundary_survey: null,
    project_team_credentials: null,
    economic_viability_report: null,
    deed_copy: null,
    survey_plan: null,
    lease_agreement: null,
    mine_restoration_plan: null,
    license_fee_receipt: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isDarkMode, setIsDarkMode] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Listen for theme change event from navbar
  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      setIsDarkMode(event.detail.isDarkMode);
    };

    window.addEventListener('themeChange', handleThemeChange as EventListener);

    // Set initial theme based on local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }

    return () => {
      window.removeEventListener('themeChange', handleThemeChange as EventListener);
    };
  }, []);

  // Validation function
  const validateField = (name: string, value: string | File | null): string => {
    if (!value && name !== 'articles_of_association') { // Skip validation for optional files
      return 'This field is required';
    }

    switch (name) {
      case 'exploration_license_no':
      case 'industrial_mining_license_no':
        if (!/^\d+$/.test(value as string)) {
          return 'Please enter numbers only';
        }
        break;
      case 'applicant_name':
        if ((value as string).length < 2) {
          return 'Name must be at least 2 characters';
        }
        if (!/^[a-zA-Z\s.'-]+$/.test(value as string)) {
          return 'Name contains invalid characters';
        }
        break;
      case 'national_id':
        if (!/^[0-9]{9}[vVxX]$|^[0-9]{12}$/.test(value as string)) {
          return 'Invalid NIC format (9 digits + V/X or 12 digits)';
        }
        break;
      case 'capitalization':
      case 'production_volume':
      case 'depth_of_borehole':
      case 'underground_mining_depth':
      case 'royalty_payable':
        if (isNaN(Number(value)) || Number(value) <= 0) {
          return 'Must be a positive number';
        }
        break;
    }

    return '';
  };

  // Handle input change with validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate in real-time if field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Convert to number and validate
    const numValue = parseFloat(value);
    
    // Only update if empty or positive number
    if (value === '' || (!isNaN(numValue) && numValue >= 0)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      if (touched[name]) {
        const error = validateField(name, value);
        setErrors(prev => ({
          ...prev,
          [name]: error
        }));
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate on blur
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleFileChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        [field]: file
      }));

      // Validate file
      const error = validateField(field, file);
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  };

  // Validate all fields before submission
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate all fields
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      await Swal.fire({
        title: 'Validation Error',
        text: 'Please correct the errors in the form before submitting.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#f97316',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#333333',
      });
      return;
    }
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) throw new Error('User not logged in');
      const payload = { ...formData, miner_id: user.id, category: 'A' };
      const response = await fetch('/api/application/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (response.ok) {
        await Swal.fire({
          title: 'Success!',
          text: 'Your license application has been submitted successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#f97316',
          background: isDarkMode ? '#1f2937' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#333333',
          iconColor: isDarkMode ? '#fbbf24' : '#f97316',
        });
      } else {
        throw new Error(result.error || 'Failed to submit application');
      }
    } catch (error: any) {
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'An error occurred while submitting the application. Please try again later.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#f97316',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#333333',
        iconColor: isDarkMode ? '#ef4444' : '#dc2626',
      });
    }
  };

  const renderInput = (name: keyof FormData, label: string, type: string = 'text', required: boolean = true) => {
    // Special handling for license numbers - they shouldn't have number controls
    const isLicenseNumber = name === 'exploration_license_no' || name === 'industrial_mining_license_no';
    const showNumberControls = type === 'number' && !isLicenseNumber;

    return (
      <motion.div 
        className="relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          {label} {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          <input
            type={isLicenseNumber ? 'text' : type}
            name={name}
            required={required}
            className={`w-full rounded-xl border-2 transition-all duration-300 ${
              showNumberControls ? 'pr-12' : 'px-4'
            } py-2 pl-4 text-base ${
              isDarkMode 
                ? 'bg-gray-800/90 text-white border-gray-700 focus:border-amber-500 focus:ring-amber-500/20' 
                : 'bg-white/90 text-gray-900 border-gray-300 focus:border-amber-500 focus:ring-amber-500/20'
            } shadow-sm focus:ring-4 focus:outline-none ${
              touched[name] && errors[name] 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                : ''
            } ${
              showNumberControls ? `
                [appearance:textfield]
                [&::-webkit-outer-spin-button]:appearance-none
                [&::-webkit-inner-spin-button]:appearance-none
              ` : ''
            }`}
            value={formData[name] as string}
            onChange={showNumberControls ? handleNumberInput : handleInputChange}
            onBlur={handleBlur}
            min={type === 'number' ? "0" : undefined}
            step={type === 'number' ? "0.01" : undefined}
            pattern={isLicenseNumber ? "[0-9]*" : undefined}
            placeholder={type === 'number' ? "Enter a positive number" : undefined}
          />
          {/* Only show number controls for number inputs that aren't license numbers */}
          {showNumberControls && (
            <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col space-y-0.5">
              <button
                type="button"
                className={`w-5 h-5 rounded flex items-center justify-center transition-colors text-xs ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                style={{lineHeight: '1'}}
                onClick={() => {
                  const currentValue = parseFloat(formData[name] as string) || 0;
                  const newValue = (currentValue + 0.01).toFixed(2);
                  handleNumberInput({
                    target: { name, value: newValue }
                  } as React.ChangeEvent<HTMLInputElement>);
                }}
              >
                ▲
              </button>
              <button
                type="button"
                className={`w-5 h-5 rounded flex items-center justify-center transition-colors text-xs ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                style={{lineHeight: '1'}}
                onClick={() => {
                  const currentValue = parseFloat(formData[name] as string) || 0;
                  const newValue = Math.max(0, currentValue - 0.01).toFixed(2);
                  handleNumberInput({
                    target: { name, value: newValue }
                  } as React.ChangeEvent<HTMLInputElement>);
                }}
              >
                ▼
              </button>
            </div>
          )}
        </div>
        {touched[name] && errors[name] && (
          <motion.p 
            className="mt-2 text-sm text-red-500 flex items-center"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors[name]}
          </motion.p>
        )}
      </motion.div>
    );
  };

  const renderFileInput = (name: keyof FormData, label: string) => {
    const file = formData[name] as File | null;
    const hasFile = file !== null;
    return (
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</label>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-2 ${hasFile ? (isDarkMode ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-green-100 text-green-800 border border-green-200') : (isDarkMode ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-red-100 text-red-800 border border-red-200')}`}>{hasFile ? '✓ Submitted' : '✖ Not Submitted'}</span>
        </div>
        <div className={`relative border-2 border-dashed rounded-xl p-4 transition-all duration-300 ${isDarkMode ? (hasFile ? 'border-green-500/50 bg-green-500/5 hover:border-green-500/70' : 'border-gray-600 hover:border-amber-500 bg-gray-800/50') : (hasFile ? 'border-green-300 bg-green-50/50 hover:border-green-400' : 'border-gray-300 hover:border-amber-500 bg-gray-50/50')}`}>
          <input
            type="file"
            name={name}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange(name)}
          />
          <div className="text-center">
            {hasFile ? (
              <>
                <svg className={`mx-auto h-8 w-8 mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>File uploaded successfully</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{file.name}</p>
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Click to replace file</p>
              </>
            ) : (
              <>
                <svg className={`mx-auto h-8 w-8 mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Click to upload or drag and drop</p>
              </>
            )}
          </div>
        </div>
        {errors[name] && (
          <p className="mt-1 text-sm text-red-500">{errors[name]}</p>
        )}
      </div>
    );
  };

  return (
    <div className={`relative min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-black to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'} overflow-hidden`}>
      <Navbar />
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:20px_20px]" />
      </div>
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center pt-24 pb-16">
        <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className={`text-4xl md:text-5xl font-extrabold mb-3 tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>IML Type A License Application</h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto text-center font-light mb-2 text-black">Complete the form below to apply for your Industrial Mining License Type A</p>
          </motion.div>
          {/* Form Container */}
          <motion.div 
            className={`shadow-2xl rounded-2xl p-8 lg:p-12 border ${isDarkMode ? 'bg-gray-900/90 border-gray-800' : 'bg-white/90 border-gray-200'} backdrop-blur-sm`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Section: Basic Information */}
              <div>
                <div className="flex items-center mb-6">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${isDarkMode ? 'bg-amber-500/20' : 'bg-amber-100'}`}> <span className="text-amber-600 font-bold">1</span> </div>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Basic Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderInput('exploration_license_no', 'Exploration License No')}
                  {renderInput('industrial_mining_license_no', 'Industrial Mining License No')}
                </div>
              </div>
              {/* Section: Applicant Details */}
              <div>
                <div className="flex items-center mb-6">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${isDarkMode ? 'bg-amber-500/20' : 'bg-amber-100'}`}> <span className="text-amber-600 font-bold">2</span> </div>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Applicant Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderInput('applicant_name', 'Applicant Name')}
                  {renderInput('national_id', 'National ID')}
                  {renderInput('address', 'Address')}
                  {renderInput('nationality', 'Nationality')}
                  {renderInput('employment', 'Employment')}
                </div>
              </div>
              {/* Section: Business Details */}
              <div>
                <div className="flex items-center mb-6">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${isDarkMode ? 'bg-amber-500/20' : 'bg-amber-100'}`}> <span className="text-amber-600 font-bold">3</span> </div>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Business Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderInput('place_of_business', 'Place of Business')}
                  {renderInput('residence', 'Residence')}
                  {renderInput('company_name', 'Company Name')}
                  {renderInput('country_of_incorporation', 'Country of Incorporation')}
                  {renderInput('head_office_address', 'Head Office Address')}
                  {renderInput('registered_address_in_sri_lanka', 'Registered Address in Sri Lanka')}
                  {renderInput('capitalization', 'Capitalization', 'number')}
                </div>
              </div>
              {/* Section: Mining Operation Details */}
              <div>
                <div className="flex items-center mb-6">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${isDarkMode ? 'bg-amber-500/20' : 'bg-amber-100'}`}> <span className="text-amber-600 font-bold">4</span> </div>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Mining Operation Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderInput('blasting_method', 'Blasting Method')}
                  {renderInput('depth_of_borehole', 'Depth of Borehole', 'number')}
                  {renderInput('production_volume', 'Production Volume', 'number')}
                  {renderInput('machinery_used', 'Machinery Used')}
                  {renderInput('underground_mining_depth', 'Underground Mining Depth', 'number')}
                  {renderInput('explosives_type', 'Explosives Type')}
                </div>
              </div>
              {/* Section: License Area Details */}
              <div>
                <div className="flex items-center mb-6">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${isDarkMode ? 'bg-amber-500/20' : 'bg-amber-100'}`}> <span className="text-amber-600 font-bold">5</span> </div>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>License Area Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderInput('land_name', 'Land Name')}
                  {renderInput('land_owner_name', 'Land Owner Name')}
                  {renderInput('village_name', 'Village Name')}
                  {renderInput('grama_niladhari_division', 'Grama Niladhari Division')}
                  {renderInput('divisional_secretary_division', 'Divisional Secretary Division')}
                  {renderInput('administrative_district', 'Administrative District')}
                </div>
              </div>
              {/* Section: Additional Details */}
              <div>
                <div className="flex items-center mb-6">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${isDarkMode ? 'bg-amber-500/20' : 'bg-amber-100'}`}> <span className="text-amber-600 font-bold">6</span> </div>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Additional Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderInput('nature_of_bound', 'Nature of Bond')}
                  {renderInput('minerals_to_be_mined', 'Minerals to be Mined')}
                  {renderInput('period_of_validity', 'Period of Validity')}
                  {renderInput('royalty_payable', 'Royalty Payable', 'number')}
                </div>
              </div>
              {/* Section: File Uploads */}
              <div>
                <div className="flex items-center mb-6">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${isDarkMode ? 'bg-amber-500/20' : 'bg-amber-100'}`}> <span className="text-amber-600 font-bold">7</span> </div>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Required Documents</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderFileInput('articles_of_association', 'Articles of Association')}
                  {renderFileInput('annual_reports', 'Annual Reports')}
                  {renderFileInput('licensed_boundary_survey', 'Licensed Boundary Survey')}
                  {renderFileInput('project_team_credentials', 'Project Team Credentials')}
                  {renderFileInput('economic_viability_report', 'Economic Viability Report')}
                  {renderFileInput('deed_copy', 'Deed Copy')}
                  {renderFileInput('survey_plan', 'Survey Plan')}
                  {renderFileInput('lease_agreement', 'Lease Agreement')}
                  {renderFileInput('mine_restoration_plan', 'Mine Restoration Plan')}
                  {renderFileInput('license_fee_receipt', 'License Fee Receipt')}
                </div>
              </div>
              {/* Submit Button */}
              <div className="pt-8">
                <button
                  type="submit"
                  className="w-full flex justify-center items-center py-4 px-8 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-4 focus:ring-amber-500/30 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Submit Application
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
      {/* Three.js Canvas Background */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0" />
    </div>
  );
}