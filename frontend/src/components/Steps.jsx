import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  UserPlusIcon,
  DocumentArrowUpIcon,
  CreditCardIcon,
  ChartBarIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

const steps = [
  {
    id: 1,
    title: "Create Account",
    description: "Sign up or login to your ResumeZen account in seconds.",
    icon: UserPlusIcon
  },
  {
    id: 2,
    title: "Upload Resume",
    description: "Upload your resume in PDF or DOC format for analysis.",
    icon: DocumentArrowUpIcon
  },
  {
    id: 3,
    title: "Choose Plan",
    description: "Select a plan that suits your needs and make the payment.",
    icon: CreditCardIcon
  },
  {
    id: 4,
    title: "AI Analysis",
    description: "Our AI model analyzes your resume for ATS optimization.",
    icon: ChartBarIcon
  },
  {
    id: 5,
    title: "Get Results",
    description: "Receive your real-time ATS score and improvement tips.",
    icon: CheckBadgeIcon
  }
];

export default function Steps() {
  const navigate = useNavigate();

  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-dark-bg border-t border-white/5 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute right-0 bottom-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-16 relative z-10">
        <div className="text-left md:text-center mb-16 lg:mb-24">
          <span className="inline-block text-sm font-bold uppercase tracking-[0.2em] text-secondary mb-6 bg-secondary/10 border border-secondary/20 px-6 py-2 rounded-full">
            Process
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white font-display tracking-tight">
            How It <span className="text-secondary">Works</span> 🚀
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl md:mx-auto font-light">
            Get your ATS score in minutes with our simple 5-step process. No waiting, no BS.
          </p>
        </div>
        
        <div className="relative">
          {/* Connecting line for desktop */}
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-white/10 -translate-y-1/2 hidden xl:block"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 xl:gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  className="relative bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md hover:bg-white/10 transition-colors duration-300 group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
                >
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-br from-primary to-accent text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-glow-primary z-10">
                    {step.id}
                  </div>
                  <div className="text-center pt-4">
                    <div className="flex justify-center mb-6">
                      <div className="p-4 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-10 w-10 text-secondary" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white font-display">{step.title}</h3>
                    <p className="text-gray-400 font-light">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        
        <motion.div 
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
        >
          <motion.button
            onClick={() => navigate('/login')}
            className="bg-white text-dark-bg hover:shadow-glow-secondary font-bold py-4 px-10 rounded-full text-lg transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started Now
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}