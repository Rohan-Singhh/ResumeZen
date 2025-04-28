import { motion } from 'framer-motion';
import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';

const successStories = [
  {
    id: 1,
    name: "Priya Malhotra",
    role: "Software Developer @ Microsoft",
    before: "Fresh graduate, no industry experience",
    after: "Landed dream tech role in 3 weeks",
    key_improvements: [
      "ATS score improved from 45% to 92%",
      "6 interview calls within first week",
      "3 job offers to choose from"
    ],
    image: "https://images.unsplash.com/photo-1598346762291-aee88549193f?w=150&h=150&fit=crop&crop=faces&auto=format&q=80",
    quote: "ResumeZen helped me transform my academic projects into professional achievements. The AI suggestions were game-changing!"
  },
  {
    id: 2,
    name: "Rahul Sharma",
    role: "Data Analyst @ Amazon",
    before: "Career transition from sales",
    after: "Successfully switched to data analytics",
    key_improvements: [
      "Resume optimized for tech keywords",
      "4 interviews in top tech companies",
      "50% salary increase"
    ],
    image: "https://images.unsplash.com/photo-1628157588553-5eeea00af15c?w=150&h=150&fit=crop&crop=faces&auto=format&q=80",
    quote: "The industry-specific keywords and ATS optimization made my career switch possible. Best ₹19 I've ever spent!"
  },
  {
    id: 3,
    name: "Aisha Patel",
    role: "Product Manager @ Flipkart",
    before: "Generic resume with low response rate",
    after: "Targeted resume with 85% interview success",
    key_improvements: [
      "Highlighted leadership achievements",
      "8 callbacks from top startups",
      "Multiple competing offers"
    ],
    image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=150&h=150&fit=crop&crop=faces&auto=format&q=80",
    quote: "ResumeZen helped me showcase my achievements in a way that caught recruiters' attention immediately!"
  },
  {
    id: 4,
    name: "Vikram Singh",
    role: "ML Engineer @ Google",
    before: "PhD graduate with academic-focused CV",
    after: "Industry-ready resume highlighting practical skills",
    key_improvements: [
      "Translated research into business impact",
      "5 tech giants showed interest",
      "Dream role secured in 2 weeks"
    ],
    image: "https://images.unsplash.com/photo-1619380061814-58f03707f082?w=150&h=150&fit=crop&crop=faces&auto=format&q=80",
    quote: "The AI suggestions helped me translate my academic achievements into industry-relevant experience. Incredible tool!"
  },
  {
    id: 5,
    name: "Neha Reddy",
    role: "UX Designer @ Swiggy",
    before: "Portfolio but no proper resume",
    after: "Balanced resume showcasing both skills and projects",
    key_improvements: [
      "ATS score jumped to 88%",
      "7 interview calls in 10 days",
      "2x salary expectations"
    ],
    image: "https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=150&h=150&fit=crop&crop=faces&auto=format&q=80",
    quote: "As a designer, I was focused on my portfolio. ResumeZen helped me create a resume that complemented my work perfectly!"
  },
  {
    id: 6,
    name: "Arjun Menon",
    role: "Frontend Developer @ Razorpay",
    before: "Bootcamp graduate with no experience",
    after: "Professional resume highlighting practical skills",
    key_improvements: [
      "Projects presented professionally",
      "5 startups reached out",
      "Landed role within a month"
    ],
    image: "https://images.unsplash.com/photo-1618641986557-1ecd230959aa?w=150&h=150&fit=crop&crop=faces&auto=format&q=80",
    quote: "The AI helped me present my bootcamp projects in a professional way that resonated with employers. Worth every penny!"
  }
];

export default function SuccessStories() {
  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-lg font-bold uppercase tracking-[0.2em] text-primary mb-4 bg-primary/10 px-6 py-2 rounded-full">
              SUCCESS STORIES
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
              From Dreams to Offers 🎯
            </h2>
            <p className="text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Real stories of real success. See how ResumeZen has helped students and professionals land their dream jobs.
            </p>
          </motion.div>
        </div>

        {/* Success Stories */}
        <div className="grid gap-12 lg:grid-cols-2 mb-20">
          {successStories.map((story, index) => (
            <motion.div
              key={story.id}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
            >
              <div className="flex items-start gap-6 mb-6">
                <img
                  src={story.image}
                  alt={story.name}
                  className="w-16 h-16 rounded-full ring-4 ring-white"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{story.name}</h3>
                  <p className="text-primary font-semibold">{story.role}</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">BEFORE</h4>
                      <p className="text-gray-900">{story.before}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">AFTER</h4>
                      <p className="text-gray-900">{story.after}</p>
                    </div>
                  </div>
                </div>

                <ul className="space-y-3">
                  {story.key_improvements.map((improvement, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircleIcon className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-gray-700">{improvement}</span>
                    </li>
                  ))}
                </ul>

                <blockquote className="text-gray-700 italic border-l-4 border-primary pl-4">
                  "{story.quote}"
                </blockquote>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Price Comparison */}
        <motion.div
          className="bg-primary/5 rounded-3xl p-8 lg:p-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <SparklesIcon className="h-12 w-12 text-primary mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Invest Smart in Your Future 🎯
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              For just ₹19, less than the price of your favorite cookie combo, you can transform your job search journey. 
              While those cookies last a moment, ResumeZen's impact on your career? That's forever! 🍪✨
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white rounded-xl p-4">
                <p className="text-2xl font-bold text-primary">₹19</p>
                <p className="text-sm text-gray-600">ResumeZen</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <p className="text-2xl font-bold text-gray-400">₹25</p>
                <p className="text-sm text-gray-600">Cookie Pack</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <p className="text-2xl font-bold text-gray-400">₹30</p>
                <p className="text-sm text-gray-600">Biscuit Box</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <p className="text-2xl font-bold text-gray-400">₹35</p>
                <p className="text-sm text-gray-600">Snack Combo</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 