import { motion } from 'framer-motion';

export default function Steps() {
  const steps = [
    { icon: "🚀", title: "Create an Account", desc: "Easy sign-up to kickstart your journey." },
    { icon: "📄", title: "Upload Resume (PDF/DOCX)", desc: "Drag and drop or click to upload." },
    { icon: "💳", title: "Lightning Fast Payment", desc: "One tap to unlock deep insights. ₹19 or ₹70." },
    { icon: "🧠", title: "Instant ATS Score + Personalized Feedback", desc: "See your strengths. Improve your weaknesses." }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">
          How ResumeZen Works in 4 Simple Steps 🔥
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-xl shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}