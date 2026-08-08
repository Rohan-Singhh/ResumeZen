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

const JOB_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Process-local cache for upstream job responses.
 *
 * Job boards change on the order of hours, but every dashboard visit was
 * re-fetching all three providers with a 10s timeout each. Keyed by source +
 * query so a search does not poison the default listing.
 *
 * NOTE: this lives in process memory. It is correct for the current
 * single-instance Render deployment; moving to multiple instances or a
 * serverless host means each instance keeps its own copy (still correct, just
 * a lower hit rate). Swap for Redis if that becomes a problem.
 */
const jobCache = new Map();

/**
 * Read through the cache to a fetcher.
 * @param {string} key - Cache key
 * @param {Function} fetcher - Async function producing the value
 * @returns {Promise<Array>} - Cached or freshly fetched jobs
 */
const cached = async (key, fetcher) => {
  const hit = jobCache.get(key);
  if (hit && (Date.now() - hit.at) < JOB_CACHE_TTL_MS) {
    return hit.value;
  }

  const value = await fetcher();

  // Don't cache empty results — those usually mean the upstream call failed,
  // and caching them would extend a transient outage to a full TTL.
  if (value.length > 0) {
    jobCache.set(key, { at: Date.now(), value });
  }
  return value;
};

/**
 * Fetch jobs from Remotive (remote-only jobs)
 */
const fetchRemotiveJobs = (searchQuery = '') => cached(`remotive:${searchQuery}`, async () => {
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
});

/**
 * Fetch jobs from Arbeitnow (EU + worldwide remote tech jobs)
 */
const fetchArbeitnowJobs = () => cached('arbeitnow', async () => {
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
});

/**
 * Fetch jobs from The Muse (500 req/hour, free)
 */
const fetchTheMuseJobs = (category = 'Engineering') => cached(`themuse:${category}`, async () => {
  try {
    const response = await axios.get(`${JOB_SOURCES.THE_MUSE}?category=${encodeURIComponent(category)}&page=0`, { timeout: 10000 });
    
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
});

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

    // The client sends a whole analysis record. Only the career-relevant parts
    // are useful for ranking, and the rest is pure prompt cost.
    const profileForAI = {
      summary: userProfile.summary,
      skills: userProfile.skills,
      workExperience: (userProfile.workExperience || []).map(w => ({
        company: w.company,
        position: w.position,
        duration: w.duration
      })),
      education: userProfile.education,
      certifications: userProfile.certifications,
      location: userProfile.contactInformation?.location
    };

    // Fetch from all sources in parallel
    const [remotiveJobs, arbeitnowJobs, museJobs] = await Promise.all([
      fetchRemotiveJobs('developer'),
      fetchArbeitnowJobs(),
      fetchTheMuseJobs('Engineering')
    ]);

    // Combine jobs (limit to 40 for AI processing)
    const allJobs = [...remotiveJobs, ...arbeitnowJobs, ...museJobs].slice(0, 40);

    if (allJobs.length === 0) {
      return res.status(404).json({ success: false, message: 'No jobs found from providers' });
    }

    // Trim aggressively before sending to the model — the full snippet and tag
    // list across 40+ jobs dominated the prompt without improving ranking.
    const jobsList = allJobs.map(job => ({
      title: job.title,
      company: job.company,
      location: job.location,
      remote: job.remote,
      url: job.url,
      tags: (job.tags || []).slice(0, 5),
      snippet: (job.snippet || '').slice(0, 200)
    }));

    // Call AI to match jobs
    const aiMatchResult = await matchJobsWithAI(profileForAI, jobsList);

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
