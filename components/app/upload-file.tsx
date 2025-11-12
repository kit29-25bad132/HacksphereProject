"use client";

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UploadFileProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export default function UploadFile({ onFileSelect, disabled }: UploadFileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        onFileSelect(file);
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please select an audio file.',
        });
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="audio/*"
        disabled={disabled}
      />
      <Button
        variant="outline"
        onClick={handleClick}
        disabled={disabled}
        className="w-full"
        aria-label="Upload an audio file"
      >
        <Upload className="mr-2 h-4 w-4" />
        Upload File
      </Button>
    </div>
  );
}
