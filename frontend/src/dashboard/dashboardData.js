const dummyData = {
  user: {
    username: "Rohan Singh",
    email: "rohan@example.com",
    phone: "+91-9876543210",
    purchased_plan: "3 Resume Checks Left",
    initials: "RS",
    remaining_checks: 3,
    plan_type: "regular"
  },
  resumes: [
    {
      id: 1,
      file_name: "Resume_SDE1.pdf",
      upload_date: "2025-04-25",
      ats_score: "82%",
      suggestions: "Add more keywords like 'JavaScript', 'Leadership'.",
      improvement_areas: {
        keywords: 82,
        formatting: 88,
        content: 75,
        relevance: 85
      },
      detailed_feedback: {
        strengths: [
          "Excellent technical skills section",
          "Clear project descriptions",
          "Good use of action verbs",
          "Professional formatting"
        ],
        weaknesses: [
          "Could use more leadership examples",
          "Some technical keywords missing",
          "Achievement metrics could be clearer",
          "Summary could be more impactful"
        ],
        improvement_tips: [
          "Add specific JavaScript framework experience",
          "Include team size in project descriptions",
          "Quantify performance improvements",
          "Highlight leadership roles in projects"
        ]
      }
    },
    {
      id: 2,
      file_name: "Resume_Intern.pdf",
      upload_date: "2025-04-22",
      ats_score: "75%",
      suggestions: "Highlight your projects better.",
      improvement_areas: {
        keywords: 70,
        formatting: 78,
        content: 75,
        relevance: 77
      },
      detailed_feedback: {
        strengths: [
          "Good academic achievements",
          "Relevant internship experience",
          "Clear technical skills list",
          "Well-organized sections"
        ],
        weaknesses: [
          "Limited professional experience",
          "Project impacts not quantified",
          "Technical depth could be improved",
          "Some sections too brief"
        ],
        improvement_tips: [
          "Add metrics to project outcomes",
          "Expand on technical challenges solved",
          "Include relevant coursework",
          "Detail internship achievements"
        ]
      }
    }
  ],
  vlogs: [
    {
      id: 1,
      title: "Mastering Your ATS Game 🎯",
      thumbnail: "https://img.youtube.com/vi/PPXAQ8W13cY/maxresdefault.jpg",
      video_link: "https://youtube.com",
      video_embed_url: "https://www.youtube.com/embed/PPXAQ8W13cY",
      short_description: "Want to boost your ATS score instantly? This 3-minute tip will help you optimize your resume to get noticed by recruiters!",
      full_description: "In this video, we dive into simple but powerful ways you can optimize your resume to pass through ATS systems. Learn how to focus on the right keywords, formatting, and structure to make sure your resume gets to the hiring manager's desk.",
      views: "15.2K",
      upload_date: "2024-03-15",
      key_points: [
        "Understanding ATS algorithms",
        "Keyword optimization techniques",
        "Format-friendly templates",
        "Common ATS mistakes to avoid"
      ]
    },
    {
      id: 2,
      title: "Resume Design Secrets 2024 ✨",
      thumbnail: "https://img.youtube.com/vi/Q_jbVpzCvBU/maxresdefault.jpg",
      video_link: "https://youtube.com",
      video_embed_url: "https://www.youtube.com/embed/Q_jbVpzCvBU",
      short_description: "Learn the art of modern resume design that catches attention while staying professional and ATS-friendly.",
      full_description: "Discover the perfect balance between creativity and professionalism in resume design. This comprehensive guide shows you how to make your resume visually appealing while maintaining ATS compatibility.",
      views: "12.8K",
      upload_date: "2024-03-10",
      key_points: [
        "Modern resume layouts",
        "Professional font combinations",
        "Strategic use of white space",
        "Color psychology in resumes"
      ]
    },
    {
      id: 3,
      title: "LinkedIn Profile Optimization 💼",
      thumbnail: "https://img.youtube.com/vi/aD7fP-2u3iY/maxresdefault.jpg",
      video_link: "https://youtube.com",
      video_embed_url: "https://www.youtube.com/embed/aD7fP-2u3iY",
      short_description: "Sync your resume with your LinkedIn profile to create a powerful personal brand that recruiters can't ignore.",
      full_description: "Learn how to create a cohesive personal brand across your resume and LinkedIn profile. This video guides you through optimizing your LinkedIn presence to complement your resume and attract top opportunities.",
      views: "9.6K",
      upload_date: "2024-03-05",
      key_points: [
        "Profile optimization tips",
        "Keyword strategy for visibility",
        "Content synchronization",
        "Networking best practices"
      ]
    },
    {
      id: 4,
      title: "Interview Success Stories 🌟",
      thumbnail: "https://img.youtube.com/vi/TqgCj-Gqkqk/maxresdefault.jpg",
      video_link: "https://youtube.com",
      video_embed_url: "https://www.youtube.com/embed/TqgCj-Gqkqk",
      short_description: "Real stories and strategies from candidates who landed their dream jobs using our resume tips.",
      full_description: "Get inspired by success stories from real job seekers who transformed their job search journey. Learn the exact strategies they used to optimize their resumes and ace their interviews.",
      views: "18.3K",
      upload_date: "2024-02-28",
      key_points: [
        "Real success stories",
        "Practical implementation tips",
        "Common challenges overcome",
        "Interview preparation insights"
      ]
    },
    {
      id: 5,
      title: "Resume Red Flags to Avoid ⚠️",
      thumbnail: "https://img.youtube.com/vi/omoHx8hDl-g/maxresdefault.jpg",
      video_link: "https://youtube.com",
      video_embed_url: "https://www.youtube.com/embed/omoHx8hDl-g",
      short_description: "Don't let these common resume mistakes cost you your dream job! Learn what to avoid and how to fix them.",
      full_description: "Identify and eliminate critical resume mistakes that could be holding you back. This comprehensive guide helps you spot and fix common resume red flags that recruiters instantly notice.",
      views: "21.5K",
      upload_date: "2024-02-20",
      key_points: [
        "Common formatting mistakes",
        "Content red flags",
        "Professional alternatives",
        "Before-after examples"
      ]
    }
  ],
  plans: [
    { 
      price: "₹19", 
      checks: 1,
      title: "Basic Check"
    },
    { 
      price: "₹70", 
      checks: 5,
      title: "Standard Pack" 
    },
    { 
      price: "₹500",
      title: "Unlimited Pack",
      period: "3 months",
      description: "Unlimited resume checks with premium features"
    }
  ]
};

export default dummyData; 