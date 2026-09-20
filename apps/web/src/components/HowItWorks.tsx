import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    n: '01',
    title: 'Describe your idea or attach PDF',
    body: 'Type a single prompt into the box — a topic, a pitch, or upload a PDF document. That is all the studio needs.',
  },
  {
    n: '02',
    title: 'AI builds the show',
    body: 'The script, slide visuals, voiceovers, and Remotion video animations are generated and stitched together automatically.',
  },
  {
    n: '03',
    title: 'Watch & share',
    body: 'Your presenter video plays instantly with synced voiceover and dynamic slides. Replay or download it anytime.',
  },
];

export const HowItWorks = () => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.step-row').forEach((row) => {
        gsap.from(row, {
          y: 60,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: row, start: 'top 80%' },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="how"
      ref={ref}
      className="relative border-y border-white/5 bg-[radial-gradient(ellipse_at_center,rgba(255,69,0,0.05),transparent_70%)]"
    >
      <div className="mx-auto max-w-6xl px-6 py-28 md:px-10">
        <div className="mb-20 max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">
            / How it works
          </span>
          <h2 className="mt-4 font-display text-4xl font-black tracking-tight sm:text-5xl">
            Three steps. Zero rehearsals.
          </h2>
        </div>
        <div className="flex flex-col gap-4">
          {STEPS.map((s) => (
            <div
              key={s.n}
              data-testid="how-step"
              className="step-row grid grid-cols-1 items-start gap-6 border-t border-white/10 py-10 md:grid-cols-[140px_1fr]"
            >
              <span className="font-display text-6xl font-black text-primary/80">{s.n}</span>
              <div className="max-w-2xl">
                <h3 className="font-display text-3xl font-bold tracking-tight">{s.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
