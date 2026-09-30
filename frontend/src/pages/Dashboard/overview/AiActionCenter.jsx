import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import Card from '../../../components/ui/Card';
import SectionHeader from '../../../components/ui/SectionHeader';
import EmptyState from '../../../components/ui/EmptyState';
import { CheckIcon } from '@heroicons/react/20/solid';
import { ease, spring } from '../../../utils/motion';

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
    });
  }

  if (techSkills < 5) {
    tasks.push({
      id: 'add-skills',
      label: 'Add more technical skills to your resume',
      priority: 'medium',
    });
  }

  if (!summary || summary.length < 30) {
    tasks.push({
      id: 'add-summary',
      label: 'Write a compelling professional summary',
      priority: 'high',
    });
  }

  const missingAchievements = workExp.filter(w => !w.achievements || w.achievements.length === 0);
  if (missingAchievements.length > 0) {
    tasks.push({
      id: 'add-achievements',
      label: `Add measurable achievements to ${missingAchievements.length} role${missingAchievements.length > 1 ? 's' : ''}`,
      priority: 'high',
    });
  }

  if (missingKeywords.length > 0) {
    tasks.push({
      id: 'add-keywords',
      label: `Add ${missingKeywords.length} missing ATS keyword${missingKeywords.length > 1 ? 's' : ''}: ${missingKeywords.slice(0, 3).join(', ')}`,
      priority: 'medium',
    });
  }

  improvements.forEach((imp, i) => {
    if (i < 2 && !tasks.some(t => t.label.toLowerCase().includes(imp.toLowerCase().slice(0, 15)))) {
      tasks.push({
        id: `improvement-${i}`,
        label: imp,
        priority: i === 0 ? 'high' : 'medium',
      });
    }
  });

  // Scope ids to this analysis. Generic ids like 'ats-improve' made a task
  // ticked off on one resume show as already done on every later resume.
  const scope = analysis.id || 'latest';
  return tasks.slice(0, 7).map(t => ({ ...t, id: `${scope}:${t.id}` }));
}

export default function AiActionCenter({ latestAnalysis }) {
  const { currentUser, updateProfile } = useAuth();
  const tasks = useMemo(() => generateTasks(latestAnalysis), [latestAnalysis]);

  // Completed task ids, seeded from the backend profile
  const [completed, setCompleted] = useState(() => new Set(currentUser?.completedTasks || []));

  // Sync local state when currentUser updates from backend
  useEffect(() => {
    setCompleted(new Set(currentUser?.completedTasks || []));
  }, [currentUser?.completedTasks]);

  const toggleTask = async (id) => {
    const previous = completed;
    const next = new Set(previous);
    if (next.has(id)) next.delete(id); else next.add(id);
    setCompleted(next); // optimistic

    // Persist only the tasks currently on screen: ids from older analyses (and
    // the old unscoped ids) can never be shown again, so don't keep them.
    const visible = new Set(tasks.map(t => t.id));
    const result = await updateProfile({ completedTasks: [...next].filter(t => visible.has(t)) });

    // updateProfile reports failure via { success: false } rather than
    // throwing, so the old try/catch revert never ran.
    if (!result?.success) setCompleted(previous);
  };

  const completedCount = tasks.filter(t => completed.has(t.id)).length;
  const allDone = tasks.length > 0 && completedCount === tasks.length;

  return (
    <Card className="h-full">
      <SectionHeader
        title="Before you send it"
        hint="A short list built from this report. Tick things off as you edit."
        right={tasks.length > 0 ? <span className="t-meta">{completedCount} / {tasks.length}</span> : null}
        className="mb-4"
      />

      {tasks.length === 0 ? (
        <EmptyState
          compact
          icon={CheckIcon}
          title="Nothing to do"
          message="This resume didn't produce any follow-up tasks."
        />
      ) : (
        <>
          <div className="mb-3 h-[3px] w-full overflow-hidden rounded-full bg-ink/10">
            <motion.div
              className={`h-full w-full origin-left rounded-full ${allDone ? 'bg-good' : 'bg-ink/70'}`}
              initial={false}
              animate={{ scaleX: completedCount / tasks.length }}
              transition={{ duration: 0.5, ease: ease.out }}
            />
          </div>

          <ul className="-mx-2">
            {tasks.map((task) => {
              const isDone = completed.has(task.id);
              return (
                <li key={task.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={isDone}
                    onClick={() => toggleTask(task.id)}
                    className="group flex w-full items-start gap-3 rounded-md px-2 py-2.5 text-left hover:bg-ink/[0.04]"
                  >
                    <span
                      className={`mt-0.5 flex h-[1.125rem] w-[1.125rem] flex-shrink-0 items-center justify-center rounded border transition-colors duration-base ${
                        isDone ? 'border-good bg-good text-surface' : 'border-line-strong group-hover:border-ink/50'
                      }`}
                    >
                      <motion.span
                        initial={false}
                        animate={{ scale: isDone ? 1 : 0, opacity: isDone ? 1 : 0 }}
                        transition={spring}
                      >
                        <CheckIcon className="h-3.5 w-3.5" />
                      </motion.span>
                    </span>

                    <span className={`min-w-0 flex-1 text-sm leading-relaxed transition-colors duration-base ${
                      isDone ? 'text-ink-faint line-through decoration-ink-faint/60' : 'text-ink-muted group-hover:text-ink'
                    }`}>
                      {task.label}
                    </span>

                    {!isDone && task.priority === 'high' && (
                      <span className="t-label mt-1.5 flex-shrink-0 text-primary-light">First</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Card>
  );
}
