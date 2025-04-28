import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';

const reviews = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "Software Engineer",
    image: "https://i.pravatar.cc/150?img=47",
    content: "The AI analysis helped me optimize my resume for top IT companies in Bangalore. Landed interviews with multiple MNCs within weeks of using ResumeZen.",
    rating: 5
  },
  {
    id: 2,
    name: "Rahul Verma",
    role: "Marketing Manager",
    image: "https://i.pravatar.cc/150?img=68",
    content: "The ATS-friendly templates are perfect for applying to Indian startups and MNCs. My application success rate improved dramatically with ResumeZen.",
    rating: 5
  },
  {
    id: 3,
    name: "Anjali Patel",
    role: "Data Analyst",
    image: "https://i.pravatar.cc/150?img=41",
    content: "The industry-specific keyword suggestions helped me tailor my resume for data science roles. Got placed at a leading IT firm in Hyderabad!",
    rating: 5
  },
  {
    id: 4,
    name: "Arjun Mehta",
    role: "Product Manager",
    image: "https://i.pravatar.cc/150?img=59",
    content: "ResumeZen's collaboration feature let me work with my seniors for resume review. Perfect for freshers looking to break into product management.",
    rating: 5
  },
  {
    id: 5,
    name: "Neha Gupta",
    role: "UX Designer",
    image: "https://i.pravatar.cc/150?img=45",
    content: "The instant AI feedback helped me showcase my UX projects effectively. The suggestions are practical and relevant to Indian design industry.",
    rating: 5
  },
  {
    id: 6,
    name: "Aditya Kumar",
    role: "Business Analyst",
    image: "https://i.pravatar.cc/150?img=61",
    content: "Using ResumeZen was a game-changer in my job search. Got multiple calls from top consulting firms in Mumbai and Delhi. Highly recommended!",
    rating: 5
  }
];

export default function Reviews() {
  return (
    <section id="reviews" className="bg-white pt-8 pb-24 sm:pt-12 sm:pb-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-lg font-bold uppercase tracking-[0.2em] text-primary mb-4 bg-primary/10 px-6 py-2 rounded-full">
              REVIEWS
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-3">
              What Our Users Say
            </h2>
            <p className="text-lg leading-8 text-gray-600">
              Join thousands of professionals who have transformed their careers with ResumeZen
            </p>
          </motion.div>
        </div>

        <div className="mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              className="flex flex-col justify-between rounded-2xl bg-gray-50 p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div>
                <div className="flex gap-1 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                  ))}
                </div>
                <p className="text-lg leading-7 text-gray-700">{review.content}</p>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <img
                  className="h-12 w-12 rounded-full bg-gray-50"
                  src={review.image}
                  alt={review.name}
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{review.name}</h3>
                  <p className="text-sm text-gray-600">{review.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}