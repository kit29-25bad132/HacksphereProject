"use client";

import { useState, useRef, useEffect } from 'react';
import type { AnalyzeVoiceOutput } from '@/ai/flows/analyze-voice-for-parkinsons-indicators';
import { analyzeVoiceForParkinsonsIndicators } from '@/ai/flows/analyze-voice-for-parkinsons-indicators';
import { useToast } from "@/hooks/use-toast";

import RecorderControls from './recorder-controls';
import AnalysisResults from './analysis-results';
import HistoryTracker from './history-tracker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

// Define a type for a single history entry
export interface HistoryEntry extends AnalyzeVoiceOutput {
  id: string;
  timestamp: string;
  audioUrl: string; // This will now be a base64 data URI
}

export default function VoiceAnalysisClient() {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null); // Can be object URL for preview or data URI
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeVoiceOutput | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('voiceAnalysisHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('voiceAnalysisHistory', JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save history to localStorage", error);
    }
  }, [history]);

  const resetState = () => {
    setAnalysisResult(null);
    setAudioURL(null);
    setAudioBlob(null);
    setIsRecording(false);
  }

  const startRecording = async () => {
    resetState();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioURL(url); // Use temporary object URL for immediate playback
        stream.getTracks().forEach(track => track.stop()); // Stop microphone access
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast({
        variant: "destructive",
        title: "Microphone Error",
        description: "Could not access the microphone. Please check your browser permissions.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAnalyze = async () => {
    if (!audioBlob) {
        toast({
            variant: "destructive",
            title: "No Audio",
            description: "Please record or upload your voice first.",
        });
        return;
    }

    setIsLoading(true);
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      try {
        const base64Audio = reader.result as string;
        
        // Prepare historical data string for the prompt
        const historicalVoicePatterns = history.length > 0 
          ? `Previous analyses as a JSON array:\n${JSON.stringify(history.map(({ id, audioUrl, ...rest }) => rest), null, 2)}`
          : undefined;

        const result = await analyzeVoiceForParkinsonsIndicators({ 
          audioDataUri: base64Audio,
          historicalVoicePatterns,
        });

        setAnalysisResult(result);

        // Add to history
        if (result) {
          const newHistoryEntry: HistoryEntry = {
            id: new Date().toISOString(),
            timestamp: new Date().toLocaleString(),
            audioUrl: base64Audio, // Save the persistent base64 data URI
            ...result
          };
          setHistory(prev => [newHistoryEntry, ...prev.slice(0, 9)]); // Keep history to 10 entries
        }
      } catch (error) {
        console.error("Analysis failed:", error);
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: "An error occurred during the analysis. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };
  };

  const resetRecording = () => {
    resetState();
  }

  const handleFileSelect = (file: File) => {
    resetState();
    const blob = new Blob([file], { type: file.type });
    setAudioBlob(blob);
    const url = URL.createObjectURL(blob);
    setAudioURL(url);
  };


  return (
    <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
      <div className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Voice Recorder</CardTitle>
            <CardDescription>Record your voice or upload an audio file. For best results, say "pa-ta-ka" clearly and repeatedly for 5-10 seconds.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecorderControls 
              isRecording={isRecording}
              audioURL={audioURL}
              startRecording={startRecording}
              stopRecording={stopRecording}
              onAnalyze={handleAnalyze}
              resetRecording={resetRecording}
              isLoading={isLoading}
              onFileSelect={handleFileSelect}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <AnalysisResults isLoading={isLoading} result={analysisResult} />
          
          {!isLoading && !analysisResult && (
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Waiting for Analysis</AlertTitle>
              <AlertDescription>
                Your analysis results will appear here once you record and submit your voice sample.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <HistoryTracker history={history} />
      </div>
    </div>
  );
}
