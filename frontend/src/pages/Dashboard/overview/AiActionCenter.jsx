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
import Card from '../../../components/ui/Card';
import SectionHeader from '../../../components/ui/SectionHeader';
import EmptyState from '../../../components/ui/EmptyState';
import Badge from '../../../components/ui/Badge';

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
  high: { label: 'High', variant: 'red' },
  medium: { label: 'Med', variant: 'amber' },
  low: { label: 'Low', variant: 'neutral' },
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
      <Card>
        <SectionHeader icon={QueueListIcon} title="Action Center" className="mb-4" />
        <EmptyState icon={QueueListIcon} message="AI tasks will appear after your first analysis" />
      </Card>
    );
  }

  return (
    <Card>
      <SectionHeader
        icon={QueueListIcon}
        title="Action Center"
        right={
          <span className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
            {completedCount}/{tasks.length} done
          </span>
        }
        className="mb-4"
      />

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden mb-5">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / tasks.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}

      {/* Tasks */}
      <div className="space-y-1.5">
        {tasks.map((task) => {
          const isDone = completed[task.id];
          const pConfig = priorityConfig[task.priority];

          return (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                isDone ? 'opacity-50' : 'hover:bg-white/[0.03]'
              }`}
            >
              <div className={`h-5 w-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${
                isDone ? 'bg-primary/20 border-primary/40' : 'border-line group-hover:border-line-strong'
              }`}>
                {isDone && <CheckCircleIcon className="h-3.5 w-3.5 text-primary" />}
              </div>

              <p className={`text-sm font-medium flex-1 min-w-0 truncate ${
                isDone ? 'text-ink-faint line-through' : 'text-ink-muted'
              }`}>
                {task.label}
              </p>

              {!isDone && <Badge variant={pConfig.variant}>{pConfig.label}</Badge>}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
