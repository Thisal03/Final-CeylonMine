'use client'
import React, { useState, useEffect, useRef } from 'react'
import Navbar from '../../navbar/page'
import * as THREE from 'three';
import Swal from 'sweetalert2';

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

    function onDocumentMouseMove(event: MouseEvent) {
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
      if (particlesGeometry) particlesGeometry.dispose();
      if (particlesMaterial) particlesMaterial.dispose();
      if (renderer) renderer.dispose();
    };
  }, [isDarkMode]);

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
    
    // Validate form before submission
    if (!validateForm()) {
      await Swal.fire({
        title: 'Validation Error',
        text: 'Please correct the errors in the form before submitting.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#f97316',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#333333',
        iconColor: isDarkMode ? '#ef4444' : '#dc2626',
        showClass: {
          popup: 'animate__animated animate__fadeInUp animate__faster'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutDown animate__faster'
        }
      });
      return;
    }

    const data = new FormData();
    
    // Add license type
    data.append('licenseType', 'type-a');
    
    // Helper function to append nested objects
    const appendNestedObject = (prefix: string, obj: Partial<FormData>) => {
      Object.entries(obj).forEach(([key, value]) => {
        const fullKey = prefix ? `${prefix}[${key}]` : key;
        
        if (value instanceof File) {
          data.append(fullKey, value);
        } else if (value && typeof value === 'object') {
          appendNestedObject(fullKey, value);
        } else if (value !== null && value !== undefined) {
          data.append(fullKey, value.toString());
        }
      });
    };

    // Append all form data
    appendNestedObject('', formData);

    try {
      // Show loading state
      Swal.fire({
        title: 'Submitting Application',
        text: 'Please wait while we process your application...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await fetch('https://ceylonminebackend.up.railway.app/license/submit', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: data,
      });
      
      if (response.ok) {
        // Success message
        await Swal.fire({
          title: 'Success!',
          text: 'Your license application has been submitted successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#f97316',
          background: isDarkMode ? '#1f2937' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#333333',
          iconColor: isDarkMode ? '#fbbf24' : '#f97316',
          showClass: {
            popup: 'animate__animated animate__fadeInUp animate__faster'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutDown animate__faster'
          }
        });
      } else {
        // Try to get error message from response
        let errorMessage = 'Failed to submit license application';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } else {
            const textError = await response.text();
            errorMessage = textError || errorMessage;
          }
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
        }
        
        console.error('Server response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // Show error message
        await Swal.fire({
          title: 'Error!',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#f97316',
          background: isDarkMode ? '#1f2937' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#333333',
          iconColor: isDarkMode ? '#ef4444' : '#dc2626',
          showClass: {
            popup: 'animate__animated animate__fadeInUp animate__faster'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutDown animate__faster'
          }
        });
      }
    } catch (error) {
      console.error('Network error:', error);
      // Show network error message
      await Swal.fire({
        title: 'Network Error!',
        text: 'A network error occurred while submitting the application. Please check your connection and try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#f97316',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#333333',
        iconColor: isDarkMode ? '#ef4444' : '#dc2626',
        showClass: {
          popup: 'animate__animated animate__fadeInUp animate__faster'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutDown animate__faster'
        }
      });
    }
  };

  const renderInput = (name: keyof FormData, label: string, type: string = 'text', required: boolean = true) => {
    // Special handling for license numbers - they shouldn't have number controls
    const isLicenseNumber = name === 'exploration_license_no' || name === 'industrial_mining_license_no';
    const showNumberControls = type === 'number' && !isLicenseNumber;

    return (
      <div className="relative">
        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type={isLicenseNumber ? 'text' : type}
          name={name}
          required={required}
          className={`mt-1 block w-full rounded-md ${
            isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'border-gray-300'
          } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
            touched[name] && errors[name] ? 'border-red-500' : ''
          } ${
            showNumberControls ? `
              [appearance:textfield]
              [&::-webkit-outer-spin-button]:appearance-none
              [&::-webkit-inner-spin-button]:appearance-none
              px-3 py-2
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
        {touched[name] && errors[name] && (
          <p className="mt-1 text-sm text-red-500">{errors[name]}</p>
        )}
        {/* Only show number controls for number inputs that aren't license numbers */}
        {showNumberControls && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex flex-col">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
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
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
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
    );
  };

  return (
    <div className={`relative min-h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'} overflow-hidden`}>
      <Navbar />
      <div className="relative z-10 min-h-screen pt-32 pb-16">
        <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
          <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            IML Type B License Application
          </h1>
          <div className={`${isDarkMode ? 'bg-gray-900 bg-opacity-70' : 'bg-white'} shadow-lg rounded-lg p-6`}>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput('exploration_license_no', 'Exploration License No')}
                  {renderInput('industrial_mining_license_no', 'Industrial Mining License No')}
                </div>
              </div>

              {/* Applicant Details */}
              <div className="space-y-4">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Applicant Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput('applicant_name', 'Applicant Name')}
                  {renderInput('national_id', 'National ID')}
                  {renderInput('address', 'Address')}
                  {renderInput('nationality', 'Nationality')}
                  {renderInput('employment', 'Employment')}
                </div>
              </div>

              {/* Business Details */}
              <div className="space-y-4">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Business Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput('place_of_business', 'Place of Business')}
                  {renderInput('residence', 'Residence')}
                  {renderInput('company_name', 'Company Name')}
                  {renderInput('country_of_incorporation', 'Country of Incorporation')}
                  {renderInput('head_office_address', 'Head Office Address')}
                  {renderInput('registered_address_in_sri_lanka', 'Registered Address in Sri Lanka')}
                  {renderInput('capitalization', 'Capitalization', 'number')}
                </div>
              </div>

              {/* Mining Operation Details */}
              <div className="space-y-4">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Mining Operation Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput('blasting_method', 'Blasting Method')}
                  {renderInput('depth_of_borehole', 'Depth of Borehole', 'number')}
                  {renderInput('production_volume', 'Production Volume', 'number')}
                  {renderInput('machinery_used', 'Machinery Used')}
                  {renderInput('underground_mining_depth', 'Underground Mining Depth', 'number')}
                  {renderInput('explosives_type', 'Explosives Type')}
                </div>
              </div>

              {/* License Area Details */}
              <div className="space-y-4">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  License Area Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput('land_name', 'Land Name')}
                  {renderInput('land_owner_name', 'Land Owner Name')}
                  {renderInput('village_name', 'Village Name')}
                  {renderInput('grama_niladhari_division', 'Grama Niladhari Division')}
                  {renderInput('divisional_secretary_division', 'Divisional Secretary Division')}
                  {renderInput('administrative_district', 'Administrative District')}
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-4">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Additional Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput('nature_of_bound', 'Nature of Bond')}
                  {renderInput('minerals_to_be_mined', 'Minerals to be Mined')}
                  {renderInput('period_of_validity', 'Period of Validity')}
                  {renderInput('royalty_payable', 'Royalty Payable', 'number')}
                </div>
              </div>

              {/* File Uploads */}
              <div className="space-y-4">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Required Documents (Optional)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Articles of Association
                    </label>
                    <input
                      type="file"
                      name="articles_of_association"
                      className={`mt-1 block w-full ${
                        errors.articles_of_association ? 'border-red-500' : ''
                      }`}
                      onChange={handleFileChange('articles_of_association')}
                    />
                    {errors.articles_of_association && (
                      <p className="mt-1 text-sm text-red-500">{errors.articles_of_association}</p>
                    )}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Annual Reports
                    </label>
                    <input
                      type="file"
                      name="annual_reports"
                      className={`mt-1 block w-full ${
                        errors.annual_reports ? 'border-red-500' : ''
                      }`}
                      onChange={handleFileChange('annual_reports')}
                    />
                    {errors.annual_reports && (
                      <p className="mt-1 text-sm text-red-500">{errors.annual_reports}</p>
                    )}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Licensed Boundary Survey
                    </label>
                    <input
                      type="file"
                      name="licensed_boundary_survey"
                      className={`mt-1 block w-full ${
                        errors.licensed_boundary_survey ? 'border-red-500' : ''
                      }`}
                      onChange={handleFileChange('licensed_boundary_survey')}
                    />
                    {errors.licensed_boundary_survey && (
                      <p className="mt-1 text-sm text-red-500">{errors.licensed_boundary_survey}</p>
                    )}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Project Team Credentials
                    </label>
                    <input
                      type="file"
                      name="project_team_credentials"
                      className={`mt-1 block w-full ${
                        errors.project_team_credentials ? 'border-red-500' : ''
                      }`}
                      onChange={handleFileChange('project_team_credentials')}
                    />
                    {errors.project_team_credentials && (
                      <p className="mt-1 text-sm text-red-500">{errors.project_team_credentials}</p>
                    )}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Economic Viability Report
                    </label>
                    <input
                      type="file"
                      name="economic_viability_report"
                      className={`mt-1 block w-full ${
                        errors.economic_viability_report ? 'border-red-500' : ''
                      }`}
                      onChange={handleFileChange('economic_viability_report')}
                    />
                    {errors.economic_viability_report && (
                      <p className="mt-1 text-sm text-red-500">{errors.economic_viability_report}</p>
                    )}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Deed Copy
                    </label>
                    <input
                      type="file"
                      name="deed_copy"
                      className={`mt-1 block w-full ${
                        errors.deed_copy ? 'border-red-500' : ''
                      }`}
                      onChange={handleFileChange('deed_copy')}
                    />
                    {errors.deed_copy && (
                      <p className="mt-1 text-sm text-red-500">{errors.deed_copy}</p>
                    )}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Survey Plan
                    </label>
                    <input
                      type="file"
                      name="survey_plan"
                      className={`mt-1 block w-full ${
                        errors.survey_plan ? 'border-red-500' : ''
                      }`}
                      onChange={handleFileChange('survey_plan')}
                    />
                    {errors.survey_plan && (
                      <p className="mt-1 text-sm text-red-500">{errors.survey_plan}</p>
                    )}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Lease Agreement
                    </label>
                    <input
                      type="file"
                      name="lease_agreement"
                      className={`mt-1 block w-full ${
                        errors.lease_agreement ? 'border-red-500' : ''
                      }`}
                      onChange={handleFileChange('lease_agreement')}
                    />
                    {errors.lease_agreement && (
                      <p className="mt-1 text-sm text-red-500">{errors.lease_agreement}</p>
                    )}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Mine Restoration Plan
                    </label>
                    <input
                      type="file"
                      name="mine_restoration_plan"
                      className={`mt-1 block w-full ${
                        errors.mine_restoration_plan ? 'border-red-500' : ''
                      }`}
                      onChange={handleFileChange('mine_restoration_plan')}
                    />
                    {errors.mine_restoration_plan && (
                      <p className="mt-1 text-sm text-red-500">{errors.mine_restoration_plan}</p>
                    )}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      License Fee Receipt
                    </label>
                    <input
                      type="file"
                      name="license_fee_receipt"
                      className={`mt-1 block w-full ${
                        errors.license_fee_receipt ? 'border-red-500' : ''
                      }`}
                      onChange={handleFileChange('license_fee_receipt')}
                    />
                    {errors.license_fee_receipt && (
                      <p className="mt-1 text-sm text-red-500">{errors.license_fee_receipt}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-5">
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Three.js Canvas Background */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0" />
    </div>
  );
}