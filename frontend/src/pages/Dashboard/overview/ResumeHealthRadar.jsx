import React from 'react';
import { skillCount } from '../../../utils/analysisSchema';
import Card from '../../../components/ui/Card';
import SectionHeader from '../../../components/ui/SectionHeader';
import Meter from '../../../components/report/Meter';

function deriveCategories(analysis) {
  const { contactInformation: contact, workExperience: work, education: edu } = analysis;

  const contactFields = [contact.email, contact.phone, contact.location, contact.linkedin].filter(Boolean);
  const contactScore = Math.min(100, Math.round((contactFields.length / 4) * 100));
  const skillsScore = Math.min(100, Math.round((skillCount(analysis) / 15) * 100));
  const hasAchievements = work.some((w) => w.achievements?.length > 0);
  const expScore = Math.min(100, Math.min(100, work.length * 25) + (hasAchievements ? 20 : 0));
  const eduScore = Math.min(100, edu.length * 50);

  return [
    { label: 'ATS compatibility', score: analysis.atsScore ?? 0 },
    { label: 'Contact details', score: contactScore },
    { label: 'Skills coverage', score: skillsScore },
    { label: 'Experience', score: expScore },
    { label: 'Education', score: eduScore },
    { label: 'Technical depth', score: analysis.technicalDepth?.score ?? 0 },
    { label: 'Impact & ownership', score: analysis.impactAndOwnership?.score ?? 0 },
  ];
}

/**
 * Section-by-section breakdown of the latest resume. No headline number here:
 * an average of these bars would be yet another "overall" score competing with
 * the one at the top of the page.
 */
export default function ResumeHealthRadar({ latestAnalysis }) {
  const categories = deriveCategories(latestAnalysis);

  return (
    <Card className="h-full">
      <SectionHeader title="Breakdown" hint="How each part of the page holds up" className="mb-6" />
      <div className="space-y-[1.125rem]">
        {categories.map((cat, i) => (
          <Meter key={cat.label} label={cat.label} value={cat.score} delay={0.04 * i} />
        ))}
      </div>
    </Card>
  );
}
