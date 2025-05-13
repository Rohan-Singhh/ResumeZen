import React, { useState } from 'react';
import { uploadResume, processResume } from '../../services/resumeService';

const ResumeUploader = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      
      // Upload the file to get URL
      const uploadResponse = await uploadResume(file);
      
      if (!uploadResponse.success) {
        throw new Error(uploadResponse.message || 'Upload failed');
      }

      setFileInfo(uploadResponse.data.fileInfo);
      setUploading(false);
    } catch (err) {
      setError(err.message || 'An error occurred during upload');
      setUploading(false);
    }
  };

  const handleProcess = async () => {
    if (!fileInfo || !fileInfo.url) {
      setError('Please upload a file first');
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      
      // Process the resume (OCR + AI)
      const processingResult = await processResume(fileInfo.url, {
        language: 'eng',
        scale: true,
        isTable: true
      });
      
      if (!processingResult.success) {
        throw new Error(processingResult.message || 'Processing failed');
      }

      setResults(processingResult.data);
      setProcessing(false);
    } catch (err) {
      setError(err.message || 'An error occurred during processing');
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Resume Parser</h2>
      
      {/* Upload Form */}
      <form onSubmit={handleUpload} className="mb-8">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Upload Resume (PDF, JPG, PNG)
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {uploading ? 'Uploading...' : 'Upload Resume'}
        </button>
      </form>
      
      {/* File Info */}
      {fileInfo && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">File Uploaded</h3>
          <p className="text-sm text-gray-600">Name: {fileInfo.originalName}</p>
          <p className="text-sm text-gray-600">Type: {fileInfo.format}</p>
          <p className="text-sm text-gray-600">
            Size: {Math.round(fileInfo.size / 1024)} KB
          </p>
          <div className="mt-4">
            <button
              onClick={handleProcess}
              disabled={processing}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {processing ? 'Processing...' : 'Process with OCR & AI'}
            </button>
          </div>
        </div>
      )}
      
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
          
          {/* Text Extraction */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-700 mb-2">Extracted Text</h4>
            <div className="p-4 bg-gray-50 rounded-lg max-h-60 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap">{results.extraction.extractedText}</pre>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-800 mb-1">Word Count</h5>
                <p>{results.extraction.statistics.wordCount}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-800 mb-1">Character Count</h5>
                <p>{results.extraction.statistics.characterCount}</p>
              </div>
            </div>
          </div>
          
          {/* AI Analysis */}
          {results.analysis && results.analysis.structured && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-700 mb-2">AI Analysis</h4>
              
              {/* Contact Info */}
              {results.analysis.structured.contactInformation && (
                <div className="mb-4">
                  <h5 className="font-medium text-gray-700 mb-1">Contact Information</h5>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">
                      <strong>Name:</strong> {results.analysis.structured.contactInformation.name}
                    </p>
                    <p className="text-sm">
                      <strong>Email:</strong> {results.analysis.structured.contactInformation.email}
                    </p>
                    <p className="text-sm">
                      <strong>Phone:</strong> {results.analysis.structured.contactInformation.phone}
                    </p>
                    <p className="text-sm">
                      <strong>Location:</strong> {results.analysis.structured.contactInformation.location}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Skills */}
              {results.analysis.structured.skills && (
                <div className="mb-4">
                  <h5 className="font-medium text-gray-700 mb-1">Skills</h5>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(results.analysis.structured.skills.technical) && 
                       results.analysis.structured.skills.technical.map((skill, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {Array.isArray(results.analysis.structured.skills.soft) && 
                       results.analysis.structured.skills.soft.map((skill, index) => (
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
              )}
              
              {/* Analysis */}
              {results.analysis.structured.analysis && (
                <div className="mb-4">
                  <h5 className="font-medium text-gray-700 mb-1">Resume Analysis</h5>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm mb-2">
                      <strong>Overall Score:</strong> {results.analysis.structured.analysis.overallAssessmentScore}/10
                    </p>
                    
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-700">Strengths:</p>
                      <ul className="list-disc list-inside text-sm ml-2">
                        {Array.isArray(results.analysis.structured.analysis.strengths) && 
                         results.analysis.structured.analysis.strengths.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-700">Areas for Improvement:</p>
                      <ul className="list-disc list-inside text-sm ml-2">
                        {Array.isArray(results.analysis.structured.analysis.areasForImprovement) && 
                         results.analysis.structured.analysis.areasForImprovement.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700">ATS Keywords:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Array.isArray(results.analysis.structured.analysis.keywords) && 
                         results.analysis.structured.analysis.keywords.map((keyword, index) => (
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
          )}
          
          {/* Raw JSON View Toggle */}
          <details className="mt-4">
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
              View Raw JSON Data
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

export default ResumeUploader; 