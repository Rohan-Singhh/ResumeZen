import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Software Engineer at Google",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    content: "ResumeZen helped me land my dream job at Google. The AI suggestions were spot-on!",
    rating: 5
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Product Manager at Meta",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    content: "The ATS-friendly templates and keyword suggestions made a huge difference in my job search.",
    rating: 5
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "UX Designer at Apple",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    content: "Clean, professional templates and amazing customer support. Highly recommended!",
    rating: 5
  }
];

export default function Reviews() {
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
    <div id="reviews" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-base font-semibold leading-7 text-primary">Testimonials</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Loved by job seekers worldwide
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Join thousands of professionals who've landed their dream jobs using ResumeZen
          </p>
        </motion.div>

        <motion.div 
          className="mx-auto mt-16 flow-root sm:mt-20"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                variants={item}
                className="relative bg-white p-6 shadow-xl shadow-gray-900/10 rounded-2xl"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-5 w-5 ${
                        i < testimonial.rating ? 'text-yellow-400' : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <blockquote className="mt-3">
                  <p className="text-gray-600 leading-7">{testimonial.content}</p>
                </blockquote>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="mt-16 border-t border-gray-100 pt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="flex flex-col items-center gap-8">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900">
              Ready to transform your career?
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button 
                className="rounded-full bg-primary px-8 py-3 text-white hover:bg-secondary transition-all duration-300 transform"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Free
              </motion.button>
              <motion.button 
                className="rounded-full border-2 border-gray-200 px-8 py-3 text-gray-600 hover:border-primary hover:text-primary transition-all duration-300 transform"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Pricing
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}