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
  ExclamationTriangleIcon
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
      suggestions: "Add more keywords like 'JavaScript', 'Leadership'."
    },
    {
      id: 2,
      file_name: "Resume_Intern.pdf",
      upload_date: "2025-04-22",
      ats_score: "75%",
      suggestions: "Highlight your projects better."
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
  const [isPlanUnlimited] = useState(dummyData.user.plan_type === "unlimited");

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
    // Here you would typically handle the actual upload
    console.log('Processing file:', selectedFile);
    
    // Update remaining checks if not unlimited plan
    if (!isPlanUnlimited) {
      setRemainingChecks(prev => prev - 1);
      // Update the displayed plan text
      dummyData.user.purchased_plan = `${remainingChecks - 1} Resume Checks Left`;
    }
    
    // Reset selected file
    setSelectedFile(null);
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
                        className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                      >
                        Buy Now
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Center Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upload Resume Section */}
            <motion.div
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

            {/* Resume History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-xl font-semibold mb-6">Resume History</h2>
              <div className="space-y-4">
                {dummyData.resumes.map((resume) => (
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
                        <button className="text-primary hover:text-secondary flex items-center gap-1 text-sm">
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
      </AnimatePresence>
    </div>
  );
} 