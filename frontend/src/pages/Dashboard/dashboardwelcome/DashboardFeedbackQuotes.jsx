import React, { useEffect, useState } from 'react';

const motivationalQuotes = [
  "You're one step closer to standing out from the crowd!",
  "Your resume is about to get a professional makeover.",
  "Good things come to those who optimize their resumes.",
  "Success is where preparation and opportunity meet.",
  "Your career journey begins with a great resume.",
  "Our AI is analyzing your skills and experience to help you shine.",
  "The best resumes tell a story. Let's make yours compelling.",
  "Small changes to your resume can make a big difference.",
  "Your resume is your personal marketing document. Let's polish it!",
  "Every second spent improving your resume is an investment in your future.",
  "Attention to detail separates good resumes from great ones.",
  "The average recruiter spends 6-7 seconds scanning your resume. Let's make them count!",
  "We're helping you put your best foot forward.",
  "Your potential is unlimited. Let's make sure your resume shows it.",
  "Success is the sum of small efforts, repeated day in and day out."
];

const DashboardFeedbackQuotes = () => {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="my-8 flex flex-col items-center">
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-4 mb-4 max-w-xl text-center">
        <span className="text-lg text-blue-700 font-medium italic">
          {motivationalQuotes[quoteIndex]}
        </span>
      </div>
    </div>
  );
};

export default DashboardFeedbackQuotes;
