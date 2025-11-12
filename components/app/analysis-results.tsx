"use client";

import type { AnalyzeVoiceOutput } from '@/ai/flows/analyze-voice-for-parkinsons-indicators';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, ShieldCheck, Shield, FileText, Info, TriangleAlert } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface AnalysisResultsProps {
  isLoading: boolean;
  result: AnalyzeVoiceOutput | null;
}

const LoadingSkeleton = () => (
    <Card className="shadow-lg">
        <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center p-6 bg-muted rounded-lg">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-6 w-32 mt-4" />
            </div>
            <div>
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-28 rounded-full" />
                </div>
            </div>
             <div>
                <Skeleton className="h-6 w-24 mb-4" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                </div>
            </div>
        </CardContent>
    </Card>
)

const RiskLevelDisplay = ({ riskLevel }: { riskLevel: AnalyzeVoiceOutput['riskLevel'] }) => {
    const riskInfo = {
        'Level 0': {
            Icon: ShieldCheck,
            text: 'No Indicators Detected',
            className: 'text-green-500 bg-green-500/10',
        },
        'Level 1': {
            Icon: Shield,
            text: 'Few Indicators Detected',
            className: 'text-yellow-500 bg-yellow-500/10',
        },
        'Level 2': {
            Icon: ShieldAlert,
            text: 'Multiple Indicators Detected',
            className: 'text-destructive bg-destructive/10',
        },
    };

    const { Icon, text, className } = riskInfo[riskLevel];

    return (
        <div className={cn("flex flex-col items-center justify-center p-6 rounded-lg text-center", className)}>
            <Icon className="h-16 w-16" />
            <h3 className="text-2xl font-bold mt-4">{riskLevel}</h3>
            <p className="font-semibold">{text}</p>
        </div>
    );
};


export default function AnalysisResults({ isLoading, result }: AnalysisResultsProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!result) {
    return null;
  }

  const hasIndicators = result.indicators && result.indicators.length > 0;

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <TriangleAlert className="h-4 w-4" />
        <AlertTitle>Medical Disclaimer: Not a Diagnostic Tool</AlertTitle>
        <AlertDescription>
          This application is a technology demonstration and is **not a medical device**. The analysis is performed by an AI and is for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment.
        </AlertDescription>
      </Alert>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
              <FileText className="text-primary"/>
              <CardTitle>Analysis Results</CardTitle>
          </div>
          <CardDescription>
              This is an AI-generated analysis of your voice sample.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RiskLevelDisplay riskLevel={result.riskLevel} />

          <div>
            <h4 className="font-semibold mb-2">Detected Acoustic Indicators</h4>
            {hasIndicators ? (
              <div className="flex flex-wrap gap-2">
                {result.indicators.map((indicator, index) => (
                  <Badge key={index} variant="secondary">{indicator}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No specific acoustic indicators were detected in this sample.</p>
            )}
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">AI Summary</h4>
            <p className="text-sm text-foreground/80">{result.summary}</p>
          </div>

          <div>
              <h4 className="font-semibold mb-2">Analysis Confidence: <span className="font-bold">{result.confidenceLevel} ({result.confidenceScore}%)</span></h4>
              <Progress value={result.confidenceScore} className="h-3 [&>div]:bg-primary" />
              <p className="text-xs text-muted-foreground mt-1">Represents the AI's confidence in its findings based on the audio clarity.</p>
          </div>

          {result.comparisonWithHistory && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Info />
                  Comparison with History
              </h4>
              <p className="text-sm text-foreground/80">{result.comparisonWithHistory}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
