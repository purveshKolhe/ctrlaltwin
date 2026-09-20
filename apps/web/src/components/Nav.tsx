import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useAuth } from '../contexts/AuthContext';

export const Nav = () => {
  const ref = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        y: -40,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        delay: 0.1,
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(`/#${id}`);
    }
  };

  return (
    <nav
      ref={ref}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-8"
      data-testid="main-nav"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between rounded-full border border-white/10 bg-black/55 px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur-2xl md:px-5">
        <div
          className="flex cursor-pointer items-center gap-3"
          onClick={() => navigate('/home')}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary orange-glow">
            <span className="font-display text-lg font-black text-primary-foreground">P</span>
          </div>
          <span className="font-display text-xl font-black tracking-tight">
            PRESENTOR<span className="text-primary">.</span>
          </span>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          {[
            ['Features', 'features'],
            ['How it works', 'how'],
            ['Library', 'library'],
          ].map(([label, id]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              data-testid={`nav-${id}`}
              className="font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-white/80 transition-colors hover:bg-white/10"
              title="View Profile"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {user.username || 'Account'}
            </button>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign In
            </button>
          )}
          <button
            onClick={() => navigate('/studio')}
            data-testid="nav-cta"
            className="cta-primary rounded-full px-5 py-2 font-mono text-xs uppercase tracking-widest"
          >
            Start creating
          </button>
        </div>
      </div>
    </nav>
  );
};
