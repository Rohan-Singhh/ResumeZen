import { motion } from 'framer-motion';
import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';

export default function Pricing() {
  const plans = [
    {
      title: "One-Time Check",
      price: "₹19",
      period: "one-time",
      features: [
        "1 resume ATS check",
        "Personalized improvement tips",
        "Basic AI analysis",
        "24/7 email support",
        "Export to PDF"
      ]
    },
    {
      title: "Boost Pack",
      price: "₹70",
      period: "one-time",
      popular: true,
      features: [
        "5 resume checks",
        "Track improvement history",
        "Advanced AI analysis",
        "Priority email support",
        "Export to multiple formats",
        "LinkedIn profile optimization",
        "Industry-specific keywords"
      ]
    },
    {
      title: "Unlimited Pack",
      price: "₹250",
      period: "3 months",
      special: true,
      features: [
        "Unlimited resume checks",
        "Real-time ATS scoring",
        "Premium AI suggestions",
        "24/7 priority support",
        "All export formats",
        "LinkedIn & GitHub optimization",
        "Custom branding options",
        "Interview preparation tips",
        "Job market insights"
      ]
    }
  ];

  return (
    <section id="pricing" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Simple, Transparent Pricing 💸
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your career journey. No hidden fees, no surprises.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`relative bg-white p-8 rounded-xl shadow-lg border-2 ${
                plan.special ? 'border-secondary bg-secondary/5' : 
                plan.popular ? 'border-primary' : 'border-gray-200'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ translateY: -5 }}
              transition={{ duration: 0.3 }}
            >
              {plan.popular && (
                <div className="absolute -top-4 right-4 bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              {plan.special && (
                <div className="absolute -top-4 right-4 bg-secondary text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <SparklesIcon className="h-4 w-4" />
                  Special Offer
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.title}</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold text-primary">{plan.price}</span>
                <span className="text-gray-500 ml-2">/{plan.period}</span>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircleIcon className={`h-5 w-5 mr-2 flex-shrink-0 ${
                      plan.special ? 'text-secondary' : 'text-primary'
                    } mt-0.5`} />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <motion.button 
                className={`w-full font-semibold py-3 px-8 rounded-lg transition-all duration-300 ${
                  plan.special 
                    ? 'bg-secondary hover:bg-secondary/90 text-white' 
                    : plan.popular
                    ? 'bg-primary hover:bg-primary/90 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Started
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}