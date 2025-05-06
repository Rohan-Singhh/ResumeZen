import React from 'react';
import { AnimatePresence } from 'framer-motion';
import AlertModal from './modals/AlertModal';
import SupportModal from './modals/SupportModal';
import VlogModal from '../components/VlogModal';
import EditProfileModal from '../components/EditProfileModal';
import { clearUploadArea, handleProfileUpdate } from './dashboardUtils';

export default function ModalRenderer(props) {
  // Destructure modal state and handlers from props
  const {
    showPlanAlert, setShowPlanAlert,
    showUnlimitedAlert, setShowUnlimitedAlert,
    isProcessing,
    showAnalysis, setShowAnalysis,
    showFeedback, setShowFeedback,
    showLiveChat, setShowLiveChat,
    showSchedule, setShowSchedule,
    showFAQ, setShowFAQ,
    selectedVlog, setSelectedVlog,
    isEditProfileOpen, setIsEditProfileOpen,
    showPurchaseSuccess,
    purchaseMessage,
    analysisResult,
    selectedResume,
    setSelectedFile,
    setUploadComponent,
  } = props;

  // View Plans handler for the plan alert modal
  const handleViewPlans = () => {
    setShowPlanAlert(false);
    // Scroll to pricing section using DOM API
    document.querySelector('#pricing-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {showPlanAlert && (
        <AlertModal 
          type="plan" 
          onCancel={() => setShowPlanAlert(false)}
          onViewPlans={handleViewPlans}
        />
      )}
      
      {showUnlimitedAlert && (
        <AlertModal 
          type="unlimited" 
          onClose={() => setShowUnlimitedAlert(false)}
        />
      )}
      
      {isProcessing && (
        <AlertModal type="loading" />
      )}
      
      {showAnalysis && (
        <AlertModal 
          type="analysis" 
          analysisResult={analysisResult}
          onClose={() => setShowAnalysis(false)}
          clearUploadArea={() => clearUploadArea(setSelectedFile, setUploadComponent)}
        />
      )}
      
      {showFeedback && (
        <AlertModal 
          type="feedback" 
          selectedResume={selectedResume}
          onClose={() => setShowFeedback(false)}
        />
      )}
      
      {showLiveChat && (
        <SupportModal 
          type="livechat" 
          onClose={() => setShowLiveChat(false)}
        />
      )}
      
      {showSchedule && (
        <SupportModal 
          type="schedule" 
          onClose={() => setShowSchedule(false)}
        />
      )}
      
      {showFAQ && (
        <SupportModal 
          type="faq" 
          onClose={() => setShowFAQ(false)}
        />
      )}
      
      {showPurchaseSuccess && (
        <AlertModal 
          type="success" 
          message={purchaseMessage}
        />
      )}
      
      {selectedVlog && (
        <VlogModal 
          vlog={selectedVlog} 
          onClose={() => setSelectedVlog(null)}
        />
      )}
      
      {isEditProfileOpen && (
        <EditProfileModal
          user={props.user}
          onClose={() => setIsEditProfileOpen(false)}
          onSave={(data) => handleProfileUpdate(data, setIsEditProfileOpen)}
        />
      )}
    </AnimatePresence>
  );
} 