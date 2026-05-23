import React, { useState, useEffect, useRef } from 'react';
import { processResume } from '../../services/resumeService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  XMarkIcon,
  DocumentMagnifyingGlassIcon,
  DocumentTextIcon,
  CpuChipIcon,
  ChartBarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import sadRobotError from '../../assets/sad_robot_error.png';

const STEPS = [
  { label: 'Reading document', icon: DocumentMagnifyingGlassIcon, color: 'violet' },
  { label: 'Extracting text via OCR', icon: DocumentTextIcon, color: 'cyan' },
  { label: 'AI analyzing skills & experience', icon: CpuChipIcon, color: 'fuchsia' },
  { label: 'Calculating ATS score', icon: ChartBarIcon, color: 'amber' },
  { label: 'Generating your report', icon: SparklesIcon, color: 'emerald' },
];

const COLOR_MAP = {
  violet: { ring: 'border-violet-500', bg: 'bg-violet-500', text: 'text-violet-400', glow: 'shadow-[0_0_20px_rgba(139,92,246,0.4)]' },
  cyan: { ring: 'border-cyan-500', bg: 'bg-cyan-500', text: 'text-cyan-400', glow: 'shadow-[0_0_20px_rgba(6,182,212,0.4)]' },
  fuchsia: { ring: 'border-fuchsia-500', bg: 'bg-fuchsia-500', text: 'text-fuchsia-400', glow: 'shadow-[0_0_20px_rgba(217,70,239,0.4)]' },
  amber: { ring: 'border-amber-500', bg: 'bg-amber-500', text: 'text-amber-400', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]' },
  emerald: { ring: 'border-emerald-500', bg: 'bg-emerald-500', text: 'text-emerald-400', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]' },
};

// Fun Gen Z loading phrases that rotate
const LOADING_VIBES = [
  "Doing the heavy lifting so you don't have to ✨",
  "Our AI is speed-reading your resume rn 🤓",
  "Crunching numbers like a pro 📊",
  "Almost there, hang tight fr fr 🔥",
  "Cooking up something good 🍳",
  "Manifesting the best ATS score for you 🪄",
  "Lowkey analyzing every detail 🔍",
];

export default function ResumeAnalysisModal({ fileDetails, open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [vibeIndex, setVibeIndex] = useState(0);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  // Rotate vibes text
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setVibeIndex(prev => (prev + 1) % LOADING_VIBES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [loading]);

  // Particle background animation
  useEffect(() => {
    if (!loading || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const particles = [];
    const PARTICLE_COUNT = 35;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };
    resize();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        r: Math.random() * 2 + 0.5,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      for (const p of particles) {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.offsetWidth) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.offsetHeight) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${p.opacity})`;
        ctx.fill();
      }
      animFrameRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [loading]);

  useEffect(() => {
    if (open && fileDetails) {
      setLoading(true);
      setError(null);
      setResult(null);
      setProgress(0);
      setCurrentStep(0);

      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return 95;
          return prev + Math.random() * 4 + 1;
        });
      }, 350);

      const stepIntervals = [
        setTimeout(() => setCurrentStep(1), 1500),
        setTimeout(() => setCurrentStep(2), 3500),
        setTimeout(() => setCurrentStep(3), 6000),
        setTimeout(() => setCurrentStep(4), 8000),
      ];

      (async () => {
        try {
          const res = await processResume(fileDetails.url, { model: 'meta-llama/llama-3.3-70b-instruct:free' });
          if (res?.success && res?.data?.analysis?.structured) {
            setProgress(100);
            setCurrentStep(4);
            setTimeout(() => {
              setResult(res.data.analysis.structured);
              setLoading(false);
            }, 600);
          } else {
            setError(res?.error || 'Failed to analyze resume.');
            setLoading(false);
          }
        } catch (err) {
          setError(
            err?.response?.status === 403
              ? 'Not enough credits. Please upgrade your plan.'
              : err.message || 'Failed to analyze resume.'
          );
          setLoading(false);
        } finally {
          clearInterval(progressInterval);
          stepIntervals.forEach(clearTimeout);
        }
      })();
    }

    if (!open) {
      setLoading(false);
      setError(null);
      setResult(null);
      setProgress(0);
      setCurrentStep(0);
    }
  }, [open, fileDetails]);

  if (!open) return null;

  const activeColor = COLOR_MAP[STEPS[currentStep]?.color || 'violet'];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={!loading ? onClose : undefined}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          className="relative bg-[#111116] border border-white/10 rounded-3xl max-w-md w-full mx-auto overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top gradient border */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500" />

          {loading ? (
            <div className="relative p-8 sm:p-10">
              {/* Particle canvas background */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
              />

              {/* Ambient glow behind the ring */}
              <div className={`absolute top-8 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-[60px] ${activeColor.bg} opacity-20 pointer-events-none transition-colors duration-700`} />

              <div className="relative z-10">
                {/* Central animated ring */}
                <div className="flex justify-center mb-8">
                  <div className="relative h-28 w-28">
                    {/* Outer pulsing ring */}
                    <motion.div
                      className={`absolute inset-0 rounded-full border-2 ${activeColor.ring} opacity-30`}
                      animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    {/* Background track */}
                    <div className="absolute inset-0 rounded-full border-[3px] border-white/5" />
                    {/* Spinning progress arc */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 112 112">
                      <circle
                        cx="56" cy="56" r="52"
                        fill="none"
                        stroke="url(#progressGradient)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${progress * 3.27} ${327 - progress * 3.27}`}
                        className="transition-all duration-500 ease-out"
                      />
                      <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="50%" stopColor="#d946ef" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>
                    {/* Inner content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span
                        key={Math.round(progress)}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-2xl font-extrabold text-white font-display tabular-nums"
                      >
                        {Math.round(progress)}%
                      </motion.span>
                      <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mt-0.5">
                        Processing
                      </span>
                    </div>
                  </div>
                </div>

                {/* Heading */}
                <h3 className="text-xl font-extrabold text-white text-center mb-1 font-display tracking-tight">
                  Analyzing Resume
                </h3>
                {/* Rotating vibes text */}
                <AnimatePresence mode="wait">
                  <motion.p
                    key={vibeIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="text-sm text-zinc-500 text-center mb-8 h-5 font-medium"
                  >
                    {LOADING_VIBES[vibeIndex]}
                  </motion.p>
                </AnimatePresence>

                {/* Steps list */}
                <div className="space-y-3">
                  {STEPS.map((step, i) => {
                    const isActive = i === currentStep;
                    const isDone = i < currentStep;
                    const color = COLOR_MAP[step.color];
                    const StepIcon = step.icon;

                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-500 ${
                          isActive
                            ? `bg-white/5 border border-white/10 ${color.glow}`
                            : isDone
                            ? 'opacity-60'
                            : 'opacity-30'
                        }`}
                      >
                        {/* Step icon circle */}
                        <div className="relative flex-shrink-0">
                          <div
                            className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-500 ${
                              isDone
                                ? 'bg-emerald-500/20 border border-emerald-500/30'
                                : isActive
                                ? `bg-white/10 border border-white/20`
                                : 'bg-white/5 border border-white/5'
                            }`}
                          >
                            {isDone ? (
                              <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <StepIcon className={`h-4 w-4 ${isActive ? color.text : 'text-zinc-600'}`} />
                            )}
                          </div>
                          {/* Active pulse dot */}
                          {isActive && (
                            <motion.div
                              className={`absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ${color.bg}`}
                              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          )}
                        </div>

                        {/* Step label */}
                        <span
                          className={`text-sm font-semibold transition-colors duration-500 ${
                            isActive ? 'text-zinc-100' : isDone ? 'text-zinc-400 line-through' : 'text-zinc-600'
                          }`}
                        >
                          {step.label}
                        </span>

                        {/* Done / active indicator */}
                        <div className="ml-auto">
                          {isDone && (
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Done</span>
                          )}
                          {isActive && (
                            <motion.div
                              className={`h-1.5 w-6 rounded-full ${color.bg} opacity-60`}
                              animate={{ opacity: [0.3, 0.8, 0.3] }}
                              transition={{ duration: 1.2, repeat: Infinity }}
                            />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Bottom progress bar */}
                <div className="mt-6 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>
          ) : error ? (
            /* ── Error State ── */
            <div className="p-8 sm:p-10 text-center relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-500/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="relative z-10">
                <img
                  src={sadRobotError}
                  alt="Error"
                  className="w-24 h-24 mx-auto rounded-2xl object-cover shadow-[0_0_30px_rgba(239,68,68,0.25)] border border-red-500/30 mb-5"
                />
                <h3 className="text-xl font-extrabold text-white mb-2 font-display">
                  Oof, that didn't work 💔
                </h3>
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed max-w-xs mx-auto">{error}</p>
                <button
                  onClick={onClose}
                  className="w-full bg-white/10 hover:bg-white/15 text-zinc-200 text-sm font-bold px-5 py-3 rounded-xl transition-all duration-200 border border-white/10 hover:border-white/20"
                >
                  Got it, I'll try again later
                </button>
              </div>
            </div>
          ) : result ? (
            /* ── Success State ── */
            <div className="p-8 sm:p-10 text-center relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                  className="h-20 w-20 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 relative"
                >
                  <motion.div
                    className="absolute inset-0 bg-emerald-500/15 rounded-full"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <CheckCircleIcon className="h-10 w-10 text-emerald-400" />
                </motion.div>
                <h3 className="text-xl font-extrabold text-white mb-2 font-display">
                  Analysis Complete! 🎉
                </h3>
                <p className="text-sm text-zinc-400 mb-6 font-medium">
                  Your resume report is ready to view.
                </p>
                <button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-bold px-5 py-3 rounded-xl transition-all duration-200 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                >
                  View Report →
                </button>
              </div>
            </div>
          ) : null}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}