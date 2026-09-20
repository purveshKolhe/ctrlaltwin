import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { X, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, RotateCcw } from "lucide-react";

const wordDuration = (text) => {
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(4, words * 0.42);
};

export const VideoPlayer = ({ presentation, onClose }) => {
  const slides = useMemo(() => presentation?.slides || [], [presentation?.slides]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const playingRef = useRef(false);
  const currentRef = useRef(0);
  const elapsedRef = useRef(0);
  const lastTsRef = useRef(null);
  const rafRef = useRef(null);
  const mutedRef = useRef(false);

  const speak = useCallback((i) => {
    if (mutedRef.current) return;
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(slides[i]?.narration || slides[i]?.title || "");
    const voices = window.speechSynthesis.getVoices();
    const en = voices.find((v) => /en[-_]/i.test(v.lang) && /female|samantha|google/i.test(v.name))
      || voices.find((v) => /en[-_]/i.test(v.lang));
    if (en) u.voice = en;
    u.rate = 1.0;
    u.pitch = 1.0;
    window.speechSynthesis.speak(u);
  }, [slides]);

  const stopLoop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    lastTsRef.current = null;
  }, []);

  const finish = useCallback(() => {
    playingRef.current = false;
    setPlaying(false);
    stopLoop();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, [stopLoop]);

  const goTo = useCallback((i) => {
    currentRef.current = i;
    elapsedRef.current = 0;
    setCurrent(i);
    setProgress(0);
    if (playingRef.current) speak(i);
  }, [speak]);

  const loop = useCallback((ts) => {
    if (!playingRef.current) return;
    if (lastTsRef.current == null) lastTsRef.current = ts;
    const dt = (ts - lastTsRef.current) / 1000;
    lastTsRef.current = ts;
    elapsedRef.current += dt;
    const dur = wordDuration(slides[currentRef.current]?.narration);
    setProgress(Math.min(1, elapsedRef.current / dur));
    if (elapsedRef.current >= dur) {
      if (currentRef.current < slides.length - 1) {
        goTo(currentRef.current + 1);
        lastTsRef.current = null;
        rafRef.current = requestAnimationFrame(loop);
      } else {
        setProgress(1);
        finish();
      }
    } else {
      rafRef.current = requestAnimationFrame(loop);
    }
  }, [slides, goTo, finish]);

  const play = useCallback(() => {
    if (currentRef.current >= slides.length - 1 && progress >= 1) {
      goTo(0);
    }
    playingRef.current = true;
    setPlaying(true);
    setStarted(true);
    speak(currentRef.current);
    lastTsRef.current = null;
    rafRef.current = requestAnimationFrame(loop);
  }, [slides.length, progress, goTo, speak, loop]);

  const pause = useCallback(() => {
    playingRef.current = false;
    setPlaying(false);
    stopLoop();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, [stopLoop]);

  const togglePlay = () => (playing ? pause() : play());

  const next = () => {
    if (currentRef.current < slides.length - 1) goTo(currentRef.current + 1);
  };
  const prev = () => {
    if (currentRef.current > 0) goTo(currentRef.current - 1);
  };
  const restart = () => goTo(0);

  const toggleMute = () => {
    const nm = !muted;
    setMuted(nm);
    mutedRef.current = nm;
    if (nm && "speechSynthesis" in window) window.speechSynthesis.cancel();
    else if (!nm && playingRef.current) speak(currentRef.current);
  };

  useEffect(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.getVoices();
    return () => {
      playingRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  const close = () => {
    finish();
    onClose();
  };

  const overall = ((current + progress) / slides.length) * 100;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md md:p-10"
      data-testid="video-player-modal"
    >
      <button
        onClick={close}
        data-testid="player-close"
        className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-foreground transition-colors hover:bg-white/10"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="w-full max-w-5xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="min-w-0">
            <h3 className="truncate font-display text-xl font-bold tracking-tight md:text-2xl">
              {presentation.title}
            </h3>
            <p className="truncate font-mono text-[0.7rem] uppercase tracking-widest text-muted-foreground">
              Slide {current + 1} / {slides.length}
            </p>
          </div>
          {playing && (
            <div className="flex shrink-0 items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5">
              <span className="onair-dot h-2 w-2 rounded-full bg-primary" />
              <span className="font-mono text-[0.65rem] font-bold uppercase tracking-widest text-primary">
                On Air
              </span>
            </div>
          )}
        </div>

        {/* Stage */}
        <div
          className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-secondary orange-glow"
          data-testid="player-stage"
        >
          {slides.map((s, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-700 ease-out"
              style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 2 : 1 }}
            >
              {s.image ? (
                <img
                  src={s.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,69,0,0.25),transparent_60%),radial-gradient(circle_at_80%_80%,rgba(255,69,0,0.12),transparent_50%)] bg-secondary" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
                <h2 className="font-display text-2xl font-black leading-tight tracking-tight text-glow md:text-5xl">
                  {s.title}
                </h2>
                {s.subtitle ? (
                  <p className="mt-2 max-w-2xl font-mono text-xs uppercase tracking-widest text-primary md:text-sm">
                    {s.subtitle}
                  </p>
                ) : null}
                {s.bullets?.length ? (
                  <ul className="mt-5 space-y-2">
                    {s.bullets.map((b, bi) => (
                      <li
                        key={bi}
                        className="flex items-start gap-3 text-sm text-foreground/90 md:text-lg"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {b}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          ))}

          {/* First-play overlay */}
          {!started && (
            <button
              onClick={play}
              data-testid="player-bigplay"
              className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-colors hover:bg-black/40"
            >
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary orange-glow transition-transform hover:scale-110">
                <Play className="ml-1 h-8 w-8 text-primary-foreground" fill="currentColor" />
              </span>
            </button>
          )}
        </div>

        {/* Scrubber */}
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-150"
            style={{ width: `${overall}%` }}
            data-testid="player-progress"
          />
        </div>

        {/* Controls */}
        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              data-testid="player-prev"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors hover:bg-white/10"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              onClick={togglePlay}
              data-testid="player-playpause"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground orange-glow transition-transform hover:scale-105 active:scale-95"
            >
              {playing ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="ml-0.5 h-5 w-5" fill="currentColor" />}
            </button>
            <button
              onClick={next}
              data-testid="player-next"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors hover:bg-white/10"
            >
              <SkipForward className="h-4 w-4" />
            </button>
            <button
              onClick={restart}
              data-testid="player-restart"
              className="ml-2 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors hover:bg-white/10"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1.5 md:flex">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  data-testid="player-dot"
                  className={`h-2 rounded-full transition-all ${
                    i === current ? "w-6 bg-primary" : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={toggleMute}
              data-testid="player-mute"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors hover:bg-white/10"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
