import React, { useEffect, useState } from 'react';

const reviews = [
  {
    name: 'Yuki T.',
    country: '🇯🇵',
    school: 'MIT',
    gender: 'male',
    img: 'https://randomuser.me/api/portraits/men/32.jpg',
    text: 'ResumeZen made my internship applications stand out. The AI feedback is world-class!',
    rating: 5
  },
  {
    name: 'Anna L.',
    country: '🇩🇪',
    school: 'Oxford',
    gender: 'female',
    img: 'https://randomuser.me/api/portraits/women/44.jpg',
    text: 'I got more interview calls after using ResumeZen. The suggestions are practical and easy to apply.',
    rating: 5
  },
  {
    name: 'Carlos M.',
    country: '🇪🇸',
    school: 'MIT',
    gender: 'male',
    img: 'https://randomuser.me/api/portraits/men/65.jpg',
    text: 'The resume analysis is fast and accurate. I recommend it to all my classmates.',
    rating: 4
  },
  {
    name: 'Priya K.',
    country: '🇮🇳',
    school: 'Oxford',
    gender: 'female',
    img: 'https://randomuser.me/api/portraits/women/68.jpg',
    text: 'The UI is beautiful and the feedback is actionable. My resume score improved instantly.',
    rating: 5
  },
  {
    name: 'Ahmed Z.',
    country: '🇪🇬',
    school: 'MIT',
    gender: 'male',
    img: 'https://randomuser.me/api/portraits/men/23.jpg',
    text: 'ResumeZen helped me tailor my resume for US tech jobs. The motivational quotes are a nice touch!',
    rating: 4
  },
  {
    name: 'Sofia R.',
    country: '🇧🇷',
    school: 'Oxford',
    gender: 'female',
    img: 'https://randomuser.me/api/portraits/women/12.jpg',
    text: 'I love the rotating quotes and the clean dashboard. The review system is very fair.',
    rating: 5
  },
  {
    name: 'Liam O.',
    country: '🇬🇧',
    school: 'MIT',
    gender: 'male',
    img: 'https://randomuser.me/api/portraits/men/41.jpg',
    text: 'The upload and analysis process is seamless. Highly recommend for international students.',
    rating: 5
  },
  {
    name: 'Wei C.',
    country: '🇨🇳',
    school: 'Oxford',
    gender: 'male',
    img: 'https://randomuser.me/api/portraits/men/77.jpg',
    text: 'ResumeZen gave me the confidence to apply for top internships. The feedback is detailed and clear.',
    rating: 5
  },
  {
    name: 'Fatima A.',
    country: '🇸🇦',
    school: 'MIT',
    gender: 'female',
    img: 'https://randomuser.me/api/portraits/women/25.jpg',
    text: 'Affordable, effective, and easy to use. My resume never looked better!',
    rating: 4
  },
  {
    name: 'Lucas P.',
    country: '🇫🇷',
    school: 'Oxford',
    gender: 'male',
    img: 'https://randomuser.me/api/portraits/men/12.jpg',
    text: 'The AI suggestions are spot on. I landed an interview at my dream company!',
    rating: 5
  }
];

const Star = ({ filled }) => (
  <svg
    className={`h-4 w-4 inline-block ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
    fill={filled ? 'currentColor' : 'none'}
    viewBox="0 0 20 20"
    stroke="currentColor"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.967c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.54-1.118l1.287-3.967a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
  </svg>
);

const DashboardCustomerReviews = () => {
  const [startIdx, setStartIdx] = useState(0);
  const visibleCount = 4;

  useEffect(() => {
    const interval = setInterval(() => {
      setStartIdx((prev) => (prev + visibleCount) % reviews.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const visibleReviews = [];
  for (let i = 0; i < visibleCount; i++) {
    visibleReviews.push(reviews[(startIdx + i) % reviews.length]);
  }

  return (
    <div className="my-10 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center tracking-tight">What international students say</h2>
      <div className="grid gap-8 md:grid-cols-2">
        {visibleReviews.map((review, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl p-6 shadow-lg flex flex-col items-center transition-transform hover:scale-105 duration-300"
          >
            <div className="flex items-center mb-3">
              <img
                src={review.img}
                alt={review.name}
                className="w-12 h-12 rounded-full border-2 border-primary shadow-sm object-cover mr-3"
              />
              <span className="text-3xl mr-2">{review.country}</span>
              <span className="font-semibold text-primary text-lg mr-2">{review.name}</span>
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600 font-medium border border-gray-200">{review.school}</span>
            </div>
            <p className="text-gray-700 italic text-center mb-3">"{review.text}"</p>
            <div className="flex items-center">
              {[1,2,3,4,5].map(i => <Star key={i} filled={i <= review.rating} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardCustomerReviews; 