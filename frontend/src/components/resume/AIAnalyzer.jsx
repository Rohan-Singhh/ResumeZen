import React, { useState } from 'react';
import { analyzeResumeWithAI } from '../../services/resumeService';

const AIAnalyzer = () => {
  const [resumeText, setResumeText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState({
    model: 'anthropic/claude-3-opus:beta',
    prompt: ''
  });

  // Handle resume text input
  const handleTextChange = (e) => {
    setResumeText(e.target.value);
    setError(null);
  };

  // Handle custom prompt input
  const handlePromptChange = (e) => {
    setOptions({
      ...options,
      prompt: e.target.value
    });
  };

  // Handle model selection
  const handleModelChange = (e) => {
    setOptions({
      ...options,
      model: e.target.value
    });
  };

  // Analyze the resume with AI
  const handleAnalyze = async (e) => {
    e.preventDefault();
    
    if (!resumeText.trim()) {
      setError('Please enter resume text to analyze');
      return;
    }
    
    try {
      setAnalyzing(true);
      setError(null);
      
      const response = await analyzeResumeWithAI(resumeText, options);
      
      if (!response.success) {
        throw new Error(response.message || 'Analysis failed');
      }
      
      setResults(response.data);
      setAnalyzing(false);
    } catch (err) {
      setError(err.message || 'An error occurred during AI analysis');
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">AI Resume Analyzer</h2>
      
      {/* Input Form */}
      <form onSubmit={handleAnalyze} className="mb-8">
        {/* Resume Text Input */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Resume Text
          </label>
          <textarea
            value={resumeText}
            onChange={handleTextChange}
            className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Paste the extracted resume text here..."
          />
        </div>
        
        {/* AI Options */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-md font-semibold text-gray-700 mb-3">AI Options</h3>
          
          {/* Model Selection */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              AI Model
            </label>
            <select
              value={options.model}
              onChange={handleModelChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="anthropic/claude-3-opus:beta">Claude 3 Opus (Highest Quality)</option>
              <option value="anthropic/claude-3-sonnet:beta">Claude 3 Sonnet (Balanced)</option>
              <option value="anthropic/claude-3-haiku:beta">Claude 3 Haiku (Fastest)</option>
              <option value="google/gemini-pro">Google Gemini Pro</option>
              <option value="openai/gpt-4-turbo">OpenAI GPT-4 Turbo</option>
            </select>
          </div>
          
          {/* Custom Prompt Input */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Custom Prompt (Optional)
            </label>
            <textarea
              value={options.prompt}
              onChange={handlePromptChange}
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Leave empty for default analysis or customize how the AI should analyze the resume..."
            />
            <p className="mt-1 text-xs text-gray-500">
              If left empty, the default prompt will extract contact info, skills, experience, education, and provide analysis.
            </p>
          </div>
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={analyzing}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {analyzing ? 'Analyzing...' : 'Analyze Resume'}
        </button>
      </form>
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          <p className="font-medium">Error: {error}</p>
        </div>
      )}
      
      {/* Results Section */}
      {results && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Analysis Results</h3>
          
          {/* Structured Results */}
          {results.structured ? (
            <div className="mb-6">
              {/* Contact Info */}
              {results.structured.contactInformation && (
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Contact Information</h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">
                      <strong>Name:</strong> {results.structured.contactInformation.name}
                    </p>
                    <p className="text-sm">
                      <strong>Email:</strong> {results.structured.contactInformation.email}
                    </p>
                    <p className="text-sm">
                      <strong>Phone:</strong> {results.structured.contactInformation.phone}
                    </p>
                    <p className="text-sm">
                      <strong>Location:</strong> {results.structured.contactInformation.location}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Skills */}
              {results.structured.skills && (
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Skills</h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-700">Technical Skills:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {Array.isArray(results.structured.skills.technical) && 
                         results.structured.skills.technical.map((skill, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700">Soft Skills:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {Array.isArray(results.structured.skills.soft) && 
                         results.structured.skills.soft.map((skill, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Work Experience */}
              {results.structured.workExperience && (
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Work Experience</h4>
                  <div className="space-y-3">
                    {Array.isArray(results.structured.workExperience) && 
                     results.structured.workExperience.map((job, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-semibold">{job.position}</p>
                        <p className="text-sm">{job.company} | {job.dates}</p>
                        {Array.isArray(job.achievements) && job.achievements.length > 0 && (
                          <div className="mt-1">
                            <p className="text-xs text-gray-500">Achievements:</p>
                            <ul className="list-disc list-inside text-sm ml-2">
                              {job.achievements.map((achievement, i) => (
                                <li key={i} className="text-sm">{achievement}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Education */}
              {results.structured.education && (
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Education</h4>
                  <div className="space-y-3">
                    {Array.isArray(results.structured.education) && 
                     results.structured.education.map((edu, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-semibold">{edu.degree}</p>
                        <p className="text-sm">{edu.institution} | {edu.dates}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Professional Summary */}
              {results.structured.professionalSummary && (
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Professional Summary</h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm whitespace-pre-line">{results.structured.professionalSummary}</p>
                  </div>
                </div>
              )}
              
              {/* Analysis */}
              {results.structured.analysis && (
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Resume Analysis</h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm mb-2">
                      <strong>Overall Score:</strong> {results.structured.analysis.overallAssessmentScore}/10
                    </p>
                    
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-700">Strengths:</p>
                      <ul className="list-disc list-inside text-sm ml-2">
                        {Array.isArray(results.structured.analysis.strengths) && 
                         results.structured.analysis.strengths.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-700">Areas for Improvement:</p>
                      <ul className="list-disc list-inside text-sm ml-2">
                        {Array.isArray(results.structured.analysis.areasForImprovement) && 
                         results.structured.analysis.areasForImprovement.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700">ATS Keywords:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Array.isArray(results.structured.analysis.keywords) && 
                         results.structured.analysis.keywords.map((keyword, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Raw AI Response (when structured data not available)
            <div className="mb-6">
              <div className="p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
                <p className="text-sm whitespace-pre-line">{results.raw}</p>
              </div>
            </div>
          )}
          
          {/* Raw JSON View Toggle */}
          <details className="mt-4">
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
              View Raw Response Data
            </summary>
            <div className="p-4 bg-gray-800 text-gray-100 rounded-lg mt-2 overflow-x-auto">
              <pre className="text-xs">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default AIAnalyzer; 