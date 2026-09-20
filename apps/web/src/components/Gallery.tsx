import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, Trash2, Clapperboard, Video } from 'lucide-react';
import type { PresentationItem } from '../lib/api';

gsap.registerPlugin(ScrollTrigger);

const SPANS = [
  'md:col-span-2 md:row-span-2',
  'md:col-span-1',
  'md:col-span-1',
  'md:col-span-1',
  'md:col-span-1',
  'md:col-span-2',
];

const timeAgo = (iso?: string) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch {
    return '';
  }
};

interface GalleryProps {
  items: PresentationItem[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

export const Gallery = ({ items, onOpen, onDelete }: GalleryProps) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.gal-card');
      if (!cards.length) return;
      gsap.from(cards, {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 80%' },
      });
    }, ref);
    return () => ctx.revert();
  }, [items]);

  return (
    <section id="library" ref={ref} className="mx-auto max-w-6xl px-6 py-28 md:px-10">
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">
            / Your library
          </span>
          <h2 className="mt-4 font-display text-4xl font-black tracking-tight sm:text-5xl">
            Every video you've made.
          </h2>
        </div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {items.length} presenter {items.length === 1 ? 'video' : 'videos'}
        </p>
      </div>

      {items.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-card py-24 text-center"
          data-testid="gallery-empty"
        >
          <Clapperboard className="mb-5 h-10 w-10 text-primary" strokeWidth={1.5} />
          <p className="font-display text-2xl font-bold">No videos yet</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Head to the studio or prompt at the top of the page to generate your first presenter video.
          </p>
        </div>
      ) : (
        <div className="grid auto-rows-[200px] grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((p, i) => (
            <button
              key={p.id}
              onClick={() => onOpen(p.id)}
              data-testid="gallery-card"
              className={`gal-card group relative overflow-hidden rounded-2xl border border-white/10 bg-card text-left transition-colors hover:border-primary/50 ${
                SPANS[i % SPANS.length]
              }`}
            >
              {p.thumbnail ? (
                <img
                  src={p.thumbnail}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-70 transition-[transform,opacity] duration-500 group-hover:scale-105 group-hover:opacity-90"
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,69,0,0.3),transparent_60%)]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              <div className="absolute inset-0 flex flex-col justify-between p-6">
                <div className="flex justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
                  </span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(p.id);
                    }}
                    data-testid="gallery-delete"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white/70 opacity-0 backdrop-blur-md transition-[opacity,color] duration-300 hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {p.hasVideo && (
                      <span className="flex items-center gap-1 rounded bg-primary/20 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase text-primary">
                        <Video className="h-2.5 w-2.5" /> MP4
                      </span>
                    )}
                    <h3 className="truncate font-display text-xl font-bold leading-tight tracking-tight">
                      {p.title}
                    </h3>
                  </div>
                  <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-widest text-white/50">
                    {p.slide_count} slides · {timeAgo(p.created_at)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};
