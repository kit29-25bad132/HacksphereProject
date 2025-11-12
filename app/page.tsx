import { Stethoscope, Waves } from 'lucide-react';
import VoiceAnalysisClient from '@/components/app/voice-analysis-client';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 w-full border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Waves className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">VoiceVitality</h1>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 md:px-6 py-8 md:py-12 lg:py-16">
            <div className="max-w-3xl mx-auto text-center mb-8 md:mb-12">
                <Stethoscope className="mx-auto h-12 w-12 text-primary mb-4" />
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    Monitor Your Vocal Health
                </h2>
                <p className="mt-4 text-muted-foreground md:text-xl">
                    VoiceVitality uses AI to analyze your voice for subtle changes, offering insights for health monitoring. Get started by recording a voice sample below.
                </p>
            </div>
            <VoiceAnalysisClient />
        </section>
      </main>

      <footer className="py-6 md:px-8 bg-background border-t">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
            <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
                This is a technology demonstration and not a medical device. For informational purposes only.
            </p>
        </div>
      </footer>
    </div>
  );
}
