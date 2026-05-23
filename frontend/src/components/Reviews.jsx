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
    <section id="reviews" className="bg-dark-bg py-24 sm:py-32 border-t border-white/5 relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-16 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 lg:mb-20 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <span className="inline-block text-sm font-bold uppercase tracking-[0.2em] text-primary mb-6 bg-primary/10 border border-primary/20 px-6 py-2 rounded-full">
              Wall of Love
            </span>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white font-display">
              Don't Just Take <br className="hidden md:block"/> Our Word For It.
            </h2>
          </motion.div>
          
          <motion.div
             initial={{ opacity: 0, x: 30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.5, delay: 0.2 }}
             className="text-left md:text-right"
          >
             <p className="text-xl leading-8 text-gray-400 font-light max-w-lg">
                Real stories from Gen Z professionals and grads who hacked the ATS and landed their dream roles.
             </p>
          </motion.div>
        </div>

        {/* Masonry-style Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {reviews.map((review, index) => (
            <motion.article
              key={review.id}
              className="break-inside-avoid flex flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 hover:border-white/20 group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: (index % 3) * 0.15, duration: 0.5 }}
            >
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className={`h-5 w-5 ${i < review.rating ? 'text-accent' : 'text-gray-600'}`} />
                    ))}
                  </div>
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary-light uppercase tracking-wider">{review.plan}</span>
                </div>

                <p className="text-lg leading-relaxed text-gray-300 font-light group-hover:text-white transition-colors duration-300">
                  "{review.content}"
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500">
                  <div className="flex items-center gap-1.5 bg-dark-bg/50 px-3 py-1.5 rounded-full">
                    <MapPinIcon className="h-4 w-4 text-secondary" />
                    <span>{review.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-dark-bg/50 px-3 py-1.5 rounded-full">
                    <ClockIcon className="h-4 w-4 text-secondary" />
                    <span>{review.timeline}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4 border-t border-white/10 pt-6">
                <img className="h-14 w-14 rounded-full object-cover border-2 border-transparent group-hover:border-primary transition-colors duration-300" src={review.image} alt={review.name} />
                <div>
                  <h3 className="font-bold text-white text-lg">{review.name}</h3>
                  <p className="text-sm text-primary-light font-medium">{review.role}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
