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
    <section className="bg-transparent py-12 sm:py-16">
      <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-16">
        {/* Header */}
        <div className="text-center mb-20 lg:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-sm font-bold uppercase tracking-[0.2em] text-accent mb-6 bg-accent/10 border border-accent/20 px-6 py-2 rounded-full">
              Success Stories
            </span>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 font-display">
              From Dreams to <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary">Offers</span> 🎯
            </h2>
            <p className="text-xl leading-8 text-gray-400 max-w-3xl mx-auto font-light">
              Real stories of real success. See how ResumeZen has helped students and professionals land their dream jobs in the most competitive tech companies.
            </p>
          </motion.div>
        </div>

        {/* Success Stories Grid */}
        <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3 mb-24">
          {successStories.map((story, index) => (
            <motion.div
              key={story.id}
              className="group rounded-3xl border border-white/10 bg-dark-card p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:border-primary/50 hover:bg-white/5"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: (index % 3) * 0.15, duration: 0.5 }}
            >
              <div className="flex items-center gap-6 mb-8 border-b border-white/10 pb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:bg-primary/40 transition-colors"></div>
                  <img
                    src={story.image}
                    alt={story.name}
                    className="relative h-16 w-16 rounded-full border-2 border-white/20 transition-transform duration-300 group-hover:scale-105 object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1 font-display">{story.name}</h3>
                  <p className="text-sm font-bold text-primary-light uppercase tracking-wider">{story.role}</p>
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="rounded-2xl bg-black/40 border border-white/5 p-5">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                      <h4 className="mb-2 text-xs font-bold text-gray-500 tracking-wider">BEFORE</h4>
                      <p className="text-gray-300 font-light text-sm">{story.before}</p>
                    </div>
                    <div className="rounded-xl border border-primary/20 bg-primary/10 p-4 shadow-glow-primary/10 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                      <h4 className="mb-2 text-xs font-bold text-primary tracking-wider">AFTER</h4>
                      <p className="text-white font-medium text-sm">{story.after}</p>
                    </div>
                  </div>
                </div>

                <ul className="space-y-4">
                  {story.key_improvements.map((improvement, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <CheckCircleIcon className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{improvement}</span>
                    </li>
                  ))}
                </ul>

                <blockquote className="border-l-2 border-primary/50 pl-4 py-1 italic text-gray-400 text-sm">
                  "{story.quote}"
                </blockquote>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Price Comparison Widget */}
        <motion.div
          className="relative rounded-3xl p-1 overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-secondary opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-secondary animate-shimmer opacity-50 blur-xl"></div>
          <div className="bg-dark-card border border-white/10 rounded-[23px] p-8 lg:p-12 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mx-auto w-16 h-16 bg-primary/20 border border-primary/30 rounded-2xl flex items-center justify-center mb-8">
                <SparklesIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-6 font-display">
                Invest Smart in Your Future 🎯
              </h3>
              <p className="text-lg text-gray-400 mb-12 font-light max-w-2xl mx-auto">
                For just ₹19, less than the price of your favorite cookie combo, you can transform your job search journey. 
                While those cookies last a moment, ResumeZen's impact on your career? That's forever! 🍪✨
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div className="bg-primary/20 border border-primary/30 rounded-2xl p-6 shadow-glow-primary relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors"></div>
                  <p className="text-3xl font-extrabold text-white mb-2 relative z-10">₹19</p>
                  <p className="text-sm text-primary-light font-bold uppercase tracking-wider relative z-10">ResumeZen</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm transition-colors hover:bg-white/10">
                  <p className="text-3xl font-bold text-gray-400 mb-2">₹25</p>
                  <p className="text-sm text-gray-500 font-medium">Cookie Pack</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm transition-colors hover:bg-white/10">
                  <p className="text-3xl font-bold text-gray-400 mb-2">₹30</p>
                  <p className="text-sm text-gray-500 font-medium">Biscuit Box</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm transition-colors hover:bg-white/10">
                  <p className="text-3xl font-bold text-gray-400 mb-2">₹35</p>
                  <p className="text-sm text-gray-500 font-medium">Snack Combo</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}