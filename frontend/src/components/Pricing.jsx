import { motion } from 'framer-motion';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function Pricing() {
  const plans = [
    {
      title: "One-Time Check",
      price: "₹19",
      features: [
        "1 resume ATS check",
        "Personalized improvement tips",
        "No history tracking"
      ]
    },
    {
      title: "Boost Pack",
      price: "₹70",
      popular: true,
      features: [
        "5 resume checks",
        "Track resume improvement history",
        "Early access to premium features"
      ]
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">
          Simple, Transparent Pricing 💸
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className="relative bg-white p-8 rounded-xl shadow-lg border-2 border-primary"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {plan.popular && (
                <div className="absolute -top-4 right-4 bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold mb-4">{plan.title}</h3>
              <p className="text-4xl font-bold text-primary mb-6">{plan.price}</p>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-primary mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full bg-primary hover:bg-secondary text-white font-semibold py-3 px-8 rounded-lg transition duration-300">
                Get Started
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}