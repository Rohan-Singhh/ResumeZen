import { motion } from 'framer-motion';
import {
  SparklesIcon,
  DocumentCheckIcon,
  UserGroupIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    id: 1,
    title: "AI-Powered Resume Analysis",
    description: "Get instant feedback on your resume with our advanced AI technology that analyzes format, content, and keywords.",
    icon: SparklesIcon,
    colSpan: "col-span-1 lg:col-span-2",
    bgClass: "bg-gradient-to-br from-primary/20 to-transparent",
  },
  {
    id: 2,
    title: "ATS-Friendly Templates",
    description: "Choose from 50+ professionally designed templates that are guaranteed to pass Applicant Tracking Systems.",
    icon: DocumentCheckIcon,
    colSpan: "col-span-1",
    bgClass: "bg-gradient-to-br from-secondary/20 to-transparent",
  },
  {
    id: 3,
    title: "Real-Time Collaboration",
    description: "Work with mentors and peers in real-time to perfect your resume with our collaborative editing feature.",
    icon: UserGroupIcon,
    colSpan: "col-span-1",
    bgClass: "bg-gradient-to-br from-accent/20 to-transparent",
  },
  {
    id: 4,
    title: "Industry-Specific Keywords",
    description: "Access our database of industry-specific keywords to optimize your resume for your target role.",
    icon: MagnifyingGlassIcon,
    colSpan: "col-span-1 lg:col-span-2",
    bgClass: "bg-gradient-to-bl from-primary-light/20 to-transparent",
  }
];

export default function Features() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div id="features" className="bg-dark-bg py-24 sm:py-32 relative overflow-hidden border-t border-white/5">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="mx-auto w-full max-w-[1600px] px-6 lg:px-16 relative z-10">
        <motion.div 
          className="max-w-3xl mb-16"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-sm font-bold uppercase tracking-[0.2em] text-accent mb-6 bg-accent/10 border border-accent/20 px-6 py-2 rounded-full">
            The Arsenal
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl mb-6 font-display">
            Supercharge Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Resume</span>
          </h2>
          <p className="text-xl leading-8 text-gray-400 font-light">
            Our AI-powered platform provides all the tools you need to create a professional, ATS-friendly resume that stands out from the crowd.
          </p>
        </motion.div>

        <motion.div 
          className="mt-10"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={feature.id}
                  variants={item}
                  className={`relative rounded-3xl border border-white/10 backdrop-blur-md p-8 overflow-hidden group hover:border-white/30 transition-colors duration-500 ${feature.colSpan} ${feature.bgClass}`}
                >
                  <div className="absolute inset-0 bg-dark-bg/40 -z-10"></div>
                  
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 border border-white/20 mb-8 group-hover:scale-110 transition-transform duration-500">
                        <Icon className="h-7 w-7 text-white" aria-hidden="true" />
                      </div>
                      <h3 className="text-2xl font-bold leading-8 text-white tracking-tight mb-4 font-display">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-lg leading-7 text-gray-400 font-light">
                        {feature.description}
                      </p>
                    </div>
                    
                    {/* Decorative bottom line that grows on hover */}
                    <div className="mt-8 h-1 w-0 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-700 ease-out rounded-full"></div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}