import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/20/solid';
import { reveal } from '../utils/motion';

const successStories = [
  {
    id: 1,
    name: "Priya Malhotra",
    role: "Software Developer @ Microsoft",
    before: "Fresh graduate, no industry experience",
    after: "Landed dream tech role in 3 weeks",
    key_improvements: [
      "ATS score improved from 45% to 92%",
      "6 interview calls within first week",
      "3 job offers to choose from"
    ],
    image: "https://images.unsplash.com/photo-1598346762291-aee88549193f?w=150&h=150&fit=crop&crop=faces&auto=format&q=80",
    quote: "ResumeZen helped me transform my academic projects into professional achievements. The AI suggestions were game-changing!"
  },
  {
    id: 2,
    name: "Rahul Sharma",
    role: "Data Analyst @ Amazon",
    before: "Career transition from sales",
    after: "Successfully switched to data analytics",
    key_improvements: [
      "Resume optimized for tech keywords",
      "4 interviews in top tech companies",
      "50% salary increase"
    ],
    image: "https://images.unsplash.com/photo-1628157588553-5eeea00af15c?w=150&h=150&fit=crop&crop=faces&auto=format&q=80",
    quote: "The industry-specific keywords and ATS optimization made my career switch possible. Best ₹19 I've ever spent!"
  },
  {
    id: 3,
    name: "Aisha Patel",
    role: "Product Manager @ Flipkart",
    before: "Generic resume with low response rate",
    after: "Targeted resume with 85% interview success",
    key_improvements: [
      "Highlighted leadership achievements",
      "8 callbacks from top startups",
      "Multiple competing offers"
    ],
    image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=150&h=150&fit=crop&crop=faces&auto=format&q=80",
    quote: "ResumeZen helped me showcase my achievements in a way that caught recruiters' attention immediately!"
  },
  {
    id: 4,
    name: "Vikram Singh",
    role: "ML Engineer @ Google",
    before: "PhD graduate with academic-focused CV",
    after: "Industry-ready resume highlighting practical skills",
    key_improvements: [
      "Translated research into business impact",
      "5 tech giants showed interest",
      "Dream role secured in 2 weeks"
    ],
    image: "https://images.unsplash.com/photo-1619380061814-58f03707f082?w=150&h=150&fit=crop&crop=faces&auto=format&q=80",
    quote: "The AI suggestions helped me translate my academic achievements into industry-relevant experience. Incredible tool!"
  },
  {
    id: 5,
    name: "Neha Reddy",
    role: "UX Designer @ Swiggy",
    before: "Portfolio but no proper resume",
    after: "Balanced resume showcasing both skills and projects",
    key_improvements: [
      "ATS score jumped to 88%",
      "7 interview calls in 10 days",
      "2x salary expectations"
    ],
    image: "https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=150&h=150&fit=crop&crop=faces&auto=format&q=80",
    quote: "As a designer, I was focused on my portfolio. ResumeZen helped me create a resume that complemented my work perfectly!"
  },
  {
    id: 6,
    name: "Arjun Menon",
    role: "Frontend Developer @ Razorpay",
    before: "Bootcamp graduate with no experience",
    after: "Professional resume highlighting practical skills",
    key_improvements: [
      "Projects presented professionally",
      "5 startups reached out",
      "Landed role within a month"
    ],
    image: "https://images.unsplash.com/photo-1618641986557-1ecd230959aa?w=150&h=150&fit=crop&crop=faces&auto=format&q=80",
    quote: "The AI helped me present my bootcamp projects in a professional way that resonated with employers. Worth every penny!"
  }
];

// What ₹19 buys elsewhere, for scale
const PRICE_POINTS = [
  { price: '₹19', label: 'A ResumeZen check', ours: true },
  { price: '₹25', label: 'A pack of cookies' },
  { price: '₹30', label: 'A box of biscuits' },
  { price: '₹35', label: 'A snack combo' },
];

export default function SuccessStories() {
  return (
    <section className="pb-24 pt-14 sm:pb-32 sm:pt-20">
      <div className="shell">
        <motion.header {...reveal()} className="mb-14 max-w-3xl sm:mb-20">
          <p className="t-label mb-6 flex items-center gap-2.5 text-ink-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Success stories
          </p>
          <h1 className="t-display !text-[clamp(2.6rem,6.4vw,5rem)]">
            Before the rewrite, and <em className="t-em">after.</em>
          </h1>
          <p className="t-lead mt-7 max-w-2xl">
            Six people, where they started, what changed on the page, and what happened next.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {successStories.map((story, index) => (
            <motion.article
              key={story.id}
              {...reveal((index % 3) * 0.08)}
              className="group flex flex-col rounded-lg border border-line bg-surface p-6 shadow-e1 transition-colors duration-base hover:border-line-strong sm:p-7"
            >
              <header className="flex items-center gap-3.5">
                <img
                  src={story.image}
                  alt=""
                  width={44}
                  height={44}
                  loading="lazy"
                  decoding="async"
                  className="h-11 w-11 rounded-full object-cover grayscale transition-[filter] duration-slow group-hover:grayscale-0"
                />
                <div className="min-w-0">
                  <h2 className="truncate text-[0.9375rem] font-medium text-ink">{story.name}</h2>
                  <p className="truncate text-[0.8125rem] text-ink-faint">{story.role}</p>
                </div>
              </header>

              {/* Before / after, set like a correction: the old line struck,
                  the new one written in */}
              <dl className="mt-6 space-y-3 border-y border-line py-5">
                <div className="grid grid-cols-[3.75rem_1fr] gap-3">
                  <dt className="t-label pt-1">Before</dt>
                  <dd className="text-sm leading-snug text-ink-faint line-through decoration-ink-faint/50">{story.before}</dd>
                </div>
                <div className="grid grid-cols-[3.75rem_1fr] gap-3">
                  <dt className="t-label pt-1 text-primary-light">After</dt>
                  <dd className="text-sm font-medium leading-snug text-ink">{story.after}</dd>
                </div>
              </dl>

              <ul className="mt-5 space-y-2.5">
                {story.key_improvements.map((improvement) => (
                  <li key={improvement} className="flex items-start gap-2.5 text-sm leading-snug text-ink-muted">
                    <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-good" aria-hidden="true" />
                    {improvement}
                  </li>
                ))}
              </ul>

              <blockquote
                className="mt-6 flex-1 border-l border-primary/50 pl-4 font-display text-[1.0625rem] font-[360] italic leading-[1.5] text-ink"
                style={{ fontVariationSettings: "'SOFT' 100" }}
              >
                “{story.quote}”
              </blockquote>
            </motion.article>
          ))}
        </div>

        {/* Price, for scale */}
        <motion.div {...reveal()} className="mt-20 grid grid-cols-1 gap-10 border-t border-line pt-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16">
          <div>
            <h2 className="t-h1">Less than a pack of <em className="t-em">cookies.</em></h2>
            <p className="t-lead mt-5 max-w-md">
              A single check costs ₹19. The cookies are gone in an afternoon; a resume that gets read keeps working.
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-3">
            {PRICE_POINTS.map((item) => (
              <li
                key={item.label}
                className={`relative overflow-hidden rounded-lg p-5 ${
                  item.ours ? 'bg-paper text-paper-ink shadow-sheet' : 'border border-line bg-surface'
                }`}
              >
                {item.ours && <div aria-hidden="true" className="paper-grain pointer-events-none absolute inset-0 opacity-60" />}
                <p className={`t-num relative text-[2.25rem] ${item.ours ? '!text-paper-ink' : '!text-ink-muted'}`}>{item.price}</p>
                <p className={`relative mt-2 text-[0.8125rem] ${item.ours ? 'font-medium text-paper-ink' : 'text-ink-faint'}`}>{item.label}</p>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
