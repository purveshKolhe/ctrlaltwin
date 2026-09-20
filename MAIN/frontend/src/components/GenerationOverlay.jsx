import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const STAGES = [
  "Analysing your prompt",
  "Writing the script",
  "Structuring slides",
  "Painting cinematic visuals",
  "Cueing the narrator",
  "Rendering your video",
];

export const GenerationOverlay = () => {
  const ref = useRef(null);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".gen-inner", { opacity: 0, y: 20, duration: 0.6, ease: "power2.out" });
    }, ref);
    const iv = setInterval(() => {
      setStage((s) => (s < STAGES.length - 1 ? s + 1 : s));
    }, 3500);
    return () => {
      clearInterval(iv);
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-xl"
      data-testid="generation-overlay"
    >
      <div className="gen-inner mx-auto w-full max-w-lg px-8">
        <div className="mb-10 flex items-center gap-3">
          <span className="onair-dot h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
            Now producing
          </span>
        </div>
        <div className="space-y-4">
          {STAGES.map((label, i) => (
            <div
              key={label}
              className="flex items-center gap-4 font-mono text-sm transition-opacity duration-500"
              style={{ opacity: i <= stage ? 1 : 0.25 }}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[0.6rem] ${
                  i < stage
                    ? "border-primary bg-primary text-primary-foreground"
                    : i === stage
                    ? "border-primary text-primary"
                    : "border-white/15 text-white/40"
                }`}
              >
                {i < stage ? "✓" : String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={
                  i === stage
                    ? "text-foreground"
                    : i < stage
                    ? "text-muted-foreground line-through decoration-white/20"
                    : "text-white/40"
                }
              >
                {label}
                {i === stage ? <span className="ml-1 animate-pulse">…</span> : null}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-10 font-mono text-[0.7rem] uppercase tracking-widest text-white/30">
          This usually takes 20–40 seconds
        </p>
      </div>
    </div>
  );
};
