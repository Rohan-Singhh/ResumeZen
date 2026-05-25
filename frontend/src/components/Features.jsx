import { motion } from 'framer-motion';
import {
  SparklesIcon,
  DocumentCheckIcon,
  PresentationChartLineIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    id: 1,
    title: "Brutal ATS Auditing",
    description: "Our elite-level AI rips apart your resume and exposes weak bullet points, inflated claims, and missing metrics exactly like a FAANG recruiter would.",
    icon: SparklesIcon,
    colSpan: "col-span-1 lg:col-span-2",
    bgClass: "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent",
    visual: (
      <div className="absolute right-0 bottom-0 w-3/4 h-40 bg-[#121214] border-t border-l border-white/10 rounded-tl-2xl p-5 overflow-hidden flex flex-col gap-3 transform translate-y-8 group-hover:translate-y-2 transition-transform duration-500">
        <div className="flex justify-between items-center mb-2">
          <div className="h-2 w-24 bg-zinc-700 rounded-full"></div>
          <div className="text-xs font-mono text-red-400">Score: 42/100</div>
        </div>
        <div className="w-full p-2 rounded bg-red-500/10 border border-red-500/20 flex gap-3">
          <div className="w-1 h-full bg-red-500 rounded-full"></div>
          <div className="space-y-2 flex-1">
            <div className="h-1.5 w-full bg-zinc-600 rounded-full"></div>
            <div className="h-1.5 w-3/4 bg-zinc-600 rounded-full"></div>
            <div className="h-1.5 w-1/2 bg-red-500/50 rounded-full mt-2"></div>
          </div>
        </div>
        <div className="w-full p-2 rounded bg-white/5 border border-white/10 flex gap-3 opacity-50">
          <div className="w-1 h-full bg-zinc-500 rounded-full"></div>
          <div className="space-y-2 flex-1">
            <div className="h-1.5 w-full bg-zinc-700 rounded-full"></div>
            <div className="h-1.5 w-5/6 bg-zinc-700 rounded-full"></div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: "Impact Quantification",
    description: "Stop using vague statements. The engine automatically suggests exact measurable metrics to prove your scale and ownership.",
    icon: PresentationChartLineIcon,
    colSpan: "col-span-1",
    bgClass: "bg-gradient-to-br from-accent/10 via-accent/5 to-transparent",
    visual: (
      <div className="absolute right-0 bottom-0 w-full h-32 flex items-end justify-center px-8 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
        <div className="flex items-end gap-2 h-full w-full pt-8 border-b border-white/10">
          <motion.div initial={{height: "20%"}} whileInView={{height: "40%"}} transition={{duration: 1}} className="flex-1 bg-gradient-to-t from-white/10 to-transparent rounded-t-sm"></motion.div>
          <motion.div initial={{height: "30%"}} whileInView={{height: "60%"}} transition={{duration: 1, delay: 0.2}} className="flex-1 bg-gradient-to-t from-white/20 to-transparent rounded-t-sm"></motion.div>
          <motion.div initial={{height: "40%"}} whileInView={{height: "85%"}} transition={{duration: 1, delay: 0.4}} className="flex-1 bg-gradient-to-t from-accent/50 to-transparent rounded-t-sm border-t border-accent relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-accent bg-accent/10 px-1 rounded">+340%</div>
          </motion.div>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: "Keyword Injection",
    description: "Dynamically maps missing technical stack keywords from the job description straight into your bullet points organically.",
    icon: CodeBracketIcon,
    colSpan: "col-span-1",
    bgClass: "bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent",
    visual: (
      <div className="absolute left-8 bottom-6 flex flex-wrap gap-2 pr-8 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
        <div className="text-[10px] font-mono px-2 py-1 rounded bg-secondary/20 text-secondary border border-secondary/30">React.js</div>
        <div className="text-[10px] font-mono px-2 py-1 rounded bg-white/5 text-zinc-400 border border-white/10">Node.js</div>
        <div className="text-[10px] font-mono px-2 py-1 rounded bg-white/5 text-zinc-400 border border-white/10">PostgreSQL</div>
        <div className="text-[10px] font-mono px-2 py-1 rounded bg-secondary/20 text-secondary border border-secondary/30">Kubernetes</div>
        <div className="text-[10px] font-mono px-2 py-1 rounded bg-white/5 text-zinc-400 border border-white/10">AWS</div>
        <div className="text-[10px] font-mono px-2 py-1 rounded bg-secondary/20 text-secondary border border-secondary/30">GraphQL</div>
      </div>
    )
  },
  {
    id: 4,
    title: "FAANG-Grade Templates",
    description: "Zero fluff. Use the exact single-column, highly readable LaTeX-style templates that engineers use to land offers at top-tier companies.",
    icon: DocumentCheckIcon,
    colSpan: "col-span-1 lg:col-span-2",
    bgClass: "bg-gradient-to-bl from-primary-light/10 via-primary-light/5 to-transparent",
    visual: (
      <div className="absolute right-8 -bottom-10 w-48 h-56 bg-white shadow-2xl rounded-t-lg p-4 transform rotate-6 group-hover:rotate-0 group-hover:-translate-y-4 transition-all duration-500">
        <div className="w-full flex justify-center mb-4">
          <div className="w-16 h-2 bg-zinc-300 rounded"></div>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <div className="w-20 h-1.5 bg-zinc-800 rounded"></div>
              <div className="w-10 h-1.5 bg-zinc-400 rounded"></div>
            </div>
            <div className="w-16 h-1 bg-zinc-400 rounded mb-2"></div>
            <div className="w-full h-1 bg-zinc-300 rounded mb-1"></div>
            <div className="w-5/6 h-1 bg-zinc-300 rounded mb-1"></div>
            <div className="w-4/6 h-1 bg-zinc-300 rounded"></div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <div className="w-24 h-1.5 bg-zinc-800 rounded"></div>
              <div className="w-12 h-1.5 bg-zinc-400 rounded"></div>
            </div>
            <div className="w-14 h-1 bg-zinc-400 rounded mb-2"></div>
            <div className="w-full h-1 bg-zinc-300 rounded mb-1"></div>
            <div className="w-full h-1 bg-zinc-300 rounded mb-1"></div>
          </div>
        </div>
      </div>
    )
  }
];

export default function Features() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div id="features" className="bg-dark-bg py-24 sm:py-32 relative overflow-hidden border-t border-white/5">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>

      <div className="mx-auto w-full max-w-[1400px] px-6 lg:px-8 relative z-10">
        <motion.div 
          className="max-w-3xl mb-20"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-accent mb-6 bg-accent/10 border border-accent/20 px-4 py-1.5 rounded-full">
            The Engine
          </span>
          <h2 className="text-4xl font-extrabold tracking-tighter text-white sm:text-6xl mb-6 font-display">
            A relentless <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Optimization</span> pipeline
          </h2>
          <p className="text-xl leading-relaxed text-zinc-400 font-light">
            We built the exact tool we wish we had when interviewing at FAANG. Stop guessing and start engineering your resume with data.
          </p>
        </motion.div>

        <motion.div 
          className="mt-10"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[320px]">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={feature.id}
                  variants={item}
                  className={`relative rounded-3xl border border-white/10 bg-[#0a0a0c] p-8 overflow-hidden group hover:border-white/20 transition-all duration-500 ${feature.colSpan} ${feature.bgClass}`}
                >
                  {/* Subtle inner radial glow that tracks mouse (simulated with CSS hover for now) */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 mb-6 group-hover:bg-white/10 transition-colors duration-500">
                      <Icon className="h-6 w-6 text-zinc-300" aria-hidden="true" />
                    </div>
                    <div className="max-w-[280px] md:max-w-md">
                      <h3 className="text-xl font-bold text-white tracking-tight mb-3 font-display">
                        {feature.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-zinc-400 font-light">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Abstract UI Visual */}
                  {feature.visual}
                  
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}