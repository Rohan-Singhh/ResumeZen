const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../middleware/authMiddleware');
const { matchJobsWithAI } = require('../services/aiAnalysisService');

/**
 * @route   GET /api/jobs
 * @desc    Fetch recent tech jobs from open-source API (Arbeitnow)
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const response = await axios.get('https://www.arbeitnow.com/api/job-board-api');

    // Check if we received data
    if (response.data && response.data.data) {
      // Send the first 50 jobs to keep the payload reasonable
      const jobs = response.data.data.slice(0, 50).map(job => ({
        id: job.slug,
        title: job.title,
        company: job.company_name,
        location: job.location,
        remote: job.remote,
        url: job.url,
        tags: job.tags || [],
        jobTypes: job.job_types || [],
        createdAt: job.created_at,
        // Shorten the description for the card view
        snippet: job.description ? job.description.replace(/<[^>]+>/g, '').substring(0, 150) + '...' : ''
      }));

      return res.status(200).json({
        success: true,
        count: jobs.length,
        jobs: jobs
      });
    }

    return res.status(404).json({
      success: false,
      message: 'No jobs found from the provider'
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
 * @desc    Fetch recent tech jobs and rank them using AI against user profile
 * @access  Private
 */
router.post('/match', authMiddleware, async (req, res) => {
  try {
    const { userProfile } = req.body;

    if (!userProfile) {
      return res.status(400).json({ success: false, message: 'User profile is required' });
    }

    // Fetch jobs first
    const response = await axios.get('https://www.arbeitnow.com/api/job-board-api');

    if (!response.data || !response.data.data) {
      return res.status(404).json({ success: false, message: 'No jobs found from provider' });
    }

    // Send the first 40 jobs to AI to stay within token limits
    const jobsList = response.data.data.slice(0, 40).map(job => ({
      title: job.title,
      company: job.company_name,
      location: job.location,
      remote: job.remote,
      url: job.url,
      tags: job.tags || [],
      snippet: job.description ? job.description.replace(/<[^>]+>/g, '').substring(0, 200) : ''
    }));

    // Call AI to match jobs
    const aiMatchResult = await matchJobsWithAI(userProfile, jobsList);

    if (aiMatchResult.success) {
      return res.status(200).json({
        success: true,
        jobs: aiMatchResult.data.matches
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
