import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  BriefcaseIcon,
  MapPinIcon,
  TagIcon,
  ArrowTopRightOnSquareIcon,
  BuildingOfficeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function DashboardJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/jobs');
        if (response.data.success) {
          setJobs(response.data.jobs);
        } else {
          setError('Failed to load jobs');
        }
      } catch (err) {
        setError('Error fetching job listings. Please try again later.');
        console.error('Job fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const timeAgo = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp * 1000); // Arbeitnow uses seconds
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <div className="space-y-8 relative z-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-extrabold text-zinc-100 font-display tracking-tight flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <BriefcaseIcon className="h-6 w-6 text-emerald-400" />
            </div>
            Job Board
          </h1>
          <p className="text-sm text-zinc-400 mt-2 font-light">Recent tech and remote opportunities from around the web.</p>
        </motion.div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-[#0d0d12]/80 border border-white/[0.06] rounded-2xl p-6 h-64 animate-pulse">
              <div className="h-6 w-3/4 bg-white/5 rounded-md mb-3" />
              <div className="h-4 w-1/2 bg-white/5 rounded-md mb-6" />
              <div className="space-y-2 mb-6">
                <div className="h-3 w-full bg-white/5 rounded-md" />
                <div className="h-3 w-full bg-white/5 rounded-md" />
                <div className="h-3 w-2/3 bg-white/5 rounded-md" />
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-white/5 rounded-full" />
                <div className="h-6 w-16 bg-white/5 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Jobs Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {jobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-[#0d0d12]/80 backdrop-blur-xl rounded-2xl border border-white/[0.08] p-6 flex flex-col transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:-translate-y-1"
            >
              {/* Subtle ambient glow on hover */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.03] rounded-full blur-[40px] pointer-events-none group-hover:bg-emerald-500/[0.08] transition-colors" />

              <div className="flex-1 relative z-10">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <h3 className="text-lg font-bold text-zinc-100 font-display leading-tight group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {job.title}
                  </h3>
                  {job.remote && (
                    <span className="flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 uppercase tracking-widest">
                      Remote
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 mb-5">
                  <div className="flex items-center gap-2 text-sm text-zinc-300 font-medium">
                    <BuildingOfficeIcon className="h-4 w-4 text-zinc-500" />
                    {job.company}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <MapPinIcon className="h-3.5 w-3.5" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <ClockIcon className="h-3.5 w-3.5" />
                    Posted {timeAgo(job.createdAt)}
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed mb-6 line-clamp-3">
                  {job.snippet}
                </p>
              </div>

              <div className="mt-auto relative z-10 pt-4 border-t border-white/[0.05]">
                {job.tags && job.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {job.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.05] text-[10px] text-zinc-400 font-medium">
                        <TagIcon className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                    {job.tags.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-white/[0.02] border border-transparent text-[10px] text-zinc-500 font-medium">
                        +{job.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.04] hover:bg-emerald-500/10 text-zinc-300 hover:text-emerald-400 border border-white/[0.08] hover:border-emerald-500/30 text-sm font-bold transition-all"
                >
                  Apply Now
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
