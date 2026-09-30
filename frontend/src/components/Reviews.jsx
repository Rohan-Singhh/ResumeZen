import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/20/solid';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import SectionHeading from './ui/SectionHeading';
import { reveal } from '../utils/motion';

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

function Rating({ value }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${value} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <StarIcon key={i} className={`h-3.5 w-3.5 ${i < value ? 'text-warn' : 'text-ink/15'}`} aria-hidden="true" />
      ))}
    </div>
  );
}

export default function Reviews() {
  return (
    <section id="reviews" className="section border-t border-line">
      <div className="shell">
        <SectionHeading
          index="04"
          eyebrow="Reviews"
          title={<>What changed after <em className="t-em">the rewrite.</em></>}
          lead="People who marked up their resume, fixed what was flagged, and sent it again."
          aside={
            <Link to="/success-stories" className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-primary-light">
              Read the longer stories
              <ArrowRightIcon className="h-4 w-4 transition-transform duration-base ease-out group-hover:translate-x-0.5" />
            </Link>
          }
        />

        {/* Masonry via CSS columns: uneven quote lengths pack without gaps */}
        <div className="gap-5 [column-fill:_balance] sm:columns-2 lg:columns-3">
          {reviews.map((review, index) => (
            <motion.figure
              key={review.id}
              {...reveal((index % 3) * 0.08)}
              className="group mb-5 break-inside-avoid rounded-lg border border-line bg-surface p-6 shadow-e1 transition-colors duration-base hover:border-line-strong sm:p-7"
            >
              <div className="flex items-center justify-between gap-3">
                <Rating value={review.rating} />
                <span className="t-meta">{review.timeline}</span>
              </div>

              <blockquote className="mt-5 font-display text-[1.125rem] font-[360] leading-[1.5] tracking-[-0.01em] text-ink" style={{ fontVariationSettings: "'SOFT' 40" }}>
                “{review.content}”
              </blockquote>

              <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                {/* Sized, lazy and async-decoded: third-party avatars never
                    shift layout or decode on the main thread mid-scroll */}
                <img
                  className="h-10 w-10 rounded-full object-cover grayscale transition-[filter] duration-slow group-hover:grayscale-0"
                  src={review.image}
                  alt=""
                  width={40}
                  height={40}
                  loading="lazy"
                  decoding="async"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{review.name}</p>
                  <p className="truncate text-[0.8125rem] text-ink-faint">{review.role} · {review.location}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
