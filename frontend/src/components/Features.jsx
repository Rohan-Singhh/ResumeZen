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
    icon: SparklesIcon
  },
  {
    id: 2,
    title: "ATS-Friendly Templates",
    description: "Choose from 50+ professionally designed templates that are guaranteed to pass Applicant Tracking Systems.",
    icon: DocumentCheckIcon
  },
  {
    id: 3,
    title: "Real-Time Collaboration",
    description: "Work with mentors and peers in real-time to perfect your resume with our collaborative editing feature.",
    icon: UserGroupIcon
  },
  {
    id: 4,
    title: "Industry-Specific Keywords",
    description: "Access our database of industry-specific keywords to optimize your resume for your target role.",
    icon: MagnifyingGlassIcon
  }
];

export default function Features() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div id="features" className="bg-gray-50 pt-8 pb-24 sm:pt-12 sm:pb-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block text-lg font-bold uppercase tracking-[0.2em] text-primary mb-6 bg-primary/10 px-6 py-2 rounded-full">
            OUR FEATURES
          </span>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
            Supercharge Your Resume
          </h2>
          <p className="text-lg leading-8 text-gray-600">
            Our AI-powered platform provides all the tools you need to create a professional, ATS-friendly resume that stands out.
          </p>
        </motion.div>

        <motion.div 
          className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={feature.id}
                  variants={item}
                  className="relative pl-16"
                >
                  <dt className="text-base font-semibold leading-7 text-gray-900">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                      <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    {feature.title}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
                </motion.div>
              );
            })}
          </dl>
        </motion.div>
      </div>
    </div>
  );
}