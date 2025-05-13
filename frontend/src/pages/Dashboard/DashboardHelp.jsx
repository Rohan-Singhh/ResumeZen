import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

export default function DashboardHelp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);

  // Toggle FAQ expansion
  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  // Helper categories
  const helpCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: DocumentTextIcon,
      description: 'Learn the basics of using ResumeZen effectively',
      link: '#getting-started'
    },
    {
      id: 'tutorials',
      title: 'Video Tutorials',
      icon: VideoCameraIcon,
      description: 'Visual walkthroughs of all features',
      link: '#tutorials'
    },
    {
      id: 'contact',
      title: 'Contact Support',
      icon: ChatBubbleLeftRightIcon,
      description: 'Get help from our support team',
      link: '#contact'
    }
  ];

  // FAQ items
  const faqItems = [
    {
      id: 1,
      question: 'How do I create my first resume?',
      answer: 'To create your first resume, click on the "Upload Resume" box on your dashboard. You can either upload an existing resume for us to enhance or start from scratch by following the guided templates. Our AI will help you optimize content as you build.'
    },
    {
      id: 2,
      question: 'What makes ResumeZen different from other resume builders?',
      answer: 'ResumeZen is specifically designed to optimize your resume for Applicant Tracking Systems (ATS) used by employers. Our AI analyzes job descriptions to help you include relevant keywords, we offer industry-specific templates, and provide real-time feedback on your resume content.'
    },
    {
      id: 3,
      question: 'How do I download my resume?',
      answer: 'After creating your resume, go to the "My Resumes" section and click on the resume you want to download. You can then click the "Export" button to download it in your preferred format (PDF, DOCX, etc. depending on your plan).'
    },
    {
      id: 4,
      question: 'How do I change my account password?',
      answer: 'To change your account password, go to the Edit Profile section in your dashboard, then select the option to update your password. Follow the on-screen instructions to complete the process.'
    },
    {
      id: 5,
      question: 'How do I update my account information?',
      answer: 'You can update your account information by clicking on "Edit Profile" in the sidebar. This includes personal details, contact information, and professional links.'
    },
    {
      id: 6,
      question: 'What should I do if I find a bug or have a feature request?',
      answer: 'We value your feedback! Please contact our support team using the "Contact Support" link in the Help section. Please provide detailed information about the bug or feature request, and our team will address it promptly.'
    }
  ];

  // Filter FAQs based on search query
  const filteredFaqs = faqItems.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // PDF validation
      if (selectedFile.type !== 'application/pdf') {
        setError('Only PDF files are allowed');
        setFile(null);
        return;
      }
      
      // Size validation (1MB)
      if (selectedFile.size > 1048576) {
        setError('File size must be less than 1MB');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    try {
      setUploading(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('pdf', file);
      
      // Upload file
      const response = await axios.post('/api/upload/test-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUploadResult(response.data);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Help & Resources
        </h1>
        <p className="text-gray-600">
          Find answers to common questions and learn how to make the most of ResumeZen.
        </p>
      </div>
      
      {/* Search Box */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Search for help topics..."
          />
        </div>
      </div>
      
      {/* Help Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {helpCategories.map((category) => (
          <motion.a
            key={category.id}
            href={category.link}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 flex flex-col items-center text-center"
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <category.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {category.title}
            </h3>
            <p className="text-gray-600 text-sm">
              {category.description}
            </p>
          </motion.a>
        ))}
      </div>
      
      {/* FAQ Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center mb-6">
          <QuestionMarkCircleIcon className="h-6 w-6 text-primary mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>
        </div>
        
        {searchQuery && filteredFaqs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No results found for "{searchQuery}"</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-2 text-primary hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((faq) => (
              <div 
                key={faq.id} 
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex justify-between items-center p-4 text-left focus:outline-none"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {expandedFaq === faq.id ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                
                <AnimatePresence>
                  {expandedFaq === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 bg-gray-50 text-gray-600">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Contact Support Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200" id="contact">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Still Have Questions?
        </h3>
        <p className="text-gray-600 mb-6">
          Our support team is ready to help you with any questions or concerns you may have.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Email Support
            </h4>
            <p className="text-gray-600 mb-2">
              Send us an email and we'll get back to you within 24 hours.
            </p>
            <a 
              href="mailto:support@resumezen.com" 
              className="text-primary hover:underline"
            >
              support@resumezen.com
            </a>
          </div>
          
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Live Chat
            </h4>
            <p className="text-gray-600 mb-2">
              Available Monday to Friday, 9 AM to 5 PM EST.
            </p>
            <motion.button
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium inline-flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowChatModal(true)}
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
              Start Chat
            </motion.button>
          </div>
        </div>
      {/* Live Chat Coming Soon Modal */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl font-bold focus:outline-none"
              onClick={() => setShowChatModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="flex flex-col items-center">
              <ChatBubbleLeftRightIcon className="h-10 w-10 text-primary mb-4" />
              <h4 className="text-lg font-semibold mb-2 text-gray-900">Live Chat Coming Soon</h4>
              <p className="text-gray-700 text-center">Live chat is not available yet.<br/>This feature is coming soon!</p>
              <button
                className="mt-6 px-4 py-2 bg-primary text-white rounded-lg font-medium"
                onClick={() => setShowChatModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
} 