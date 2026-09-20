import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PenLine, Image, Volume2, Clapperboard, Zap, LayoutTemplate, Share2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: PenLine,
    title: 'AI writes the script',
    body: 'Give it a one-line idea. It structures a full narrative — headline, key points and a spoken narration for every slide.',
    span: 'md:col-span-2',
  },
  {
    icon: Image,
    title: 'Cinematic visuals',
    body: 'Every slide gets a bespoke AI-generated background image.',
    span: '',
  },
  {
    icon: Volume2,
    title: 'Auto voiceover',
    body: 'A narrator reads each slide aloud, perfectly timed.',
    span: '',
  },
  {
    icon: Clapperboard,
    title: 'Plays like a video',
    body: 'Slides auto-advance and crossfade in sync with the voice. Play, pause, scrub — no clicking through decks.',
    span: 'md:col-span-2',
  },
  {
    icon: Zap,
    title: 'Seconds, not hours',
    body: 'From blank page to finished presenter video before your coffee cools.',
    span: '',
  },
  {
    icon: LayoutTemplate,
    title: 'Your own library',
    body: 'Every video you make is saved and replayable, anytime.',
    span: '',
  },
  {
    icon: Share2,
    title: 'Ready to share',
    body: 'Create a polished link-ready story for a pitch, launch, lesson, or update — without exporting, editing, or chasing files.',
    span: 'md:col-span-3',
  },
];

export const Features = () => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.feat-card', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 75%' },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="features" ref={ref} className="relative mx-auto max-w-6xl px-6 py-28 md:px-10">
      <div className="mb-16 max-w-2xl">
        <span className="font-mono text-xs uppercase tracking-widest text-primary">
          / What it does
        </span>
        <h2 className="mt-4 font-display text-4xl font-black tracking-tight sm:text-5xl">
          A whole production crew, condensed into one prompt.
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            data-testid="feature-card"
            className={`feat-card group flex flex-col rounded-2xl border border-white/10 bg-card p-8 transition-colors hover:border-primary/40 ${f.span}`}
          >
            <f.icon className="mb-6 h-8 w-8 text-primary" strokeWidth={1.5} />
            <h3 className="font-display text-2xl font-bold tracking-tight">{f.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
