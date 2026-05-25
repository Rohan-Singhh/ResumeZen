/**
 * AI Analysis Service
 * 
 * Uses OpenRouter to analyze resume text and provide insights
 */

const axios = require('axios');

// OpenRouter API key
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
  console.error('OpenRouter API key is not set in environment variables');
}

// Default model to use
const DEFAULT_MODEL = 'poolside/laguna-xs.2:free';

// Available free models with large context windows
const FREE_MODELS = [
  'poolside/laguna-xs.2:free',
  'deepseek/deepseek-v4-flash:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-4-31b-it:free',
  'qwen/qwen3-coder:free',
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free'
];

/**
 * Get the appropriate system prompt for the AI model
 * @param {string} model - Model identifier
 * @returns {string} - System prompt
 */
const getSystemPrompt = (model) => {
  // Brutal FAANG recruiter system prompt
  const defaultSystemPrompt =
    `You are an elite-level ATS resume auditor, hiring manager, and technical recruiter with zero tolerance for weak resumes. Your job is to brutally and honestly evaluate the resume exactly like a competitive recruiter screening candidates for top-tier companies (FAANG).

Do NOT be polite, generic, motivational, or diplomatic. Be direct, harsh when necessary, and extremely specific. Point out weak wording, inflated claims, missing metrics, poor structure, irrelevant skills, weak projects, shallow experience, keyword gaps, and anything that would cause rejection in a real hiring pipeline.

Analyze the resume from these perspectives:
- ATS optimization & formatting
- Recruiter screening quality
- Technical depth & relevance
- Impact and ownership (metrics)
- Clarity and readability
- Hiring risk signals`;

  // Llama-specific system prompt
  if (model && model.includes('llama')) {
    return `${defaultSystemPrompt}
    
    Return your analysis in valid JSON format without any markdown formatting, explanations, or text outside the JSON structure.
    The JSON should be directly parseable by JavaScript's JSON.parse() function.`;
  }

  // Deepseek-specific system prompt
  if (model && model.includes('deepseek')) {
    return `${defaultSystemPrompt}
    
    Return only valid, parseable JSON without explanations or preamble. Do not include markdown formatting or text outside the JSON object.`;
  }

  // Mistral-specific system prompt
  if (model && model.includes('mistral')) {
    return `${defaultSystemPrompt}
    
    Return only the JSON object with no other text or explanations. The JSON should be correctly formatted and directly parseable.`;
  }

  // Claude-specific system prompt
  if (model && model.includes('claude')) {
    return `${defaultSystemPrompt}
    
    Return your analysis in valid JSON format without any markdown formatting, explanations, or text outside the JSON structure.
    The JSON should be directly parseable by JavaScript's JSON.parse() function.`;
  }

  // GPT-specific system prompt
  if (model && model.includes('gpt')) {
    return `${defaultSystemPrompt}
    
    Respond ONLY with valid, parseable JSON. Do not include any explanations, markdown formatting, or text outside the JSON structure.`;
  }

  // Gemini-specific system prompt  
  if (model && model.includes('gemini')) {
    return `${defaultSystemPrompt}
    
    Respond with valid, parseable JSON without any explanations or additional text. Do not use markdown code blocks.`;
  }

  // Default fallback
  return defaultSystemPrompt;
};

/**
 * Get the appropriate user prompt for resume analysis
 * @param {string} resumeText - The OCR-extracted resume text
 * @param {Object} options - Custom options for analysis
 * @returns {string} - Formatted prompt
 */
const getAnalysisPrompt = (resumeText, options = {}) => {
  // Use custom prompt if provided
  if (options.prompt) {
    return options.prompt.replace('${resumeText}', resumeText);
  }

  return `Format the following resume text into a JSON object with this exact structure. Do not deviate.

{
  "contactInformation": {
    "name": "Full Name",
    "email": "Email",
    "phone": "Phone",
    "location": "Location"
  },
  "overallScore": 0,
  "hiringRiskLevel": "Low|Medium|High",
  "recruiterScreening": {
    "verdict": "Pass|Borderline|Reject",
    "brutalFeedback": ["1-3 harsh, direct truths about why this resume would be rejected"],
    "redFlags": ["1-3 major red flags or critical issues"]
  },
  "atsOptimization": {
    "score": 0,
    "missingKeywords": ["Crucial technical keywords missing based on the implied role"],
    "formattingIssues": ["Formatting mistakes destroying ATS parseability"]
  },
  "technicalDepth": {
    "score": 0,
    "stackRelevance": "Brief harsh assessment of their tech stack",
    "overusedBuzzwords": ["Buzzwords they dumped without proof"],
    "skillGaps": ["Critical skills missing for their level"]
  },
  "impactAndOwnership": {
    "score": 0,
    "weakVerbs": ["Weak action verbs they used (e.g. 'Helped', 'Worked on')"],
    "missingMetrics": ["Areas where they claimed impact but provided zero numbers"],
    "recommendedMetricInjections": ["Exact examples of how they should rewrite a bullet to include metrics (e.g. 'Instead of X, say Y')"]
  }
}

Scoring and Evaluation Rules:
- overallScore (0-100): 90-100 = Elite, 75-89 = Strong, 60-74 = Average/Risky, <60 = Instant Reject.
- Penalize vague statements without metrics heavily.
- Penalize resumes overloaded with buzzwords.
- Penalize shallow full-stack claims without depth.
- Reward quantified achievements and ownership of scale/production.
- Tone MUST be brutally honest, direct, and recruiter-like. NO sugarcoating.

Return ONLY valid JSON with no other text.

Resume text:
${resumeText}`;
};

/**
 * Generate fallback analysis when API fails
 * @param {string} resumeText - Extracted text from resume
 * @returns {Object} - Basic fallback analysis
 */
const generateFallbackAnalysis = (resumeText) => {
  // Extract basic info from text using regex
  const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = resumeText.match(/(\+\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}/);
  const nameLines = resumeText.split('\n').slice(0, 5); // Usually name is at the top

  // Try to find a name in first few lines (very basic approach)
  let name = "Unknown";
  for (const line of nameLines) {
    const cleanLine = line.trim();
    if (cleanLine && cleanLine.length > 2 && cleanLine.length < 40 && !cleanLine.includes('@') && !cleanLine.match(/^\d/)) {
      name = cleanLine;
      break;
    }
  }

  return {
    contactInformation: {
      name: name,
      email: emailMatch ? emailMatch[0] : null,
      phone: phoneMatch ? phoneMatch[0] : null,
      location: null
    },
    overallScore: 50,
    hiringRiskLevel: "High",
    recruiterScreening: {
      verdict: "Borderline",
      brutalFeedback: ["Could not generate detailed AI analysis. Please try again later."],
      redFlags: ["Analysis failed"]
    },
    atsOptimization: {
      score: 50,
      missingKeywords: ["Could not determine"],
      formattingIssues: ["None detected during fallback"]
    },
    technicalDepth: {
      score: 50,
      stackRelevance: "Unknown due to API failure",
      overusedBuzzwords: [],
      skillGaps: []
    },
    impactAndOwnership: {
      score: 50,
      weakVerbs: [],
      missingMetrics: [],
      recommendedMetricInjections: []
    }
  };
};

/**
 * Analyze resume text using AI
 * @param {string} resumeText - Extracted text from resume
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} - AI analysis results
 */
const analyzeResume = async (resumeText, options = {}) => {
  console.log('Analyzing resume text with OpenRouter AI...');

  // Start with the requested model, or the default
  const initialModel = options.model || DEFAULT_MODEL;
  
  // Create a list of models to try. Put the initial model first, then add the rest of FREE_MODELS
  const modelsToTry = [initialModel, ...FREE_MODELS.filter(m => m !== initialModel)];

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      console.log(`Trying AI model: ${model}...`);

      // Format the prompt based on provided options
      const prompt = getAnalysisPrompt(resumeText, { ...options, model });

      // Get the appropriate system prompt
      const systemPrompt = options.systemPrompt || getSystemPrompt(model);

      // Model-specific settings
      const settings = {
        temperature: 0.5, // Lower temperature for more consistent responses
        max_tokens: 4000
      };

      // Adjust settings for specific models
      if (model.includes('llama')) {
        settings.temperature = 0.3; // Lower temperature for Llama
      } else if (model.includes('mistral')) {
        settings.temperature = 0.4; // Slightly higher for Mistral
      } else if (model.includes('deepseek')) {
        settings.temperature = 0.2; // Lowest for Deepseek for most consistent JSON
      }

      // Make the request to OpenRouter
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: model,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: settings.temperature,
          max_tokens: settings.max_tokens
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://resumezen.com',
            'X-Title': 'ResumeZen AI Analysis'
          }
        }
      );

      // Enhanced validation of the response format with detailed logging
      if (!response || !response.data) {
        throw new Error('Empty response from OpenRouter API');
      }

      if (!response.data.choices) {
        throw new Error('Invalid response format - missing choices array');
      }

      if (!Array.isArray(response.data.choices) || response.data.choices.length === 0) {
        throw new Error('Empty choices array in API response');
      }

      const choice = response.data.choices[0];
      if (!choice || !choice.message) {
        throw new Error('Invalid choice format - missing message');
      }

      if (!choice.message.content) {
        throw new Error('Missing content in API response message');
      }

      // Extract the AI response
      const aiResponse = choice.message.content;

      try {
        // Try to parse the response as JSON
        // First, remove any markdown code block delimiters if present
        const cleanedResponse = aiResponse
          .replace(/```json\s*/g, '')
          .replace(/```\s*$/g, '')
          .replace(/```javascript\s*/g, '')
          .replace(/```js\s*/g, '')
          .trim();

        const jsonResponse = JSON.parse(cleanedResponse);
        console.log(`Success with model ${model}!`);
        return {
          success: true,
          data: {
            structured: jsonResponse,
            raw: aiResponse,
            model: model
          }
        };
      } catch (parseError) {
        console.log(`AI response from ${model} is not valid JSON, returning raw text`);
        console.error('JSON parse error:', parseError);

        return {
          success: true,
          data: {
            structured: null,
            raw: aiResponse,
            model: model,
            parseError: parseError.message,
            usedFallback: true
          }
        };
      }
    } catch (error) {
      console.error(`\n[ERROR] AI analysis failed with model ${model}:`, error.message);
      if (error.response) {
        console.error(`Status: ${error.response.status} ${error.response.statusText}`);
      }
      lastError = error;
      console.log('=> Falling back to the next available model in the queue...\n');
      // Continue to the next model in the loop
    }
  }

  console.error('CRITICAL: All AI models failed. Generating final local fallback response.');
  return generateFallbackResponse(resumeText, initialModel, lastError ? lastError.message : 'All models failed');
};

/**
 * Generate a fallback response when the API call fails
 * @param {string} resumeText - The resume text to analyze
 * @param {string} model - The model that was used (or attempted)
 * @param {string} errorReason - The reason for failure
 * @returns {Object} - A fallback response object
 */
const generateFallbackResponse = (resumeText, model, errorReason) => {
  // Generate a fallback analysis when API call fails completely
  const fallbackAnalysis = generateFallbackAnalysis(resumeText);

  return {
    success: true, // Return success: true to prevent cascading errors
    data: {
      structured: fallbackAnalysis,
      raw: JSON.stringify(fallbackAnalysis),
      model: model,
      error: errorReason || 'API error',
      usedFallback: true
    },
    apiError: {
      message: errorReason || 'Unknown error',
      details: 'Fallback analysis generated due to API failure'
    }
  };
};

/**
 * Match user profile with jobs using OpenRouter AI
 * @param {Object} userProfile - User's skills, experience, and preferences
 * @param {Array} jobsList - List of jobs fetched from the API
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Ranked and structured jobs list
 */
const matchJobsWithAI = async (userProfile, jobsList, options = {}) => {
  if (!OPENROUTER_API_KEY) {
    return {
      success: false,
      error: 'API key is missing'
    };
  }

  const initialModel = options.model || DEFAULT_MODEL;
  
  // Prepare models queue (fallback mechanism)
  let modelsToTry = [initialModel];
  if (options.useFallbacks !== false) {
    const fallbacks = FREE_MODELS.filter(m => m !== initialModel);
    modelsToTry = [...modelsToTry, ...fallbacks];
  }

  const systemPrompt = `You are an AI Job Assistant.
Your task is to help users find the most relevant jobs based on their profile, skills, experience, preferences, and resume data.

Responsibilities:
1. Understand the user's skills, experience, tech stack, and career goals.
2. Search available job listings from the provided list.
3. Rank jobs based on:
   - skill match
   - experience match
   - location preference
   - salary preference
   - remote/on-site preference
   - relevance score
4. Reject irrelevant or low-quality jobs.
5. Explain clearly why a job is recommended.
6. Suggest missing skills if needed.
7. Provide concise and structured responses.

Rules:
- Prioritize high-quality and recent jobs.
- Prefer jobs strongly aligned with the user's stack.
- Avoid duplicate jobs.
- Keep explanations short but useful.
- Rank jobs intelligently instead of listing randomly.

Return ONLY a valid, parseable JSON array of the top 5 to 10 matching jobs. Do not include markdown formatting or extra text.
Format of each job object in the array:
{
  "title": "Job Title",
  "company": "Company",
  "location": "Location",
  "salary": "Salary (if available, else 'Not specified')",
  "matchScore": 85,
  "reason": "Why it matches",
  "missingSkills": ["Missing Skill 1"],
  "url": "Apply Link"
}`;

  const userPrompt = `
User Profile:
${JSON.stringify(userProfile, null, 2)}

Available Jobs:
${JSON.stringify(jobsList, null, 2)}

Analyze the Available Jobs against the User Profile and return the JSON array of top matches.`;

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      console.log(`\nAnalyzing job matches with OpenRouter AI...`);
      console.log(`Trying AI model: ${model}...`);

      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.2,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://resumezen.com',
            'X-Title': 'ResumeZen'
          },
          timeout: 45000 
        }
      );

      const choice = response.data.choices[0];
      const aiResponse = choice.message.content;

      try {
        const cleanedResponse = aiResponse
          .replace(/```json\s*/g, '')
          .replace(/```\s*$/g, '')
          .replace(/```javascript\s*/g, '')
          .replace(/```js\s*/g, '')
          .trim();

        const jsonResponse = JSON.parse(cleanedResponse);
        console.log(`Success with model ${model}!`);
        return {
          success: true,
          data: {
            matches: jsonResponse,
            model: model
          }
        };
      } catch (parseError) {
        console.log(`AI response from ${model} is not valid JSON.`);
        return {
          success: false,
          error: 'AI did not return valid JSON'
        };
      }
    } catch (error) {
      console.error(`\n[ERROR] AI analysis failed with model ${model}:`, error.message);
      lastError = error;
      console.log('=> Falling back to the next available model in the queue...\n');
    }
  }

  return {
    success: false,
    error: lastError ? lastError.message : 'All models failed'
  };
};

module.exports = {
  analyzeResume,
  matchJobsWithAI,
  FREE_MODELS
}; 