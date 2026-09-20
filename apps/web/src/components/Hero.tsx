import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ArrowRight, Check, Play } from 'lucide-react';

interface HeroProps {
  onGenerate?: (prompt: string) => void;
  generating?: boolean;
}

export const Hero = (_props: HeroProps = {}) => {
  const rootRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.hero-eyebrow', { y: 20, opacity: 0, duration: 0.8 })
        .from('.hero-line', { y: 40, opacity: 0, duration: 1, stagger: 0.12 }, '-=0.4')
        .from('.hero-sub', { y: 20, opacity: 0, duration: 0.8 }, '-=0.6')
        .from('.hero-cta', { y: 30, opacity: 0, duration: 0.9 }, '-=0.5');
    }, rootRef);
    return () => ctx.revert();
  }, []);

  const openStudio = () => {
    navigate('/studio');
  };

  return (
    <section
      ref={rootRef}
      className="relative min-h-screen w-full overflow-hidden pt-32 pb-20"
      data-testid="hero-section"
    >
      {/* Cinematic light plate */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-20 mix-blend-screen"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/4722576/pexels-photo-4722576.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[60vh] bg-[radial-gradient(ellipse_at_top,rgba(255,69,0,0.12),transparent_60%)]" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-start px-6 md:px-10">
        <div className="hero-eyebrow mb-8 flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl">
          <span className="onair-dot h-2 w-2 rounded-full bg-primary" />
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Idea in. Presenter video out.
          </span>
        </div>

        <h1 className="font-display text-[3.2rem] font-black leading-[0.95] tracking-tighter text-foreground sm:text-7xl lg:text-[6.5rem]">
          <span className="hero-line block overflow-hidden">Type a prompt.</span>
          <span className="hero-line block overflow-hidden">
            Get a <span className="text-primary text-glow">narrated video.</span>
          </span>
        </h1>

        <p className="hero-sub mt-8 max-w-2xl text-base text-muted-foreground md:text-lg">
          No slides to design. No voiceover to record. No rehearsals. Describe your idea and
          watch it become a fully narrated presenter video in seconds.
        </p>

        <div className="hero-cta mt-12 flex flex-col items-start gap-6">
          <button
            onClick={openStudio}
            data-testid="hero-cta"
            className="cta-primary group flex items-center gap-3 rounded-full px-7 py-4 font-mono text-sm font-bold uppercase tracking-wider"
          >
            Create your first video
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            {['No credit card', 'Free to start', 'Ready in seconds'].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-primary" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="hero-preview mt-16 w-full max-w-5xl rounded-[28px] border border-white/10 bg-black/35 p-3 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-4">
          <div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-[#171310]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(255,92,35,0.28),transparent_34%),linear-gradient(120deg,rgba(255,255,255,0.04),transparent_45%)]" />
            <div className="relative grid min-h-[250px] items-end gap-8 p-6 md:grid-cols-[1fr_0.7fr] md:p-10">
              <div className="max-w-xl">
                <div className="mb-8 flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-primary">
                  <span className="h-2 w-2 rounded-full bg-primary onair-dot" />
                  A real presenter video, generated for you
                </div>
                <p className="font-display text-3xl font-black leading-tight tracking-tight md:text-5xl">
                  Your next big idea,
                  <span className="block text-primary">already in motion.</span>
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Play className="ml-0.5 h-4 w-4 fill-current" />
                  </div>
                  <div className="h-1.5 w-44 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-2/5 rounded-full bg-primary" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <p className="font-mono text-xs uppercase tracking-widest text-primary">Live Demo</p>
                <h3 className="mt-2 font-display text-xl font-bold">Try Presenter Studio</h3>
                <p className="mt-2 text-xs text-muted-foreground">
                  Transform any idea, PDF, or prompt into an animated, synchronized presenter video.
                </p>
                <button
                  onClick={openStudio}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 font-mono text-xs uppercase tracking-wider text-foreground transition-colors hover:bg-white/10"
                >
                  Open Studio <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
