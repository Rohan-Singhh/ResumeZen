import React from 'react';
import { DocumentTextIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function ResumeHistory({ resumes, onViewFeedback }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Resume History</h2>
      <div className="space-y-4">
        {resumes.map(resume => (
          <div key={resume.id} className="border rounded-lg p-4 hover:border-primary transition-colors">
            <div className="flex items-center gap-4">
              <DocumentTextIcon className="w-10 h-10 text-primary" />
              <div className="flex-1">
                <h3 className="font-medium">{resume.file_name}</h3>
                <p className="text-sm text-gray-600">Uploaded on {resume.upload_date}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-primary">ATS Score: {resume.ats_score}</div>
                <button onClick={() => onViewFeedback(resume)} className="text-primary hover:text-secondary flex items-center gap-1 text-sm">View Feedback<ArrowRightIcon className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 