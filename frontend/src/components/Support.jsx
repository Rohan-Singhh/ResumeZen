import { motion } from 'framer-motion';

export default function Support() {
  const faqs = [
    {
      question: "How many resumes can I upload?",
      answer: "It depends on your plan. One-Time Check allows 1 resume, while Boost Pack allows 5 resumes."
    },
    {
      question: "What payment options do you accept?",
      answer: "We accept all major UPI apps, credit/debit cards, and net banking."
    },
    {
      question: "How fast is the report generation?",
      answer: "Your ATS report is generated instantly, usually within 30 seconds."
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-12">
          Need a Hand? We're Here 🤝
        </h2>
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div
            className="bg-white p-6 rounded-xl shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <p className="text-gray-600 mb-4">Email: support@resumezen.com</p>
            <button className="bg-primary hover:bg-secondary text-white font-semibold py-2 px-6 rounded-lg transition duration-300">
              Live Chat
            </button>
          </motion.div>
          <motion.div
            className="bg-white p-6 rounded-xl shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold mb-4">Quick Support Form</h3>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full p-2 border rounded-lg"
              />
              <textarea
                placeholder="Your Message"
                className="w-full p-2 border rounded-lg"
                rows="4"
              ></textarea>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-secondary text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
              >
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-semibold mb-8">Frequently Asked Questions</h3>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg text-left"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h4 className="font-semibold mb-2">{faq.question}</h4>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}