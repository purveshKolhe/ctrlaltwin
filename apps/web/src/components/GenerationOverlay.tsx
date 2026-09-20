import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const STAGES = [
  'Analysing your prompt & context',
  'Writing the presenter script (LLM)',
  'Synthesizing voiceover audio tracks (TTS)',
  'Generating cinematic slide visuals',
  'Synchronizing audio-visual timeline',
  'Rendering video presentation (Remotion)',
];

interface GenerationOverlayProps {
  progress?: number;
  statusText?: string;
  logs?: string[];
}

export const GenerationOverlay = ({ progress, statusText, logs }: GenerationOverlayProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.gen-inner', { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out' });
    }, ref);

    const iv = setInterval(() => {
      setStage((s) => (s < STAGES.length - 1 ? s + 1 : s));
    }, 4000);

    return () => {
      clearInterval(iv);
      ctx.revert();
    };
  }, []);

  // Determine stage from progress if available
  const activeStage = progress !== undefined
    ? Math.min(Math.floor((progress / 100) * STAGES.length), STAGES.length - 1)
    : stage;

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-xl"
      data-testid="generation-overlay"
    >
      <div className="gen-inner mx-auto w-full max-w-lg px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="onair-dot h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
              Now producing
            </span>
          </div>
          {progress !== undefined && (
            <span className="font-mono text-xs font-bold text-primary">
              {Math.round(progress)}%
            </span>
          )}
        </div>

        {progress !== undefined && (
          <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="space-y-4">
          {STAGES.map((label, i) => (
            <div
              key={label}
              className="flex items-center gap-4 font-mono text-sm transition-opacity duration-500"
              style={{ opacity: i <= activeStage ? 1 : 0.25 }}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[0.6rem] ${
                  i < activeStage
                    ? 'border-primary bg-primary text-primary-foreground'
                    : i === activeStage
                    ? 'border-primary text-primary'
                    : 'border-white/15 text-white/40'
                }`}
              >
                {i < activeStage ? '✓' : String(i + 1).padStart(2, '0')}
              </span>
              <span
                className={
                  i === activeStage
                    ? 'text-foreground'
                    : i < activeStage
                    ? 'text-muted-foreground line-through decoration-white/20'
                    : 'text-white/40'
                }
              >
                {label}
                {i === activeStage ? <span className="ml-1 animate-pulse">…</span> : null}
              </span>
            </div>
          ))}
        </div>

        {statusText && (
          <p className="mt-6 truncate font-mono text-xs text-muted-foreground">
            {statusText}
          </p>
        )}

        {logs && logs.length > 0 && (
          <div className="mt-4 max-h-20 overflow-y-auto rounded-lg border border-white/5 bg-black/40 p-2 font-mono text-[0.65rem] text-white/50">
            {logs.slice(-3).map((log, idx) => (
              <div key={idx} className="truncate">{log}</div>
            ))}
          </div>
        )}

        <p className="mt-8 font-mono text-[0.7rem] uppercase tracking-widest text-white/30">
          This usually takes 20–40 seconds
        </p>
      </div>
    </div>
  );
};
