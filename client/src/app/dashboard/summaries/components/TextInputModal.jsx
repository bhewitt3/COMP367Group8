'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import axios from 'axios';
import { uploadRawTextSummary } from '@/services/api';
export default function TextInputModal({ isOpen, onClose }) {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState(null);
  const [summary, setSummary] = useState('');
  const [summaryId, setSummaryId] = useState(null);

  const maxWords = 1000;
  const FLASK_API_URL = 'http://127.0.0.1:3003/summarizeraw';

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const handleSubmit = async () => {
    if(!text){
      setStatus({ message: 'Please enter some text to summarize', type: 'error' });
      return;
    }

    if(wordCount > maxWords){
      setStatus({ message: `Maximum ${maxWords} words allowed`, type: 'error' });
      return;
    }

    if(!title){
      setStatus({ message: 'Please enter a title for the summary', type: 'error' });
      return;
    }
    setIsGenerating(true);
    setStatus(null);

    try{
      const flaskResponse = await axios.post(FLASK_API_URL, 
        { text: text },
        {headers: { 'Content-Type': 'application/json' }}
      );

      if(!flaskResponse.data.summary){
        setStatus({ message: 'Failed to generate summary.', type: 'error' });
        return;
      }
      //save the summary
      const uploadResponse = await uploadRawTextSummary(title, text, flaskResponse.data.summary);

      if(!uploadResponse.success){
        throw new Error("Failed to upload raw text sumamry");
      }
      //set summary for preview
      setSummary(flaskResponse.data.summary);
      setSummaryId(uploadResponse.summaryId);
      setStatus({ message: 'Summary generated successfully', type: 'success' });

    }catch(err){
      setStatus({ message: 'Failed to generate summary. Please try again.', type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };
    
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Enter Text
          </h2>
          {status && (
            <div className={`p-3 rounded ${
              status.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {status.message}
            </div>
          )}
          <p className="text-gray-600 dark:text-gray-400">
            Give Your Summary a Name
          </p>
          <input 
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a title..." 
          className='w-full p-1 px-4 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white my-4' />
          <p className="text-gray-600 dark:text-gray-400">
            Paste or type your text to generate a summary
          </p>
        </div>

        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-64 p-4 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
            placeholder="Enter your text here..."
          />
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex justify-between">
            <span>Maximum {maxWords} words</span>
            <span>{wordCount} / {maxWords} words</span>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Summary'}
          </Button>
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
