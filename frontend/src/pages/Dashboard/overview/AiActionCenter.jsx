import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import {
  QueueListIcon,
  CheckCircleIcon,
  TagIcon,
  PencilSquareIcon,
  DocumentTextIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

function generateTasks(analysis) {
  if (!analysis) return [];
  const tasks = [];
  const atsScore = analysis.atsScore ?? 0;
  const improvements = analysis.issues;
  const techSkills = analysis.skills.technical.length;
  const workExp = analysis.workExperience;
  const summary = analysis.summary;
  const missingKeywords = analysis.missingKeywords;

  if (atsScore < 70) {
    tasks.push({
      id: 'ats-improve',
      label: `Improve ATS score (currently ${atsScore}%)`,
      priority: 'high',
      icon: AdjustmentsHorizontalIcon,
    });
  }

  if (techSkills < 5) {
    tasks.push({
      id: 'add-skills',
      label: 'Add more technical skills to your resume',
      priority: 'medium',
      icon: TagIcon,
    });
  }

  if (!summary || summary.length < 30) {
    tasks.push({
      id: 'add-summary',
      label: 'Write a compelling professional summary',
      priority: 'high',
      icon: PencilSquareIcon,
    });
  }

  const missingAchievements = workExp.filter(w => !w.achievements || w.achievements.length === 0);
  if (missingAchievements.length > 0) {
    tasks.push({
      id: 'add-achievements',
      label: `Add measurable achievements to ${missingAchievements.length} role${missingAchievements.length > 1 ? 's' : ''}`,
      priority: 'high',
      icon: SparklesIcon,
    });
  }

  if (missingKeywords.length > 0) {
    tasks.push({
      id: 'add-keywords',
      label: `Add ${missingKeywords.length} missing ATS keyword${missingKeywords.length > 1 ? 's' : ''}: ${missingKeywords.slice(0, 3).join(', ')}`,
      priority: 'medium',
      icon: TagIcon,
    });
  }

  improvements.forEach((imp, i) => {
    if (i < 2 && !tasks.some(t => t.label.toLowerCase().includes(imp.toLowerCase().slice(0, 15)))) {
      tasks.push({
        id: `improvement-${i}`,
        label: imp,
        priority: i === 0 ? 'high' : 'medium',
        icon: DocumentTextIcon,
      });
    }
  });

  return tasks.slice(0, 7);
}

const priorityConfig = {
  high: { dot: 'bg-red-500', label: 'High', labelClass: 'text-red-400 bg-red-500/15' },
  medium: { dot: 'bg-amber-500', label: 'Med', labelClass: 'text-amber-400 bg-amber-500/15' },
  low: { dot: 'bg-blue-500', label: 'Low', labelClass: 'text-blue-400 bg-blue-500/15' },
};

export default function AiActionCenter({ latestAnalysis }) {
  const { currentUser, updateProfile } = useAuth();
  const tasks = useMemo(() => generateTasks(latestAnalysis), [latestAnalysis]);

  // Read completed state from backend profile
  const [completed, setCompleted] = useState({});
  
  // Sync local state when currentUser updates from backend
  useEffect(() => {
    if (currentUser?.completedTasks) {
      const completedMap = {};
      currentUser.completedTasks.forEach(taskId => {
        completedMap[taskId] = true;
      });
      setCompleted(completedMap);
    }
  }, [currentUser?.completedTasks]);

  const toggleTask = async (id) => {
    // Optimistic UI update
    const isNowDone = !completed[id];
    const newCompleted = { ...completed, [id]: isNowDone };
    setCompleted(newCompleted);

    // Convert map back to array for backend
    const completedArray = Object.keys(newCompleted).filter(key => newCompleted[key]);
    
    // Sync to backend silently
    try {
      await updateProfile({ completedTasks: completedArray });
    } catch (err) {
      console.error('Failed to sync tasks to database', err);
      // Revert on failure
      setCompleted(completed);
    }
  };

  const completedCount = tasks.filter(t => completed[t.id]).length;

  if (!latestAnalysis) {
    return (
      <div className="bg-[#0d0d12]/80 backdrop-blur-md border border-white/[0.06] rounded-xl p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <QueueListIcon className="h-5 w-5 text-violet-400" />
          <h3 className="text-base font-bold text-zinc-100 font-display">Action Center</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="h-14 w-14 bg-white/[0.03] rounded-full flex items-center justify-center mb-3 border border-white/[0.06]">
            <QueueListIcon className="h-7 w-7 text-zinc-600" />
          </div>
          <p className="text-sm font-medium text-zinc-500">AI tasks will appear after your first analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-6 relative overflow-hidden hover:border-white/[0.15] transition-all duration-300">
      <div className="absolute top-0 left-0 w-40 h-40 bg-violet-500/[0.03] blur-[60px rounded-full pointer-events-none group-hover:bg-violet-500/[0.05] transition-colors" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-violet-500/10 rounded-xl border border-violet-500/20">
            <QueueListIcon className="h-4 w-4 text-violet-400" />
          </div>
          <h3 className="text-lg font-bold text-zinc-100 font-display">Action Center</h3>
        </div>
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
          {completedCount}/{tasks.length} done
        </span>
      </div>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden mb-5 relative z-10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
            initial={{ width: 0 }}
            animate={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}

      {/* Tasks */}
      <div className="space-y-1.5 relative z-10">
        {tasks.map((task, i) => {
          const isDone = completed[task.id];
          const pConfig = priorityConfig[task.priority];

          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.04 * i }}
              onClick={() => toggleTask(task.id)}
              className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                isDone
                  ? 'bg-white/[0.02] opacity-50'
                  : 'hover:bg-white/[0.03] border border-transparent hover:border-white/[0.06] hover:shadow-lg'
              }`}
            >
              {/* Checkbox */}
              <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                isDone
                  ? 'bg-violet-500/20 border-violet-500/40'
                  : 'border-white/15 group-hover:border-white/30'
              }`}>
                {isDone && <CheckCircleIcon className="h-3.5 w-3.5 text-violet-400" />}
              </div>

              {/* Label */}
              <p className={`text-sm font-medium flex-1 min-w-0 truncate transition-all ${
                isDone ? 'text-zinc-600 line-through' : 'text-zinc-300'
              }`}>
                {task.label}
              </p>

              {/* Priority badge */}
              {!isDone && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${pConfig.labelClass} uppercase tracking-wider flex-shrink-0`}>
                  {pConfig.label}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
