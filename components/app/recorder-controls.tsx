"use client";

import { Button } from '@/components/ui/button';
import { Mic, StopCircle, Play, Trash2, BarChartBig, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import UploadFile from './upload-file';


interface RecorderControlsProps {
  isRecording: boolean;
  audioURL: string | null;
  isLoading: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  onAnalyze: () => void;
  resetRecording: () => void;
  onFileSelect: (file: File) => void;
}

export default function RecorderControls({
  isRecording,
  audioURL,
  isLoading,
  startRecording,
  stopRecording,
  onAnalyze,
  resetRecording,
  onFileSelect
}: RecorderControlsProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (audioURL && audioRef.current) {
        audioRef.current.src = audioURL;
    }
  }, [audioURL]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
        setDuration(audio.duration);
        setCurrentTime(audio.currentTime);
    }

    const setAudioTime = () => setCurrentTime(audio.currentTime);

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
        audio.removeEventListener('loadeddata', setAudioData);
        audio.removeEventListener('timeupdate', setAudioTime);
        audio.removeEventListener('ended', () => setIsPlaying(false));
    }
  }, [audioRef.current]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-4 rounded-lg bg-card">
        <div className="flex items-center justify-center gap-4">
            <div className="relative h-24 w-24">
                {!audioURL && !isRecording && (
                <Button
                    size="icon"
                    className="w-24 h-24 rounded-full shadow-lg"
                    onClick={startRecording}
                    aria-label="Start recording"
                    disabled={!!audioURL}
                >
                    <Mic className="h-10 w-10" />
                </Button>
                )}
                {isRecording && (
                <Button
                    size="icon"
                    variant="destructive"
                    className="w-24 h-24 rounded-full shadow-lg animate-pulse"
                    onClick={stopRecording}
                    aria-label="Stop recording"
                >
                    <StopCircle className="h-10 w-10" />
                </Button>
                )}
                {audioURL && (
                    <div className="flex items-center justify-center h-24 w-24 rounded-full bg-primary/20">
                        <Button
                            size="icon"
                            className="w-16 h-16 rounded-full shadow-md"
                            onClick={togglePlayPause}
                            aria-label={isPlaying ? "Pause playback" : "Play recording"}
                        >
                            <Play className={`h-8 w-8 ${isPlaying ? 'hidden' : 'block'}`} />
                            <svg className={`h-8 w-8 ${isPlaying ? 'block' : 'hidden'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>
                        </Button>
                    </div>
                )}
            </div>
            
            {!isRecording && !audioURL && (
                <>
                    <div className="text-sm text-muted-foreground">OR</div>
                    <UploadFile onFileSelect={onFileSelect} disabled={isRecording} />
                </>
            )}

        </div>

      {audioURL && (
        <>
            <div className="w-full">
                <audio ref={audioRef} className="hidden" />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
                </div>
            </div>
            <div className="flex w-full gap-2">
                <Button variant="outline" className="w-full" onClick={resetRecording}>
                    <Trash2 />
                    New
                </Button>
                <Button className="w-full" onClick={onAnalyze} disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : <BarChartBig />}
                    Analyze
                </Button>
            </div>
        </>
      )}

      {!audioURL && (
        <p className="text-sm text-muted-foreground text-center">
          {isRecording ? "Recording..." : "Click mic to record or upload a file"}
        </p>
      )}
    </div>
  );
}
