import { motion } from 'framer-motion';

export default function Support() {
  return (
    <section id="support" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-12">
          Need a Hand? We're Here 🤝
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            className="bg-white p-6 rounded-xl shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <p className="text-gray-600 mb-4">Email: support@resumezen.com</p>
            <motion.button 
              className="bg-primary hover:bg-secondary text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Live Chat
            </motion.button>
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
              <motion.button
                type="submit"
                className="w-full bg-primary hover:bg-secondary text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Send Message
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}