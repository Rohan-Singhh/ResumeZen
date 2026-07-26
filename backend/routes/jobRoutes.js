const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../middleware/authMiddleware');
const { matchJobsWithAI } = require('../services/aiAnalysisService');

/**
 * Job API sources (no API key required)
 */
const JOB_SOURCES = {
  REMOTIVE: 'https://remotive.com/api/remote-jobs',
  ARBEITNOW: 'https://www.arbeitnow.com/api/job-board-api',
  THE_MUSE: 'https://www.themuse.com/api/public/jobs'
};

/**
 * Fetch jobs from Remotive (remote-only jobs)
 */
const fetchRemotiveJobs = async (searchQuery = '') => {
  try {
    const url = searchQuery 
      ? `${JOB_SOURCES.REMOTIVE}?search=${encodeURIComponent(searchQuery)}`
      : JOB_SOURCES.REMOTIVE;
    
    const response = await axios.get(url, { timeout: 10000 });
    
    if (response.data && response.data.jobs) {
      return response.data.jobs.slice(0, 30).map(job => ({
        id: `remotive-${job.id}`,
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location || 'Remote',
        remote: true,
        url: job.url,
        tags: job.tags || [],
        jobTypes: [job.job_type],
        createdAt: job.publication_date,
        salary: job.salary || null,
        snippet: job.description ? job.description.replace(/<[^>]+>/g, '').substring(0, 150) + '...' : '',
        source: 'Remotive'
      }));
    }
    return [];
  } catch (error) {
    console.error('Remotive fetch error:', error.message);
    return [];
  }
};

/**
 * Fetch jobs from Arbeitnow (EU + worldwide remote tech jobs)
 */
const fetchArbeitnowJobs = async () => {
  try {
    const response = await axios.get(JOB_SOURCES.ARBEITNOW, { timeout: 10000 });
    
    if (response.data && response.data.data) {
      return response.data.data.slice(0, 30).map(job => ({
        id: `arbeitnow-${job.slug}`,
        title: job.title,
        company: job.company_name,
        location: job.location,
        remote: job.remote,
        url: job.url,
        tags: job.tags || [],
        jobTypes: job.job_types || [],
        createdAt: job.created_at,
        snippet: job.description ? job.description.replace(/<[^>]+>/g, '').substring(0, 150) + '...' : '',
        source: 'Arbeitnow'
      }));
    }
    return [];
  } catch (error) {
    console.error('Arbeitnow fetch error:', error.message);
    return [];
  }
};

/**
 * Fetch jobs from The Muse (500 req/hour, free)
 */
const fetchTheMuseJobs = async (category = 'Engineering') => {
  try {
    const response = await axios.get(`${JOB_SOURCES.THE_MUSE}?category=${category}&page=0`, { timeout: 10000 });
    
    if (response.data && response.data.results) {
      return response.data.results.slice(0, 30).map(job => ({
        id: `themuse-${job.id}`,
        title: job.name,
        company: job.company?.name || 'Unknown Company',
        location: job.locations?.map(loc => loc.name).join(', ') || 'Not specified',
        remote: job.locations?.some(loc => loc.name.toLowerCase().includes('remote')) || false,
        url: job.refs?.landing_page || '',
        tags: job.categories?.map(cat => cat.name) || [],
        jobTypes: [job.type || 'Full-time'],
        createdAt: job.publication_date,
        snippet: job.contents ? job.contents.substring(0, 150) + '...' : '',
        source: 'The Muse'
      }));
    }
    return [];
  } catch (error) {
    console.error('The Muse fetch error:', error.message);
    return [];
  }
};

/**
 * @route   GET /api/jobs
 * @desc    Fetch jobs from multiple free APIs (Remotive, Arbeitnow, The Muse)
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const searchQuery = req.query.search || '';
    const category = req.query.category || 'Engineering';
    
    // Fetch from all 3 sources in parallel
    const [remotiveJobs, arbeitnowJobs, museJobs] = await Promise.all([
      fetchRemotiveJobs(searchQuery),
      fetchArbeitnowJobs(),
      fetchTheMuseJobs(category)
    ]);

    // Combine and deduplicate jobs
    const allJobs = [...remotiveJobs, ...arbeitnowJobs, ...museJobs];
    
    // Sort by creation date (newest first)
    const sortedJobs = allJobs.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });

    return res.status(200).json({
      success: true,
      count: sortedJobs.length,
      sources: {
        remotive: remotiveJobs.length,
        arbeitnow: arbeitnowJobs.length,
        themuse: museJobs.length
      },
      jobs: sortedJobs
    });

  } catch (error) {
    console.error('Job fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs'
    });
  }
});

/**
 * @route   POST /api/jobs/match
 * @desc    Fetch jobs from multiple APIs and rank them using AI against user profile
 * @access  Private
 */
router.post('/match', authMiddleware, async (req, res) => {
  try {
    const { userProfile } = req.body;

    if (!userProfile) {
      return res.status(400).json({ success: false, message: 'User profile is required' });
    }

    // Fetch from all sources in parallel
    const [remotiveJobs, arbeitnowJobs, museJobs] = await Promise.all([
      fetchRemotiveJobs('developer'),
      fetchArbeitnowJobs(),
      fetchTheMuseJobs('Engineering')
    ]);

    // Combine jobs (limit to 60 for AI processing)
    const allJobs = [...remotiveJobs, ...arbeitnowJobs, ...museJobs].slice(0, 60);

    if (allJobs.length === 0) {
      return res.status(404).json({ success: false, message: 'No jobs found from providers' });
    }

    // Prepare jobs for AI (simpler format to save tokens)
    const jobsList = allJobs.map(job => ({
      title: job.title,
      company: job.company,
      location: job.location,
      remote: job.remote,
      url: job.url,
      tags: job.tags,
      snippet: job.snippet
    }));

    // Call AI to match jobs
    const aiMatchResult = await matchJobsWithAI(userProfile, jobsList);

    if (aiMatchResult.success) {
      return res.status(200).json({
        success: true,
        jobs: aiMatchResult.data.matches,
        sources: {
          remotive: remotiveJobs.length,
          arbeitnow: arbeitnowJobs.length,
          themuse: museJobs.length,
          total: allJobs.length
        }
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'AI matching failed',
        error: aiMatchResult.error
      });
    }

  } catch (error) {
    console.error('Job match error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process job matches'
    });
  }
});

module.exports = router;
