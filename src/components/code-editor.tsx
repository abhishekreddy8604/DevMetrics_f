import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Play, Save } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
  onSubmit?: (code: string) => Promise<void>;
  onRun?: (code: string) => Promise<void>;
}

const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' }
];

export const CodeEditor = ({ 
  code, 
  onChange, 
  language, 
  onLanguageChange,
  onSubmit,
  onRun 
}: CodeEditorProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRun = async () => {
    if (!onRun) return;
    setIsRunning(true);
    try {
      await onRun(code);
    } catch (error) {
      console.error('Failed to run code:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!onSubmit) return;
    setIsSubmitting(true);
    try {
      await onSubmit(code);
    } catch (error) {
      console.error('Failed to submit code:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b bg-gray-50">
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button
            onClick={handleRun}
            disabled={isRunning || !onRun}
            size="sm"
            variant="secondary"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            {isRunning ? 'Running...' : 'Run'}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !onSubmit}
            size="sm"
            variant="outline"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          language={language}
          value={code}
          onChange={(value) => onChange(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
};
