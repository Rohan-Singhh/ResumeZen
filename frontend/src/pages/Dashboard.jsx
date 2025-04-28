import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  UserCircleIcon,
  DocumentPlusIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
  BellIcon,
  PencilSquareIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

// Mock data for demonstration
const mockUser = {
  name: "John Doe",
  email: "john@example.com",
  avatarUrl: null,
  stats: {
    resumesCreated: 3,
    avgATSScore: 85,
    lastLogin: "2024-03-15"
  }
};

const mockResumes = [
  {
    id: 1,
    title: "Software Developer Resume",
    createdAt: "2024-03-10",
    modifiedAt: "2024-03-12",
    atsScore: 88,
    template: "Professional"
  },
  {
    id: 2,
    title: "Product Manager Resume",
    createdAt: "2024-03-08",
    modifiedAt: "2024-03-08",
    atsScore: 82,
    template: "Modern"
  }
];

const mockTips = [
  {
    id: 1,
    title: "10 Keywords That Get You Noticed",
    type: "Article",
    readTime: "5 min"
  },
  {
    id: 2,
    title: "Crafting an Impactful Summary",
    type: "Video",
    readTime: "3 min"
  },
  {
    id: 3,
    title: "2024 Resume Trends",
    type: "Article",
    readTime: "7 min"
  }
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary">ResumeZen</span>
            </div>
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative text-gray-600 hover:text-primary"
              >
                <BellIcon className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  2
                </span>
              </motion.button>
              <motion.button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-600 hover:text-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>👋</span>
                <span>Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* User Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  {mockUser.avatarUrl ? (
                    <img
                      src={mockUser.avatarUrl}
                      alt={mockUser.name}
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <UserCircleIcon className="w-16 h-16 text-gray-400" />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{mockUser.name}</h2>
                    <p className="text-gray-600">{mockUser.email}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 text-primary hover:text-secondary"
                >
                  <PencilSquareIcon className="w-5 h-5" />
                  <span>Edit Profile</span>
                </motion.button>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-primary">{mockUser.stats.resumesCreated}</div>
                  <div className="text-sm text-gray-600">Resumes Created</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-primary">{mockUser.stats.avgATSScore}%</div>
                  <div className="text-sm text-gray-600">Avg. ATS Score</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-primary">
                    {new Date(mockUser.stats.lastLogin).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600">Last Login</div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <button className="bg-primary text-white rounded-xl p-6 hover:bg-secondary transition-colors duration-300 flex items-center gap-4">
                <DocumentPlusIcon className="w-8 h-8" />
                <div className="text-left">
                  <div className="font-semibold text-lg">Create New Resume</div>
                  <div className="text-sm opacity-90">Start from scratch</div>
                </div>
              </button>
              <button className="bg-white text-primary border-2 border-primary rounded-xl p-6 hover:bg-primary hover:text-white transition-all duration-300 flex items-center gap-4">
                <DocumentDuplicateIcon className="w-8 h-8" />
                <div className="text-left">
                  <div className="font-semibold text-lg">Use Template</div>
                  <div className="text-sm">Choose from our templates</div>
                </div>
              </button>
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
                {mockResumes.map((resume) => (
                  <div
                    key={resume.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors duration-300"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{resume.title}</h3>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-primary hover:text-secondary"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-primary hover:text-secondary"
                        >
                          <ArrowDownTrayIcon className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-red-500 hover:text-red-600"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="block text-gray-500">Created</span>
                        {new Date(resume.createdAt).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="block text-gray-500">Modified</span>
                        {new Date(resume.modifiedAt).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="block text-gray-500">Template</span>
                        {resume.template}
                      </div>
                      <div>
                        <span className="block text-gray-500">ATS Score</span>
                        <span className="text-primary font-semibold">{resume.atsScore}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Analytics Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Analytics</h2>
                <ChartBarIcon className="w-6 h-6 text-primary" />
              </div>
              <div className="h-48 flex items-center justify-center text-gray-500">
                {/* Placeholder for charts */}
                <p>Charts coming soon...</p>
              </div>
            </motion.div>

            {/* Tips & Resources */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Tips & Resources</h2>
                <BookOpenIcon className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-4">
                {mockTips.map((tip) => (
                  <motion.button
                    key={tip.id}
                    className="w-full text-left p-4 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{tip.title}</h3>
                      <span className="text-xs text-primary px-2 py-1 bg-primary/10 rounded-full">
                        {tip.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{tip.readTime} read</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
} 