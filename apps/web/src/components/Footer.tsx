export const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-black">
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-10">
        <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <span className="font-display text-lg font-black text-primary-foreground">P</span>
              </div>
              <span className="font-display text-2xl font-black tracking-tight">
                PRESENTOR<span className="text-primary">.</span>
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm text-muted-foreground">
              Turn any idea into a fully narrated presenter video. No slides, no voiceover, no
              rehearsals.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl">
            <span className="font-mono text-[0.7rem] uppercase tracking-widest text-muted-foreground">
              Built for
            </span>
            <span className="font-display text-sm font-bold text-foreground">
              WeMakeDevs <span className="text-primary">×</span> AWS
            </span>
            <span className="font-mono text-[0.7rem] uppercase tracking-widest text-muted-foreground">
              Bharat Builds
            </span>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/5 pt-8 md:flex-row md:items-center">
          <p className="font-mono text-[0.7rem] uppercase tracking-widest text-white/30">
            © {new Date().getFullYear()} Presentor Studio
          </p>
          <p className="font-mono text-[0.7rem] uppercase tracking-widest text-white/30">
            Idea in · Presenter video out
          </p>
        </div>
      </div>
    </footer>
  );
};
