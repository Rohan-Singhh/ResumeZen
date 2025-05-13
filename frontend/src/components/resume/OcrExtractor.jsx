import React, { useState } from 'react';
import { uploadAndExtractText, extractTextWithOCR } from '../../services/resumeService';

const OcrExtractor = () => {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'url'
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState({
    language: 'eng',
    engine: 2,
    scale: true,
    isTable: false,
    format: 'standard'
  });

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  // Handle URL input
  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    setError(null);
  };

  // Handle mode toggle (file or URL)
  const handleModeToggle = (mode) => {
    setUploadMode(mode);
    setError(null);
  };

  // Handle option changes
  const handleOptionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOptions({
      ...options,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Process document with OCR
  const handleExtractText = async (e) => {
    e.preventDefault();
    
    // Validate input
    if (uploadMode === 'file' && !file) {
      setError('Please select a file to process');
      return;
    }
    
    if (uploadMode === 'url' && (!url || !url.trim())) {
      setError('Please enter a valid URL');
      return;
    }
    
    try {
      setProcessing(true);
      setError(null);
      
      let response;
      
      // Process based on mode
      if (uploadMode === 'file') {
        response = await uploadAndExtractText(file, options);
      } else {
        response = await extractTextWithOCR(url, options);
      }
      
      if (!response.success) {
        throw new Error(response.message || 'Processing failed');
      }
      
      setResults(response.data);
      setProcessing(false);
    } catch (err) {
      setError(err.message || 'An error occurred during OCR processing');
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">OCR Text Extractor</h2>
      
      {/* Mode Toggle */}
      <div className="flex mb-6 border-b border-gray-200">
        <button 
          className={`py-2 px-4 mr-2 focus:outline-none ${uploadMode === 'file' 
            ? 'text-blue-600 border-b-2 border-blue-600 font-medium' 
            : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => handleModeToggle('file')}
        >
          Upload File
        </button>
        <button 
          className={`py-2 px-4 focus:outline-none ${uploadMode === 'url' 
            ? 'text-blue-600 border-b-2 border-blue-600 font-medium' 
            : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => handleModeToggle('url')}
        >
          Process URL
        </button>
      </div>
      
      {/* Extract Form */}
      <form onSubmit={handleExtractText} className="mb-8">
        {/* File Upload Input */}
        {uploadMode === 'file' && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Upload Document (PDF, JPG, PNG)
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
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected file: {file.name} ({Math.round(file.size / 1024)} KB)
              </p>
            )}
          </div>
        )}
        
        {/* URL Input */}
        {uploadMode === 'url' && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Document URL (PDF, JPG, PNG)
            </label>
            <input
              type="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://example.com/document.pdf"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
        
        {/* OCR Options */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-md font-semibold text-gray-700 mb-3">OCR Options</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Language Option */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Language
              </label>
              <select
                name="language"
                value={options.language}
                onChange={handleOptionChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="eng">English</option>
                <option value="spa">Spanish</option>
                <option value="fre">French</option>
                <option value="ger">German</option>
                <option value="chi_sim">Chinese (Simplified)</option>
                <option value="rus">Russian</option>
                <option value="jpn">Japanese</option>
              </select>
            </div>
            
            {/* OCR Engine Option */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                OCR Engine
              </label>
              <select
                name="engine"
                value={options.engine}
                onChange={handleOptionChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1">Engine 1 (Fast)</option>
                <option value="2">Engine 2 (Accurate)</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Scale Option */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="scale"
                checked={options.scale}
                onChange={handleOptionChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-700">
                Auto-scale image
              </label>
            </div>
            
            {/* Table Mode Option */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isTable"
                checked={options.isTable}
                onChange={handleOptionChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-700">
                Table extraction mode
              </label>
            </div>
          </div>
          
          {/* Format Option */}
          <div className="mt-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Result Format
            </label>
            <div className="flex">
              <div className="flex items-center mr-4">
                <input
                  type="radio"
                  name="format"
                  value="standard"
                  checked={options.format === 'standard'}
                  onChange={handleOptionChange}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Full details
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="text-only"
                  checked={options.format === 'text-only'}
                  onChange={handleOptionChange}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Text only
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={processing}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {processing ? 'Processing...' : 'Extract Text'}
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
          <h3 className="text-xl font-bold mb-4 text-gray-800">Extracted Text</h3>
          
          {/* Text Extraction */}
          <div className="mb-6">
            <div className="p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap">{results.text || results.rawResult?.ParsedText || "No text extracted"}</pre>
            </div>
            
            {/* Metadata */}
            {results.metadata && (
              <div className="mt-4">
                <h4 className="text-md font-semibold text-gray-700 mb-2">Document Metadata</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-2 bg-blue-50 rounded">
                    <span className="text-xs font-medium text-blue-800">Processing Time</span>
                    <p className="text-sm">{results.metadata.processingTimeInMs}ms</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded">
                    <span className="text-xs font-medium text-blue-800">OCR Engine</span>
                    <p className="text-sm">{results.metadata.ocrEngine}</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded">
                    <span className="text-xs font-medium text-blue-800">Exit Code</span>
                    <p className="text-sm">{results.metadata.exitCode}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
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

export default OcrExtractor; 