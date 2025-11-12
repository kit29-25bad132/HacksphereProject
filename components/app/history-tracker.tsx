"use client";

import type { HistoryEntry } from "./voice-analysis-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { History, TrendingUp } from "lucide-react";

interface HistoryTrackerProps {
  history: HistoryEntry[];
}

export default function HistoryTracker({ history }: HistoryTrackerProps) {
    const chartData = history.map(entry => ({
        name: new Date(entry.timestamp).toLocaleDateString(),
        Indicators: entry.indicators.length,
        Confidence: entry.confidenceScore,
    })).reverse();

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
            <History className="text-primary"/>
            <CardTitle>Analysis History</CardTitle>
        </div>
        <CardDescription>Review your past voice analysis results and trends.</CardDescription>
      </CardHeader>
      <CardContent>
        {history.length > 0 ? (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp />
                Vocal Health Trend
              </h4>
              <div className="h-48 w-full text-xs">
                <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" allowDecimals={false} />
                        <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                        <Tooltip 
                            contentStyle={{
                                background: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "var(--radius)"
                            }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="Indicators" fill="hsl(var(--primary))" name="Indicators" />
                        <Bar yAxisId="right" dataKey="Confidence" fill="hsl(var(--accent))" name="Confidence (%)" />
                    </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {history.map((entry) => (
                <AccordionItem value={entry.id} key={entry.id}>
                  <AccordionTrigger>{entry.timestamp}</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p className="text-sm"><strong className="font-semibold">Confidence:</strong> {entry.confidenceLevel} ({entry.confidenceScore}%)</p>
                    <p className="text-sm"><strong className="font-semibold">Summary:</strong> {entry.summary}</p>
                    {entry.indicators.length > 0 && <p className="text-sm"><strong className="font-semibold">Indicators:</strong> {entry.indicators.join(', ')}</p>}
                    {entry.comparisonWithHistory && <p className="text-sm"><strong className="font-semibold">Historical Comparison:</strong> {entry.comparisonWithHistory}</p>}
                    <audio controls src={entry.audioUrl} className="w-full h-10"></audio>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No history yet.</p>
            <p className="text-sm text-muted-foreground">Your past analyses will appear here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
