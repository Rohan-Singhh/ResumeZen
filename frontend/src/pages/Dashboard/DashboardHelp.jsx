import React, { useState } from 'react';
import { 
  ChevronDownIcon, 
  MagnifyingGlassIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

export default function DashboardHelp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const helpCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: DocumentTextIcon,
      description: 'Learn the basics of using ResumeZen effectively',
      link: '#'
    },
    {
      id: 'tutorials',
      title: 'Video Tutorials',
      icon: VideoCameraIcon,
      description: 'Visual walkthroughs of all features',
      link: '#'
    },
    {
      id: 'contact',
      title: 'Contact Support',
      icon: ChatBubbleLeftRightIcon,
      description: 'Get help from our support team',
      link: '#'
    }
  ];

  const faqItems = [
    {
      id: 1,
      question: 'How do I analyze my first resume?',
      answer: 'To analyze your resume, click on the drag-and-drop file upload zone on your Dashboard. Upload your resume in PDF format (max 1MB), and our AI will immediately extract the text and start processing it.'
    },
    {
      id: 2,
      question: 'What makes ResumeZen different from other platforms?',
      answer: 'ResumeZen utilizes state-of-the-art LLMs to evaluate your resume against standard ATS metrics. We provide an exact ATS score percentage, extract technical and soft skills, list your key strengths, offer clear areas for improvement, and detail critical missing keywords.'
    },
    {
      id: 3,
      question: 'How do I view my previous analyses?',
      answer: 'You can view your entire analysis history in the "Upload History" section. Click on any row to open a detailed modal summarizing the score, contact info, skills, strengths, areas for improvement, and a link to view the original file.'
    },
    {
      id: 4,
      question: 'How do I update my account profile details?',
      answer: 'Click on the "Profile" section in the sidebar to modify your personal information, contact email, mobile number, or professional links.'
    },
    {
      id: 5,
      question: 'How do credits and plans work?',
      answer: 'Each resume analysis consumes 1 credit. You can check your current plan and remaining credits directly on the Dashboard welcome screen or click "Plans" to manage your subscription.'
    }
  ];

  const filteredFaqs = faqItems.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Help & Support</h1>
          <p className="text-sm text-zinc-500 mt-1">Find answers or get in touch with our team</p>
        </div>
        
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 outline-none transition-colors"
            placeholder="Search for help..."
          />
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {helpCategories.map((category) => (
          <div key={category.id} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 flex items-start gap-4 transition-colors hover:border-zinc-700">
            <div className="h-10 w-10 rounded-md bg-zinc-800 flex items-center justify-center flex-shrink-0">
              <category.icon className="h-5 w-5 text-zinc-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-zinc-200">{category.title}</h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{category.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FAQs */}
      <div>
        <h2 className="text-sm font-medium text-zinc-200 mb-3">Frequently Asked Questions</h2>
        
        {searchQuery && filteredFaqs.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-8 text-center">
            <p className="text-sm text-zinc-400">No results found for "{searchQuery}"</p>
            <button onClick={() => setSearchQuery('')} className="mt-2 text-xs font-medium text-violet-400 hover:text-violet-300">Clear search</button>
          </div>
        ) : (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg divide-y divide-zinc-800">
            {filteredFaqs.map((faq) => (
              <div key={faq.id} className="overflow-hidden">
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between p-5 text-left bg-transparent hover:bg-zinc-800/30 transition-colors"
                >
                  <span className="text-sm font-medium text-zinc-200">{faq.question}</span>
                  <ChevronDownIcon className={`h-4 w-4 text-zinc-500 transition-transform duration-200 ${expandedFaq === faq.id ? 'rotate-180' : ''}`} />
                </button>
                <div 
                  className={`px-5 overflow-hidden transition-all duration-200 ease-in-out ${expandedFaq === faq.id ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-sm text-zinc-400 leading-relaxed border-l-2 border-zinc-800 pl-4">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Section */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
        <h3 className="text-sm font-medium text-zinc-200 mb-1">Still need help?</h3>
        <p className="text-xs text-zinc-500 mb-5">Our support team is ready to assist you.</p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <a 
            href="mailto:support@resumezen.com" 
            className="flex-1 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-md p-4 transition-colors flex items-center justify-between group"
          >
            <div>
              <p className="text-sm font-medium text-zinc-200">Email Support</p>
              <p className="text-xs text-zinc-500 mt-0.5">support@resumezen.com</p>
            </div>
            <span className="text-xs font-medium text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">Write to us →</span>
          </a>
          
          <button 
            onClick={() => setShowChatModal(true)}
            className="flex-1 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-md p-4 transition-colors flex items-center justify-between text-left group"
          >
            <div>
              <p className="text-sm font-medium text-zinc-200">Live Chat</p>
              <p className="text-xs text-zinc-500 mt-0.5">Available 9am - 5pm EST</p>
            </div>
            <span className="text-xs font-medium text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">Start chat →</span>
          </button>
        </div>
      </div>

      {/* Live Chat Coming Soon Modal */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowChatModal(false)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-violet-400" />
              </div>
            </div>
            <h4 className="text-base font-semibold text-zinc-100 text-center mb-2">Live Chat</h4>
            <p className="text-sm text-zinc-400 text-center mb-6 leading-relaxed">Live chat is currently unavailable. This feature will be rolling out soon.</p>
            <button
              className="w-full bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
              onClick={() => setShowChatModal(false)}
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}