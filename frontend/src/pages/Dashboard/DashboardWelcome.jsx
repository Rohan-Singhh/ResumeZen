import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { PaperClipIcon, DocumentTextIcon, ArrowUpTrayIcon, CheckCircleIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function DashboardWelcome() {
  const { currentUser, userPlans, fetchUserPlans } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [activePlan, setActivePlan] = useState(null);

  // Fetch user plans on component mount
  useEffect(() => {
    fetchUserPlans(true);
  }, []);

  // Set active plan whenever userPlans changes
  useEffect(() => {
    if (userPlans && userPlans.length > 0) {
      // Find the most recently purchased active plan
      const sortedPlans = [...userPlans].sort((a, b) => 
        new Date(b.purchasedAt) - new Date(a.purchasedAt)
      );
      setActivePlan(sortedPlans[0]);
    } else {
      setActivePlan(null);
    }
  }, [userPlans]);

  // Get initials for profile avatar
  const getInitials = () => {
    if (!currentUser || !currentUser.name) return 'U';
    return currentUser.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Format date to local string
  const formatDate = (dateString) => {
    if (!dateString) return 'No expiration';
    return new Date(dateString).toLocaleDateString();
  };

  // Calculate days remaining until expiration
  const getDaysRemaining = (expiresAt) => {
    if (!expiresAt) return null;
    
    const today = new Date();
    const expDate = new Date(expiresAt);
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Process the uploaded file
  const handleFileUpload = (file) => {
    // Mock file upload - in a real app, you'd send to server
    setUploadedFile(file);
    
    // Simulate upload process
    setTimeout(() => {
      setUploadSuccess(true);
    }, 1500);
  };

  // Marketing blurbs
  const marketingBlurbs = [
    {
      title: "Get ATS-optimized resumes instantly",
      description: "Our advanced AI ensures your resume passes through Applicant Tracking Systems with ease"
    },
    {
      title: "Trusted by candidates hired at top MNCs",
      description: "Amazon, Google, Microsoft, TCS, and other top companies have hired candidates using ResumeZen"
    },
    {
      title: "Crafted with the same tools used by recruiters",
      description: "Our platform is built using industry-standard tools that recruiters rely on"
    }
  ];

  // Testimonial/Quote
  const testimonial = {
    quote: "Including specific metrics in your resume can increase interview callbacks by 40%",
    source: "Harvard Business Review Study, 2023"
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {currentUser?.name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-gray-600">
          Your path to the perfect resume continues. Let's make your application stand out.
        </p>
      </div>
      
      {/* User Info with Profile Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-start space-x-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-primary to-blue-600 flex items-center justify-center text-white font-semibold text-xl">
            {getInitials()}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{currentUser?.name || 'User'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-sm">
              <div>
                <p className="text-gray-500 font-medium">Email Address</p>
                <p className="text-gray-800">{currentUser?.email || 'NA'}</p>
              </div>
              
              <div>
                <p className="text-gray-500 font-medium">Phone Number</p>
                <p className="text-gray-800">{currentUser?.phone || 'NA'}</p>
              </div>
              
              <div>
                <p className="text-gray-500 font-medium">Occupation / Role</p>
                <p className="text-gray-800">{currentUser?.occupation || 'NA'}</p>
              </div>
              
              <div>
                <p className="text-gray-500 font-medium">Experience Level / Graduation Year</p>
                <p className="text-gray-800">{currentUser?.graduationYear || 'NA'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Plan Status below user info */}
        {activePlan ? (
          <div className="border-t border-gray-100 pt-5">
            <div className="flex items-center mb-3">
              <ChartBarIcon className="h-6 w-6 text-primary mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Your Plan</h2>
            </div>
            
            <div className="space-y-3 pl-2">
              <p className="text-md font-medium text-gray-800">
                {activePlan.planId.name}
              </p>
              
              {activePlan.planId.isUnlimited ? (
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-1.5" />
                  <p className="text-sm text-gray-600">
                    Unlimited resume checks
                  </p>
                </div>
              ) : (
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-1.5" />
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{activePlan.creditsLeft}</span> of {activePlan.planId.credits} checks remaining
                  </p>
                </div>
              )}
              
              {activePlan.expiresAt && (
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-blue-500 mr-1.5" />
                  <p className="text-sm text-gray-600">
                    {getDaysRemaining(activePlan.expiresAt) > 0 ? (
                      <>Expires in <span className="font-medium">{getDaysRemaining(activePlan.expiresAt)}</span> days</>
                    ) : (
                      <>Expired on {formatDate(activePlan.expiresAt)}</>
                    )}
                  </p>
                </div>
              )}
              
              <div className="mt-3">
                <motion.a
                  href="/dashboard/plans"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="text-sm text-primary font-medium hover:underline"
                >
                  Upgrade Plan →
                </motion.a>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-t border-gray-100 pt-5">
            <div className="flex items-center mb-3">
              <ChartBarIcon className="h-6 w-6 text-primary mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Your Plan</h2>
            </div>
            <p className="text-gray-600 mb-3">You don't have an active plan.</p>
            <motion.a
              href="/dashboard/plans"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-primary text-white rounded-lg inline-block"
            >
              Get a Plan
            </motion.a>
          </div>
        )}
      </div>
      
      {/* Resume Upload Box */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <motion.div
          className={`bg-white rounded-xl shadow-sm p-6 border-2 ${
            isDragging ? 'border-primary border-dashed bg-blue-50' : uploadSuccess ? 'border-green-400' : 'border-gray-200'
          } transition-colors duration-200`}
          whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!uploadSuccess ? (
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <PaperClipIcon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Your Resume</h3>
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop your resume, or click to browse.
                <br />
                PDF, DOCX, or TXT format (Max 5MB)
              </p>
              <label htmlFor="file-upload" className="cursor-pointer">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mx-auto px-4 py-2 bg-primary text-white rounded-lg inline-flex items-center"
                >
                  <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                  Browse Files
                </motion.div>
                <input 
                  id="file-upload" 
                  type="file" 
                  accept=".pdf,.docx,.doc,.txt" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </label>
            </div>
          ) : (
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="mx-auto w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
                <CheckCircleIcon className="h-7 w-7 text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Resume Uploaded!</h3>
              <p className="text-sm text-gray-600 mb-2">
                {uploadedFile?.name}
              </p>
              <div className="flex items-center justify-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm inline-flex items-center"
                  onClick={() => setUploadSuccess(false)}
                >
                  Upload Another
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1 bg-primary text-white rounded-lg text-sm inline-flex items-center"
                >
                  <DocumentTextIcon className="h-4 w-4 mr-1" />
                  View Resume
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
      
      {/* Marketing Blurbs */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Why ResumeZen Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {marketingBlurbs.map((blurb, index) => (
            <motion.div 
              key={index}
              className="bg-gray-50 rounded-lg p-4"
              whileHover={{ y: -5, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="font-medium text-primary mb-2">{blurb.title}</h3>
              <p className="text-sm text-gray-600">{blurb.description}</p>
            </motion.div>
          ))}
        </div>
        
        {/* Testimonial/Quote */}
        <motion.div 
          className="mt-8 bg-blue-50 rounded-lg p-5 border-l-4 border-primary"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-gray-800 italic mb-2">"{testimonial.quote}"</p>
          <p className="text-sm text-gray-600 text-right">— {testimonial.source}</p>
        </motion.div>
      </div>
    </div>
  );
} 