'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { updateSummary, uploadPdf } from '@/services/api';
import axios from 'axios';

export default function FileUploadModal({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [status, setStatus] = useState(null);
  const [summary, setSummary] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryId, setSummaryId] = useState(null);
  const [pageRange, setPageRange] = useState('1-5');

  // File size constraints
  const MIN_FILE_SIZE = 0.01;
  const MAX_FILE_SIZE = 100;
  const FLASK_API_URL = 'http://127.0.0.1:3003/summarize';

  const handleFileChange = useCallback(async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setStatus({ message: 'Only PDF files are allowed', type: 'error' });
      setFile(null);
      return;
    }

    const fileSizeMB = selectedFile.size / (1024 * 1024);
    if (fileSizeMB < MIN_FILE_SIZE || fileSizeMB > MAX_FILE_SIZE) {
      setStatus({ 
        message: `File size must be between ${MIN_FILE_SIZE}MB and ${MAX_FILE_SIZE}MB`, 
        type: 'error' 
      });
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setFileUrl(URL.createObjectURL(selectedFile));
    setSummary('');
    setSummaryId(null);
    setStatus({ message: 'PDF selected', type: 'success' });
  }, []);

  const handleGenerateSummary = async () => {
    if (!file) return;

    setIsGenerating(true);
    setStatus(null);

    try {
      // First, upload the PDF

      /*
      const formData = new FormData();
      formData.append('pdf', file);
      */

      const uploadResponse = await uploadPdf(file);
      if (!uploadResponse.success) {
        throw new Error('Failed to upload PDF');
      }

      // Then, send to Flask API for processing
      const formData = new FormData();
      formData.append('file', file);
      formData.append('pages', pageRange || "1-5");

      const flaskResponse = await axios.post(FLASK_API_URL, formData);

      /*
      const flaskResponse = await axios.post(FLASK_API_URL, {
        file: file,
        pages: pageRange
      });
      */
      
      if (flaskResponse.status === 200) {

        // Update the summary in your database
        /*
        const updateResponse = await updateSummary({
          summaryId: uploadResponse.summaryId,
          summary: flaskResponse.data.summary
          });
        */
        const updateResponse = await updateSummary(uploadResponse.summaryId, flaskResponse.data.summary);

        if (updateResponse.success) {
          setSummary(flaskResponse.data.summary);
          setSummaryId(uploadResponse.summaryId);
          setStatus({ message: 'Summary generated successfully', type: 'success' });
        }
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      setStatus({ 
        message: 'Failed to generate summary. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Upload PDF
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Select a PDF file to generate a summary
          </p>
        </div>

        {/* File Upload Section */}
        <div className="space-y-4">
          <Input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="w-full"
          />

          {status && (
            <div className={`p-3 rounded ${
              status.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {status.message}
            </div>
          )}

          {file && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Page Range (Max 5 Pages):
              </label>
              <select 
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
              >
                <option value="1-5">Pages 1-5</option>
                <option value="6-10">Pages 6-10</option>
                <option value="11-15">Pages 11-15</option>
                <option value="16-20">Pages 16-20</option>
              </select>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          {fileUrl && (
            <Button 
              onClick={() => window.open(fileUrl, '_blank')}
              variant="outline"
            >
              View PDF
            </Button>
          )}
          <Button
            onClick={onClose}
            variant="secondary"
          >
            Cancel
          </Button>
          {file && (
            <Button
              onClick={handleGenerateSummary}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Summary'}
            </Button>
          )}
        </div>

        {/* Summary Display */}
        {summaryId && !summary && !isGenerating ? (
          <div className="mt-6 p-6 border rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              No Summary Created
            </h3>
            <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
              Check if page range of document has been exceeded.
            </p>
          </div>
        ) : summary ? (
          <div className="mt-6 p-6 border rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Generated Summary
            </h3>
            <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
              {summary}
            </p>
          </div>
        ) : null}
        
      </div>
    </Modal>
  );
} 
