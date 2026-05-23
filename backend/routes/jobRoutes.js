const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../middleware/authMiddleware');

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

module.exports = router;
