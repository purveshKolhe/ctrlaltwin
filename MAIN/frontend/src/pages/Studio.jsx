import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Loader2, LogOut, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { generatePresentation, listPresentations } from "@/lib/api";

const QUICK_PROMPTS = [
  "Create a cinematic launch video for a premium AI product",
  "Turn this marketing brief into a polished founder update video",
  "Generate a product demo recap for our new feature release",
];

const readSession = () => {
  try {
    const raw = localStorage.getItem("presentor_session");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const userLabel = (session) => session?.name || session?.email || "Creator";

export default function Studio() {
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("professional");
  const [slideCount, setSlideCount] = useState(6);
  const [withImages, setWithImages] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [recent, setRecent] = useState([]);
  const [selected, setSelected] = useState(null);
  const [session, setSession] = useState(() => readSession());

  const currentUser = useMemo(() => userLabel(session), [session]);

  useEffect(() => {
    const current = readSession();
    setSession(current);
    const loadRecent = async () => {
      try {
        const data = await listPresentations();
        setRecent(data.slice(0, 4));
        if (data[0]) setSelected(data[0]);
      } catch (err) {
        console.error(err);
      }
    };

    loadRecent();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("presentor_session");
    window.history.pushState({}, "", "/auth");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const handleGenerate = async (event) => {
    event.preventDefault();
    const trimmed = prompt.trim();

    if (!trimmed) {
      setError("Add a prompt so the studio knows what to create.");
      return;
    }

    setError("");
    setGenerating(true);

    try {
      const pres = await generatePresentation({
        prompt: trimmed,
        slide_count: slideCount,
        tone,
        with_images: withImages,
      });

      setSelected(pres);
      setRecent((prev) => [pres, ...prev.filter((item) => item.id !== pres.id)].slice(0, 4));
      setPrompt("");
      toast.success("Your video prompt is in motion.");
    } catch (err) {
      console.error(err);
      setError("The studio could not generate the video right now. Please try again.");
      toast.error("The studio could not generate the video right now.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 pb-10 pt-24 text-foreground md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/[0.03] p-4 shadow-2xl shadow-black/10 backdrop-blur-xl md:flex-row md:items-center md:justify-between md:p-6">
          <div>
            {/* <p className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-primary">Presenter Studio</p> */}
            <h1 className="mt-2 font-display text-3xl font-black tracking-tight">Create your next video</h1>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-muted-foreground">
              {session ? currentUser : "Guest creator"}
            </div> */}
            {session && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
                Log out
              </button>
            )}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/10 backdrop-blur-xl md:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div>
                <h2 className="text-xl font-semibold">Describe what you want to create</h2>
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  rows={7}
                  placeholder="Example: Create a cinematic product launch video for a new AI tutoring app aimed at students. Use a premium, modern tone and keep it persuasive."
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-foreground placeholder:text-white/30 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}


              <button
                type="submit"
                disabled={generating}
                className="cta-primary inline-flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.2em]"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating video
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Generate video
                  </>
                )}
              </button>
            </form>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/10 backdrop-blur-xl">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground">Latest output</p>

              {selected ? (
                <div className="mt-5 space-y-4">
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                    <div className="aspect-[16/9] w-full bg-[radial-gradient(circle_at_top,_rgba(255,154,70,0.35),_transparent_52%),linear-gradient(135deg,#171717,#0D0D0D)]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selected.title}</h3>
                    {selected.subtitle && <p className="mt-2 text-sm text-muted-foreground">{selected.subtitle}</p>}
                    <div className="mt-4 flex items-center gap-2 text-sm text-foreground/80">
                      <Check className="h-4 w-4 text-primary" />
                      {selected.slides?.length || slideCount} slides ready
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-black/20 p-5 text-sm text-muted-foreground">
                  Your generated videos will appear here.
                </div>
              )}
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/10 backdrop-blur-xl">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground">Recent videos</p>
              <div className="mt-4 space-y-3">
                {recent.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-3 text-sm text-muted-foreground">
                    No videos yet.
                  </div>
                ) : (
                  recent.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelected(item)}
                      className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-left transition-colors hover:border-primary/40"
                    >
                      <div>
                        <p className="font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.slides?.length || 0} slides</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
