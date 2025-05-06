import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDashboardState } from './dashboardState';
import dummyData from './dashboardData';
import {
  getFirstName,
  handleProfileUpdate,
  handleFileSelect,
  handleUploadConfirm,
  handlePurchasePlan,
  handleViewFeedback,
  clearUploadArea
} from './dashboardUtils';
import { ProfileCard, PlanSection, HelpSection, UploadBox, ResumeHistory, VlogList } from './sections';
import ModalRenderer from './ModalRenderer';

export default function Dashboard() {
  const navigate = useNavigate();
  const state = useDashboardState();

  // User data for profile card
  const user = {
    name: dummyData.user.username,
    email: dummyData.user.email,
    phone: dummyData.user.phone,
    plan: dummyData.user.purchased_plan,
    initials: dummyData.user.initials,
  };

  // Section handlers
  const onEditProfile = () => state.setIsEditProfileOpen(true);
  const onPurchasePlan = plan => handlePurchasePlan(
    plan,
    state.isPlanUnlimited,
    state.setShowUnlimitedAlert,
    state.setIsPlanUnlimited,
    state.setPurchaseMessage,
    state.setShowPurchaseSuccess,
    state.remainingChecks,
    state.setRemainingChecks
  );
  const onFileSelect = file => handleFileSelect(
    file,
    state.remainingChecks,
    state.isPlanUnlimited,
    state.setShowPlanAlert,
    state.setSelectedFile
  );
  const onUploadConfirm = () => handleUploadConfirm({
    selectedFile: state.selectedFile,
    resumes: state.resumes,
    setResumes: state.setResumes,
    setAnalysisResult: state.setAnalysisResult,
    setIsProcessing: state.setIsProcessing,
    setShowAnalysis: state.setShowAnalysis,
    isPlanUnlimited: state.isPlanUnlimited,
    remainingChecks: state.remainingChecks,
    setRemainingChecks: state.setRemainingChecks
  });
  const onViewFeedback = resume => handleViewFeedback(resume, state.setSelectedResume, state.setShowFeedback);
  const onVlogSelect = vlog => state.setSelectedVlog(vlog);

  // Help section handlers
  const onEmail = () => window.location = 'mailto:support@resumezen.com';
  const onLiveChat = () => state.setShowLiveChat(true);
  const onFAQ = () => state.setShowFAQ(true);
  const onSchedule = () => state.setShowSchedule(true);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">ResumeZen</span>
              <span className="text-2xl">🚀</span>
            </div>
            <div className="flex-1 mx-8 text-right">
              <h2 className="text-xl text-gray-700">
                Hey {getFirstName(user.name)} 👋
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                {user.initials}
              </div>
              <motion.button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-600 hover:text-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <ProfileCard user={user} onEdit={onEditProfile} />
            <PlanSection plans={dummyData.plans} onPurchase={onPurchasePlan} />
            <HelpSection onEmail={onEmail} onLiveChat={onLiveChat} onFAQ={onFAQ} onSchedule={onSchedule} />
          </div>

          {/* Center Column */}
          <div className="lg:col-span-2 space-y-8">
            <UploadBox 
              key={state.uploadComponent}
              onFileSelect={onFileSelect} 
              onConfirm={onUploadConfirm} 
              selectedFile={state.selectedFile} 
            />
            <ResumeHistory resumes={state.resumes} onViewFeedback={onViewFeedback} />
            <VlogList vlogs={dummyData.vlogs} onSelect={onVlogSelect} />
          </div>
        </div>
      </main>

      {/* Render all modals */}
      <ModalRenderer 
        {...state} 
        user={dummyData.user}
        clearUploadArea={() => clearUploadArea(state.setSelectedFile, state.setUploadComponent)}
      />
    </div>
  );
} 