import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  UserCircleIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  ArrowRightIcon,
  PlayIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import VlogModal from '../components/VlogModal';
import EditProfileModal from '../components/EditProfileModal';
import { useState } from 'react';
import FileUploadBox from '../components/FileUploadBox';

// Dummy data
const dummyData = {
  user: {
    username: "Rohan Singh",
    email: "rohan@example.com",
    phone: "+91-9876543210",
    purchased_plan: "3 Resume Checks Left",
    initials: "RS",
    remaining_checks: 3,
    plan_type: "regular" // can be "regular" or "unlimited"
  },
  resumes: [
    {
      id: 1,
      file_name: "Resume_SDE1.pdf",
      upload_date: "2025-04-25",
      ats_score: "82%",
      suggestions: "Add more keywords like 'JavaScript', 'Leadership'.",
      improvement_areas: {
        keywords: 82,
        formatting: 88,
        content: 75,
        relevance: 85
      },
      detailed_feedback: {
        strengths: [
          "Excellent technical skills section",
          "Clear project descriptions",
          "Good use of action verbs",
          "Professional formatting"
        ],
        weaknesses: [
          "Could use more leadership examples",
          "Some technical keywords missing",
          "Achievement metrics could be clearer",
          "Summary could be more impactful"
        ],
        improvement_tips: [
          "Add specific JavaScript framework experience",
          "Include team size in project descriptions",
          "Quantify performance improvements",
          "Highlight leadership roles in projects"
        ]
      }
    },
    {
      id: 2,
      file_name: "Resume_Intern.pdf",
      upload_date: "2025-04-22",
      ats_score: "75%",
      suggestions: "Highlight your projects better.",
      improvement_areas: {
        keywords: 70,
        formatting: 78,
        content: 75,
        relevance: 77
      },
      detailed_feedback: {
        strengths: [
          "Good academic achievements",
          "Relevant internship experience",
          "Clear technical skills list",
          "Well-organized sections"
        ],
        weaknesses: [
          "Limited professional experience",
          "Project impacts not quantified",
          "Technical depth could be improved",
          "Some sections too brief"
        ],
        improvement_tips: [
          "Add metrics to project outcomes",
          "Expand on technical challenges solved",
          "Include relevant coursework",
          "Detail internship achievements"
        ]
      }
    }
  ],
  vlogs: [
    {
      id: 1,
      title: "Mastering Your ATS Game 🎯",
      thumbnail: "https://img.youtube.com/vi/PPXAQ8W13cY/maxresdefault.jpg",
      video_link: "https://youtube.com",
      video_embed_url: "https://www.youtube.com/embed/PPXAQ8W13cY",
      short_description: "Want to boost your ATS score instantly? This 3-minute tip will help you optimize your resume to get noticed by recruiters!",
      full_description: "In this video, we dive into simple but powerful ways you can optimize your resume to pass through ATS systems. Learn how to focus on the right keywords, formatting, and structure to make sure your resume gets to the hiring manager's desk.",
      views: "15.2K",
      upload_date: "2024-03-15",
      key_points: [
        "Understanding ATS algorithms",
        "Keyword optimization techniques",
        "Format-friendly templates",
        "Common ATS mistakes to avoid"
      ]
    },
    {
      id: 2,
      title: "Resume Design Secrets 2024 ✨",
      thumbnail: "https://img.youtube.com/vi/Q_jbVpzCvBU/maxresdefault.jpg",
      video_link: "https://youtube.com",
      video_embed_url: "https://www.youtube.com/embed/Q_jbVpzCvBU",
      short_description: "Learn the art of modern resume design that catches attention while staying professional and ATS-friendly.",
      full_description: "Discover the perfect balance between creativity and professionalism in resume design. This comprehensive guide shows you how to make your resume visually appealing while maintaining ATS compatibility.",
      views: "12.8K",
      upload_date: "2024-03-10",
      key_points: [
        "Modern resume layouts",
        "Professional font combinations",
        "Strategic use of white space",
        "Color psychology in resumes"
      ]
    },
    {
      id: 3,
      title: "LinkedIn Profile Optimization 💼",
      thumbnail: "https://img.youtube.com/vi/aD7fP-2u3iY/maxresdefault.jpg",
      video_link: "https://youtube.com",
      video_embed_url: "https://www.youtube.com/embed/aD7fP-2u3iY",
      short_description: "Sync your resume with your LinkedIn profile to create a powerful personal brand that recruiters can't ignore.",
      full_description: "Learn how to create a cohesive personal brand across your resume and LinkedIn profile. This video guides you through optimizing your LinkedIn presence to complement your resume and attract top opportunities.",
      views: "9.6K",
      upload_date: "2024-03-05",
      key_points: [
        "Profile optimization tips",
        "Keyword strategy for visibility",
        "Content synchronization",
        "Networking best practices"
      ]
    },
    {
      id: 4,
      title: "Interview Success Stories 🌟",
      thumbnail: "https://img.youtube.com/vi/TqgCj-Gqkqk/maxresdefault.jpg",
      video_link: "https://youtube.com",
      video_embed_url: "https://www.youtube.com/embed/TqgCj-Gqkqk",
      short_description: "Real stories and strategies from candidates who landed their dream jobs using our resume tips.",
      full_description: "Get inspired by success stories from real job seekers who transformed their job search journey. Learn the exact strategies they used to optimize their resumes and ace their interviews.",
      views: "18.3K",
      upload_date: "2024-02-28",
      key_points: [
        "Real success stories",
        "Practical implementation tips",
        "Common challenges overcome",
        "Interview preparation insights"
      ]
    },
    {
      id: 5,
      title: "Resume Red Flags to Avoid ⚠️",
      thumbnail: "https://img.youtube.com/vi/omoHx8hDl-g/maxresdefault.jpg",
      video_link: "https://youtube.com",
      video_embed_url: "https://www.youtube.com/embed/omoHx8hDl-g",
      short_description: "Don't let these common resume mistakes cost you your dream job! Learn what to avoid and how to fix them.",
      full_description: "Identify and eliminate critical resume mistakes that could be holding you back. This comprehensive guide helps you spot and fix common resume red flags that recruiters instantly notice.",
      views: "21.5K",
      upload_date: "2024-02-20",
      key_points: [
        "Common formatting mistakes",
        "Content red flags",
        "Professional alternatives",
        "Before-after examples"
      ]
    }
  ],
  plans: [
    { price: "₹19", checks: 1 },
    { price: "₹70", checks: 5 },
    { 
      price: "₹500",
      title: "Unlimited Pack",
      period: "3 months",
      description: "Unlimited resume checks with premium features"
    }
  ]
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedVlog, setSelectedVlog] = useState(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPlanAlert, setShowPlanAlert] = useState(false);
  const [remainingChecks, setRemainingChecks] = useState(dummyData.user.remaining_checks);
  const [isPlanUnlimited, setIsPlanUnlimited] = useState(dummyData.user.plan_type === "unlimited");
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState("");
  const [showUnlimitedAlert, setShowUnlimitedAlert] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [resumes, setResumes] = useState(dummyData.resumes);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [uploadComponent, setUploadComponent] = useState(0); // Key for forcing re-render
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);

  const getFirstName = (fullName) => {
    return fullName.split(' ')[0];
  };

  const handleProfileUpdate = ({ name, photo }) => {
    console.log('Updating profile:', { name, photo });
    setIsEditProfileOpen(false);
  };

  const handleFileSelect = (file) => {
    if (remainingChecks <= 0 && !isPlanUnlimited) {
      setShowPlanAlert(true);
      return;
    }
    setSelectedFile(file);
  };

  const handleUploadConfirm = () => {
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
  };

  const handlePurchasePlan = (plan) => {
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
  };

  const handleViewFeedback = (resume) => {
    setSelectedResume(resume);
    setShowFeedback(true);
  };

  const clearUploadArea = () => {
    setSelectedFile(null);
    setUploadComponent(prev => prev + 1); // Force re-render of upload component
  };

  // Plan alert modal
  const PlanAlertModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 text-yellow-600 mb-4">
          <ExclamationTriangleIcon className="w-6 h-6" />
          <h3 className="text-xl font-semibold">No Checks Remaining</h3>
        </div>
        <p className="text-gray-600 mb-6">
          You've used all your resume checks. Purchase more checks to continue using our ATS optimization service.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowPlanAlert(false)}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setShowPlanAlert(false);
              // Scroll to pricing section
              document.querySelector('#pricing-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            View Plans
          </button>
        </div>
      </div>
    </motion.div>
  );

  // Unlimited Plan Alert Modal
  const UnlimitedPlanAlert = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 text-blue-600 mb-4">
          <InformationCircleIcon className="w-6 h-6" />
          <h3 className="text-xl font-semibold">Already on Unlimited Plan</h3>
        </div>
        <p className="text-gray-600 mb-6">
          You already have an active unlimited plan. You can continue using unlimited resume checks until your plan expires.
        </p>
        <div className="flex justify-end">
          <button
            onClick={() => setShowUnlimitedAlert(false)}
            className="px-4 py-2 text-white bg-primary hover:bg-primary/90 rounded-lg"
          >
            Got it
          </button>
        </div>
      </div>
    </motion.div>
  );

  // Success Toast Component
  const SuccessToast = () => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-4 right-4 bg-green-50 text-green-800 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50"
    >
      <CheckCircleIcon className="w-5 h-5" />
      <span>{purchaseMessage}</span>
    </motion.div>
  );

  // Loading Modal
  const LoadingModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center">
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 text-primary"
          >
            <ClockIcon className="w-16 h-16" />
          </motion.div>
        </div>
        <h3 className="text-xl font-semibold mb-2">Analyzing Your Resume</h3>
        <p className="text-gray-600">
          Our AI is reviewing your resume for ATS optimization and generating detailed feedback...
        </p>
      </div>
    </motion.div>
  );

  // Analysis Result Modal
  const AnalysisModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-semibold">Resume Analysis Complete</h3>
            <p className="text-gray-600">Here's how your resume performs against ATS systems</p>
          </div>
          <button
            onClick={() => {
              setShowAnalysis(false);
              clearUploadArea();
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-primary/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Overall ATS Score</h4>
              <span className="text-2xl font-bold text-primary">{analysisResult?.ats_score}</span>
            </div>
            <div className="space-y-4">
              {Object.entries(analysisResult?.improvement_areas || {}).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{key}</span>
                    <span>{value}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold mb-4">Suggestions for Improvement</h4>
            <ul className="space-y-3">
              {analysisResult?.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <ChartBarIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => {
              setShowAnalysis(false);
              clearUploadArea();
              // Update remaining checks if not unlimited plan
              if (!isPlanUnlimited) {
                setRemainingChecks(prev => prev - 1);
                dummyData.user.purchased_plan = `${remainingChecks - 1} Resume Checks Left`;
              }
            }}
            className="px-4 py-2 text-white bg-primary hover:bg-primary/90 rounded-lg"
          >
            Got it
          </button>
        </div>
      </div>
    </motion.div>
  );

  // Feedback Modal
  const FeedbackModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-semibold">Resume Feedback</h3>
            <p className="text-gray-600">{selectedResume?.file_name}</p>
          </div>
          <button
            onClick={() => setShowFeedback(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* ATS Score */}
          <div className="bg-primary/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">ATS Score</h4>
              <span className="text-2xl font-bold text-primary">{selectedResume?.ats_score}</span>
            </div>
            <div className="space-y-4">
              {Object.entries(selectedResume?.improvement_areas || {}).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{key}</span>
                    <span>{value}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths */}
          <div className="bg-green-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold mb-4 text-green-700">Strengths</h4>
            <ul className="space-y-3">
              {selectedResume?.detailed_feedback.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-green-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="bg-red-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold mb-4 text-red-700">Areas for Improvement</h4>
            <ul className="space-y-3">
              {selectedResume?.detailed_feedback.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-red-700">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Improvement Tips */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold mb-4 text-blue-700">Actionable Tips</h4>
            <ul className="space-y-3">
              {selectedResume?.detailed_feedback.improvement_tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <ChartBarIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-blue-700">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={() => setShowFeedback(false)}
            className="px-4 py-2 text-white bg-primary hover:bg-primary/90 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </motion.div>
  );

  // Live Chat Modal
  const LiveChatModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={() => setShowLiveChat(false)}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-xl font-semibold">Live Chat Coming Soon!</h3>
          </div>
          <button
            onClick={() => setShowLiveChat(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <p className="text-gray-600 mb-4">
          We're working hard to bring you real-time chat support with our resume experts. This feature will be available soon!
        </p>
        <p className="text-gray-600 mb-6">
          In the meantime, you can reach us at support@resumezen.com for assistance.
        </p>
        <div className="flex justify-end">
          <button
            onClick={() => setShowLiveChat(false)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  // Schedule Call Modal
  const ScheduleCallModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={() => setShowSchedule(false)}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold">Schedule a Call</h3>
          </div>
          <button
            onClick={() => setShowSchedule(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <p className="text-gray-600 mb-4">
          Our 1:1 resume review scheduling system is coming soon! You'll be able to book personalized sessions with our expert resume reviewers.
        </p>
        <p className="text-gray-600 mb-6">
          Features will include:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
          <li>30-minute dedicated sessions</li>
          <li>Expert resume feedback</li>
          <li>Career path guidance</li>
          <li>Industry-specific tips</li>
        </ul>
        <div className="flex justify-end">
          <button
            onClick={() => setShowSchedule(false)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Looking forward to it!
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  // FAQ Modal
  const FAQModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={() => setShowFAQ(false)}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold">Frequently Asked Questions</h3>
          </div>
          <button
            onClick={() => setShowFAQ(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {[
            {
              q: "What is ATS optimization?",
              a: "ATS (Applicant Tracking System) optimization ensures your resume is readable by automated screening systems used by employers. Our system analyzes and optimizes your resume to increase its chances of passing through these systems."
            },
            {
              q: "How does the resume check system work?",
              a: "Our AI-powered system analyzes your resume across multiple parameters including keywords, formatting, content relevance, and overall structure. It then provides detailed feedback and suggestions for improvement."
            },
            {
              q: "What's included in the unlimited plan?",
              a: "The unlimited plan gives you unlimited resume checks for 3 months, detailed ATS feedback, improvement suggestions, and priority support. You can test different versions of your resume as many times as you need."
            },
            {
              q: "How accurate is the ATS score?",
              a: "Our ATS scoring system is based on extensive research and real-world data from successful job applications. While no system is perfect, our scores provide a reliable indicator of your resume's effectiveness."
            },
            {
              q: "Can I use multiple resume formats?",
              a: "Yes! You can upload and test different resume formats. We recommend using our system to optimize each version for different job applications."
            },
            {
              q: "How often should I update my resume?",
              a: "We recommend updating your resume every 3-6 months or whenever you have new achievements or skills to add. Regular updates help keep your resume current and competitive."
            }
          ].map((faq, index) => (
            <div key={index} className="border-b pb-4 last:border-b-0">
              <h4 className="font-semibold text-lg mb-2 text-gray-900">{faq.q}</h4>
              <p className="text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={() => setShowFAQ(false)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  // Help/Support Section Component
  const HelpSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-xl shadow-md p-6"
    >
      <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
      <div className="space-y-4">
        {/* Email Support */}
        <div className="border rounded-lg p-4 hover:border-primary transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="font-semibold">Email Support</h3>
          </div>
          <p className="text-gray-600 mb-3">Get help with your resume or account</p>
          <a 
            href="mailto:support@resumezen.com"
            className="text-primary hover:text-secondary flex items-center gap-1 text-sm"
          >
            support@resumezen.com
            <ArrowRightIcon className="w-4 h-4" />
          </a>
        </div>

        {/* Live Chat */}
        <div className="border rounded-lg p-4 hover:border-primary transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="font-semibold">Live Chat</h3>
          </div>
          <p className="text-gray-600 mb-3">Chat with our resume experts</p>
          <button 
            onClick={() => setShowLiveChat(true)}
            className="text-primary hover:text-secondary flex items-center gap-1 text-sm"
          >
            Start Chat
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>

        {/* FAQ */}
        <div className="border rounded-lg p-4 hover:border-primary transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold">FAQ</h3>
          </div>
          <p className="text-gray-600 mb-3">Find answers to common questions</p>
          <button 
            onClick={() => setShowFAQ(true)}
            className="text-primary hover:text-secondary flex items-center gap-1 text-sm"
          >
            View FAQ
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Schedule Call */}
        <div className="border rounded-lg p-4 hover:border-primary transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold">Schedule a Call</h3>
          </div>
          <p className="text-gray-600 mb-3">Book a 1:1 resume review session</p>
          <button 
            onClick={() => setShowSchedule(true)}
            className="text-primary hover:text-secondary flex items-center gap-1 text-sm"
          >
            Book Time
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );

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
                Hey buddy 👋
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                {dummyData.user.initials}
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
            {/* Profile Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md p-6 overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-xl font-semibold flex-shrink-0">
                    {dummyData.user.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                      {getFirstName(dummyData.user.username)}
                    </h2>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditProfileOpen(true)}
                  className="flex items-center gap-2 text-primary hover:text-secondary whitespace-nowrap flex-shrink-0"
                >
                  <PencilSquareIcon className="w-5 h-5" />
                  <span>Edit Profile</span>
                </motion.button>
              </div>
              <div className="space-y-4 w-full">
                <div className="bg-gray-50 rounded-lg p-4 overflow-hidden">
                  <p className="text-gray-600">Email</p>
                  <p className="font-medium truncate">{dummyData.user.email}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 overflow-hidden">
                  <p className="text-gray-600">Phone</p>
                  <p className="font-medium truncate">{dummyData.user.phone}</p>
                </div>
                <div className="bg-primary/5 rounded-lg p-4 overflow-hidden">
                  <p className="text-primary font-semibold">Current Plan</p>
                  <p className="text-lg font-bold truncate">{dummyData.user.purchased_plan}</p>
                </div>
              </div>
            </motion.div>

            {/* Payment Info Section */}
            <motion.div
              id="pricing-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-xl font-semibold mb-4">Buy More Resume Checks</h2>
              <div className="space-y-4">
                {dummyData.plans.map((plan, index) => (
                  <div key={index} className={`border rounded-lg p-4 hover:border-primary transition-colors ${
                    plan.title === 'Unlimited Pack' ? 'bg-primary/5' : ''
                  }`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-semibold">
                          {plan.title || `${plan.checks} ${plan.checks === 1 ? 'Check' : 'Checks'}`}
                        </p>
                        {plan.description && (
                          <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                        )}
                        <div className="flex items-baseline mt-1">
                          <p className="text-2xl font-bold text-primary">{plan.price}</p>
                          <span className="text-gray-600 ml-1">
                            {plan.period ? `/${plan.period}` : ''}
                          </span>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePurchasePlan(plan)}
                        className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                      >
                        Buy Now
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Add Help Section */}
            <HelpSection />
          </div>

          {/* Center Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upload Resume Section - Add key for forcing re-render */}
            <motion.div
              key={uploadComponent}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-xl font-semibold mb-6">Upload Resume</h2>
              <div className="space-y-4">
                <FileUploadBox onFileSelect={handleFileSelect} />
                
                {/* Confirmation button */}
                <AnimatePresence>
                  {selectedFile && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex justify-end"
                    >
                      <button
                        onClick={handleUploadConfirm}
                        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                      >
                        <span>Process Resume</span>
                        <ArrowRightIcon className="w-5 h-5" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Resume History - Update with feedback button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-xl font-semibold mb-6">Resume History</h2>
              <div className="space-y-4">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className="border rounded-lg p-4 hover:border-primary transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <DocumentTextIcon className="w-10 h-10 text-primary" />
                      <div className="flex-1">
                        <h3 className="font-medium">{resume.file_name}</h3>
                        <p className="text-sm text-gray-600">Uploaded on {resume.upload_date}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-primary">
                          ATS Score: {resume.ats_score}
                        </div>
                        <button 
                          onClick={() => handleViewFeedback(resume)}
                          className="text-primary hover:text-secondary flex items-center gap-1 text-sm"
                        >
                          View Feedback
                          <ArrowRightIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Motivational Vlogs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-xl font-semibold mb-6">Recommended Vlogs</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {dummyData.vlogs.map((vlog) => (
                  <motion.div
                    key={vlog.id}
                    onClick={() => setSelectedVlog(vlog)}
                    className="group relative rounded-lg overflow-hidden cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                  >
                    <img
                      src={vlog.thumbnail}
                      alt={vlog.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayIcon className="w-16 h-16 text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4">
                      <h3 className="text-white font-medium mb-2">{vlog.title}</h3>
                      <p className="text-gray-300 text-sm line-clamp-2">{vlog.short_description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showPlanAlert && <PlanAlertModal />}
        {showUnlimitedAlert && <UnlimitedPlanAlert />}
        {isProcessing && <LoadingModal />}
        {showAnalysis && <AnalysisModal />}
        {showFeedback && <FeedbackModal />}
        {showLiveChat && <LiveChatModal />}
        {showSchedule && <ScheduleCallModal />}
        {showFAQ && <FAQModal />}
        {selectedVlog && (
          <VlogModal vlog={selectedVlog} onClose={() => setSelectedVlog(null)} />
        )}
        {isEditProfileOpen && (
          <EditProfileModal
            user={dummyData.user}
            onClose={() => setIsEditProfileOpen(false)}
            onSave={handleProfileUpdate}
          />
        )}
        {showPurchaseSuccess && <SuccessToast />}
      </AnimatePresence>
    </div>
  );
} 