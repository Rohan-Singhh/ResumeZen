import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import { ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';

const reviews = [
  {
    id: 1,
    name: 'Priya Sharma',
    role: 'Software Engineer (0-2 yrs)',
    image: 'https://i.pravatar.cc/150?img=47',
    location: 'Bangalore',
    timeline: 'Results in 18 days',
    plan: 'Starter Plan',
    content:
      'I was applying with a generic resume and got almost no replies. The ATS keyword suggestions + project bullet rewrites helped me explain impact better. In about 3 weeks, I got 3 interview calls from product companies.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Rahul Verma',
    role: 'Marketing Manager',
    image: 'https://i.pravatar.cc/150?img=68',
    location: 'Mumbai',
    timeline: 'Results in 2 weeks',
    plan: 'Pro Plan',
    content:
      'The structure templates were solid, especially for achievement-based bullets. I still edited tone manually for brand roles, but that was easy. Callback rate improved from 1 in 20 to around 1 in 7 applications.',
    rating: 4,
  },
  {
    id: 3,
    name: 'Anjali Patel',
    role: 'Data Analyst',
    image: 'https://i.pravatar.cc/150?img=41',
    location: 'Hyderabad',
    timeline: 'Results in 24 days',
    plan: 'Starter Plan',
    content:
      'As a career switcher, I struggled to connect my previous work to analytics. ResumeZen helped me rewrite my project section with measurable outcomes. I got 2 shortlist emails and 1 final-round interview in the first month.',
    rating: 5,
  },
  {
    id: 4,
    name: 'Arjun Mehta',
    role: 'Associate Product Manager',
    image: 'https://i.pravatar.cc/150?img=59',
    location: 'Pune',
    timeline: 'Results in 3 weeks',
    plan: 'Pro Plan',
    content:
      'I liked the role-targeted suggestions and how quickly I could create role-specific versions. First draft was not perfect, but after two edits, it read much clearer. I got 4 recruiter responses from startup applications.',
    rating: 4,
  },
  {
    id: 5,
    name: 'Neha Gupta',
    role: 'UX Designer',
    image: 'https://i.pravatar.cc/150?img=45',
    location: 'Delhi NCR',
    timeline: 'Results in 12 days',
    plan: 'Starter Plan',
    content:
      'I usually rely on my portfolio, but my resume wasn’t telling a clear story. The AI feedback helped me show project outcomes and collaboration better. I started getting interview invites for product design roles within two weeks.',
    rating: 5,
  },
  {
    id: 6,
    name: 'Aditya Kumar',
    role: 'Business Analyst',
    image: 'https://i.pravatar.cc/150?img=61',
    location: 'Gurugram',
    timeline: 'Results in 1 month',
    plan: 'Pro Plan',
    content:
      'What helped most was the clarity of metrics in my experience section. It took me one evening to finalize everything, but the difference was visible quickly. I moved from almost no responses to steady recruiter outreach.',
    rating: 5,
  },
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
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-3">What Our Users Say</h2>
            <p className="text-lg leading-8 text-gray-600">
              Real stories from learners and professionals improving their resumes one step at a time.
            </p>
          </motion.div>
        </div>

        <div className="mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, index) => (
            <motion.article
              key={review.id}
              className="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-gray-50/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:bg-white hover:shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
            >
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{review.plan}</span>
                </div>

                <p className="text-base leading-7 text-gray-700 transition-colors duration-300 group-hover:text-gray-800">
                  {review.content}
                </p>

                <div className="mt-4 space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{review.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    <span>{review.timeline}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-4 border-t border-gray-200/80 pt-4">
                <img className="h-12 w-12 rounded-full bg-gray-50 ring-2 ring-transparent transition-all duration-300 group-hover:ring-primary/20" src={review.image} alt={review.name} />
                <div>
                  <h3 className="font-semibold text-gray-900">{review.name}</h3>
                  <p className="text-sm text-gray-600">{review.role}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
