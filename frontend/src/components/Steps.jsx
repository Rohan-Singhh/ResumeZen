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
    <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            How ResumeZen Works 🚀
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get your ATS score in minutes with our simple 5-step process
          </p>
        </div>
        <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 hidden lg:block"></div>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  className="relative bg-white p-6 rounded-xl shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    {step.id}
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <Icon className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 1 }}
        >
          <motion.button
            onClick={() => navigate('/login')}
            className="bg-primary hover:bg-secondary text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Now
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}