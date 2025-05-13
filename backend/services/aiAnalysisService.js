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

// Default model to use (changed from Claude to Llama)
const DEFAULT_MODEL = 'meta-llama/llama-4-maverick:free';

// Available free models with large context windows
const FREE_MODELS = [
  'meta-llama/llama-4-maverick:free',
  'deepseek/deepseek-v3-base:free',
  'mistralai/mistral-small-3.1-24b-instruct:free'
];

/**
 * Get the appropriate system prompt for the AI model
 * @param {string} model - Model identifier
 * @returns {string} - System prompt
 */
const getSystemPrompt = (model) => {
  // Default system prompt that works well with all models
  const defaultSystemPrompt = 
    `You are an expert resume analyst. Your task is to extract key information from resumes and provide 
    professional insights and feedback. Analyze the resume text thoroughly and return a structured JSON 
    response with extracted information and analysis. Focus on accuracy of information extraction and 
    providing constructive, actionable feedback.`;
  
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
  
  // Simplified prompt format for models that have difficulty with complex instructions
  if (options.model && (options.model.includes('deepseek') || options.model.includes('mistral'))) {
    return `
      Format the following resume text into a JSON object with these sections:
      - contactInformation (name, email, phone, location)
      - skills (technical and soft)
      - workExperience (list of jobs with company, position, duration, responsibilities)
      - education (list of degrees with institution, degree, field, graduationDate)
      - certifications (list)
      - summary (brief professional summary)
      - analysis (strengths, areasForImprovement, keywords, and atsScore from 0-100)
      
      Return only valid JSON with no other text.
      
      Resume text:
      ${resumeText}
    `;
  }
  
  // Default structured analysis prompt
  return `
    Please analyze this resume and extract the following information in a structured JSON format:
    
    {
      "contactInformation": {
        "name": "Full Name",
        "email": "email@example.com",
        "phone": "Phone number",
        "location": "City, State/Country",
        "linkedin": "LinkedIn URL (if present)"
      },
      "skills": {
        "technical": ["List of technical skills"],
        "soft": ["List of soft skills"]
      },
      "workExperience": [
        {
          "company": "Company name",
          "position": "Position title",
          "duration": "Employment period",
          "responsibilities": ["Key responsibilities"],
          "achievements": ["Notable achievements"]
        }
      ],
      "education": [
        {
          "institution": "Institution name",
          "degree": "Degree obtained",
          "field": "Field of study",
          "graduationDate": "Graduation date"
        }
      ],
      "certifications": ["List of certifications"],
      "summary": "Brief professional summary extracted from the resume",
      "analysis": {
        "strengths": ["Resume strengths", "2-5 items"],
        "areasForImprovement": ["Suggested improvements", "2-5 items"],
        "keywords": ["Keywords likely to be important for ATS systems", "5-10 items"],
        "atsScore": 85 // ATS score as a percentage (0-100)
      }
    }
    
    IMPORTANT GUIDELINES:
    1. Use only information present in the resume; don't invent details
    2. If a section has no information, use an empty array or null value
    3. For the analysis section, be specific and constructive 
    4. For the atsScore, provide a number from 0 to 100 representing the resume's ATS score as a percentage
    5. Make sure to return properly formatted JSON without any additional text
    
    Here is the resume text extracted via OCR:
    
    ${resumeText}
  `;
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
    skills: {
      technical: [],
      soft: []
    },
    summary: "Could not generate detailed analysis. Please try again later.",
    analysis: {
      strengths: ["Resume was successfully parsed"],
      areasForImprovement: ["Consider trying analysis again later"],
      keywords: [],
      atsScore: 85
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
  try {
    console.log('Analyzing resume text with OpenRouter AI...');
    
    // Model to use (prioritize free models)
    const model = options.model || DEFAULT_MODEL;
    console.log('Using model:', model);
    
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
      console.error('Empty response from OpenRouter API');
      return generateFallbackResponse(resumeText, model, 'Empty API response');
    }
    
    if (!response.data.choices) {
      console.error('Invalid response format - missing choices array:', response.data);
      return generateFallbackResponse(resumeText, model, 'Missing choices in API response');
    }
    
    if (!Array.isArray(response.data.choices) || response.data.choices.length === 0) {
      console.error('Empty choices array in API response:', response.data);
      return generateFallbackResponse(resumeText, model, 'Empty choices array in API response');
    }
    
    const choice = response.data.choices[0];
    if (!choice || !choice.message) {
      console.error('Invalid choice format - missing message:', choice);
      return generateFallbackResponse(resumeText, model, 'Missing message in API response choice');
    }
    
    if (!choice.message.content) {
      console.error('Invalid message format - missing content:', choice.message);
      return generateFallbackResponse(resumeText, model, 'Missing content in API response message');
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
      return {
        success: true,
        data: {
          structured: jsonResponse,
          raw: aiResponse,
          model: model
        }
      };
    } catch (parseError) {
      console.log('AI response is not valid JSON, returning raw text');
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
    console.error('AI analysis error:', error);
    return generateFallbackResponse(resumeText, options.model || DEFAULT_MODEL, error.message);
  }
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

module.exports = {
  analyzeResume,
  FREE_MODELS
}; 