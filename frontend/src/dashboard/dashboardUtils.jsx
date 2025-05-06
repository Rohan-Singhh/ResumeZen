// Handler and utility functions for Dashboard
// Example stubs, to be filled in with actual logic from original Dashboard.jsx

import dummyData from './dashboardData';

export function getFirstName(fullName) {
  return fullName.split(' ')[0];
}

export function handleProfileUpdate({ name, photo }, setIsEditProfileOpen) {
  console.log('Updating profile:', { name, photo });
  setIsEditProfileOpen(false);
}

export function handleFileSelect(file, remainingChecks, isPlanUnlimited, setShowPlanAlert, setSelectedFile) {
  if (remainingChecks <= 0 && !isPlanUnlimited) {
    setShowPlanAlert(true);
    return;
  }
  setSelectedFile(file);
}

export function handleUploadConfirm({
  selectedFile,
  resumes,
  setResumes,
  setAnalysisResult,
  setIsProcessing,
  setShowAnalysis,
  isPlanUnlimited,
  remainingChecks,
  setRemainingChecks
}) {
  setIsProcessing(true);

  // Simulate processing delay
  setTimeout(() => {
    // Generate dummy analysis result
    const result = {
      file_name: selectedFile.name,
      upload_date: new Date().toISOString().split('T')[0],
      ats_score: Math.floor(Math.random() * (95 - 70) + 70) + "%",
      suggestions: [
        "Add more quantifiable achievements",
        "Include relevant industry keywords",
        "Improve action verbs in job descriptions",
        "Make sure contact information is prominent"
      ],
      improvement_areas: {
        keywords: Math.floor(Math.random() * (100 - 60) + 60),
        formatting: Math.floor(Math.random() * (100 - 70) + 70),
        content: Math.floor(Math.random() * (100 - 65) + 65),
        relevance: Math.floor(Math.random() * (100 - 75) + 75)
      }
    };

    // Update resumes list with detailed feedback
    const newResume = {
      id: resumes.length + 1,
      file_name: result.file_name,
      upload_date: result.upload_date,
      ats_score: result.ats_score,
      suggestions: result.suggestions.join(" "),
      improvement_areas: result.improvement_areas,
      detailed_feedback: {
        strengths: [
          "Strong professional summary",
          "Clear section organization",
          "Relevant skills highlighted",
          "Consistent formatting"
        ],
        weaknesses: [
          "Limited quantifiable results",
          "Some industry keywords missing",
          "Action verbs could be stronger",
          "Contact info needs better placement"
        ],
        improvement_tips: [
          "Add metrics to showcase achievements",
          "Research and include more industry-specific terms",
          "Use power words in job descriptions",
          "Ensure contact details are prominent"
        ]
      }
    };

    setResumes([newResume, ...resumes]);
    setAnalysisResult(result);
    setIsProcessing(false);
    setShowAnalysis(true);

    // Update remaining checks if not unlimited plan
    if (!isPlanUnlimited) {
      setRemainingChecks(prev => prev - 1);
      dummyData.user.purchased_plan = `${remainingChecks - 1} Resume Checks Left`;
    }
  }, 5000);
}

export function handlePurchasePlan(
  plan, 
  isPlanUnlimited, 
  setShowUnlimitedAlert, 
  setIsPlanUnlimited, 
  setPurchaseMessage, 
  setShowPurchaseSuccess, 
  remainingChecks, 
  setRemainingChecks
) {
  if (isPlanUnlimited) {
    setShowUnlimitedAlert(true);
    return;
  }

  if (plan.title === "Unlimited Pack") {
    setIsPlanUnlimited(true);
    dummyData.user.plan_type = "unlimited";
    dummyData.user.purchased_plan = "Unlimited Checks (3 months)";
    setPurchaseMessage("Successfully upgraded to Unlimited Plan!");
  } else {
    const newChecks = remainingChecks + plan.checks;
    setRemainingChecks(newChecks);
    dummyData.user.remaining_checks = newChecks;
    dummyData.user.purchased_plan = `${newChecks} Resume Checks Left`;
    setPurchaseMessage(`Successfully added ${plan.checks} checks to your plan!`);
  }
  setShowPurchaseSuccess(true);
  setTimeout(() => setShowPurchaseSuccess(false), 3000);
}

export function handleViewFeedback(resume, setSelectedResume, setShowFeedback) {
  setSelectedResume(resume);
  setShowFeedback(true);
}

export function clearUploadArea(setSelectedFile, setUploadComponent) {
  setSelectedFile(null);
  setUploadComponent(prev => prev + 1); // Force re-render of upload component
}

// Add other handlers: handleFileSelect, handleUploadConfirm, handlePurchasePlan, handleViewFeedback, clearUploadArea, etc. 