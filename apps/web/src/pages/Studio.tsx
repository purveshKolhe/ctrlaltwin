import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Loader2,
  Sparkles,
  Upload,
  Video,
  Wand2,
  LogOut,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { signOutUser } from '../lib/authService';
import {
  generatePresentation,
  listPresentations,
  listTemplates,
  getPresentation,
  type PresentationItem,
  type PresentationDetail,
  type TemplateItem,
} from '../lib/api';
import { VideoPlayer } from '../components/VideoPlayer';

const QUICK_PROMPTS = [
  'Create a cinematic launch video for a premium AI product',
  'Turn this healthcare brief into a polished medical presentation',
  'Generate an architectural demo recap for our new platform release',
];

const TONES = [
  { id: 'professional', label: 'Professional' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'educational', label: 'Educational' },
  { id: 'bold', label: 'Bold & Punchy' },
];

export default function Studio() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [slideCount, setSlideCount] = useState(6);
  const [selectedTemplate, setSelectedTemplate] = useState('healthcare-borcelle-new');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [recent, setRecent] = useState<PresentationItem[]>([]);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [selected, setSelected] = useState<PresentationDetail | null>(null);
  const { user, checkAuth } = useAuth();

  const handleLogout = async () => {
    try {
      await signOutUser();
      await checkAuth();
      toast.success('Signed out successfully');
    } catch {
      toast.error('Failed to sign out');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [recentList, tpls] = await Promise.all([
          listPresentations(),
          listTemplates(),
        ]);
        setRecent(recentList.slice(0, 6));
        if (tpls && tpls.length > 0) {
          setTemplates(tpls);
          setSelectedTemplate(tpls[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadData();
  }, []);

  const handleSelectRecent = async (id: string) => {
    try {
      const pres = await getPresentation(id);
      setSelected(pres);
    } catch {
      toast.error('Could not load presentation details.');
    }
  };

  const handleGenerate = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = prompt.trim();

    if (!trimmed && !pdfFile) {
      setError('Please provide a prompt or upload a PDF document.');
      return;
    }

    setError('');
    setGenerating(true);
    setProgress(0);
    setLogs([]);

    try {
      const pres = await generatePresentation(
        {
          prompt: trimmed,
          templateId: selectedTemplate,
          slide_count: slideCount,
          tone,
          pdfFile,
        },
        (job) => {
          setProgress(job.progress);
          setLogs(job.logs || []);
        }
      );

      setSelected(pres);
      setRecent((prev) => [
        {
          id: pres.id,
          title: pres.title,
          subtitle: pres.slides?.[0]?.subtitle,
          prompt: pres.prompt,
          thumbnail: pres.slides?.[0]?.image,
          slide_count: pres.slides?.length || slideCount,
          created_at: pres.createdAt,
          status: pres.status,
          hasVideo: pres.hasVideo,
        },
        ...prev.filter((item) => item.id !== pres.id),
      ].slice(0, 6));
      setPrompt('');
      setPdfFile(null);
      toast.success('Your presenter video is ready!');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'The studio could not generate the video right now. Please try again.');
      toast.error('Generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 pb-16 pt-12 text-foreground md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/[0.03] p-4 shadow-2xl shadow-black/10 backdrop-blur-xl md:flex-row md:items-center md:justify-between md:p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/home')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors hover:bg-white/10"
              title="Back to Home"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="onair-dot h-2 w-2 rounded-full bg-primary" />
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-primary">
                  Presenter Studio
                </p>
              </div>
              <h1 className="mt-1 font-display text-2xl font-black tracking-tight md:text-3xl">
                Create your next video
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-white/70">
                  {user.username || 'Creator'}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
                  title="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign In
              </button>
            )}
            <button
              onClick={() => navigate('/home')}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
            >
              Showcase
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Studio Form */}
          <div className="rounded-[28px] border border-white/10 bg-card p-6 shadow-xl md:p-8">
            <form onSubmit={handleGenerate} className="space-y-6">
              {/* Prompt Input */}
              <div>
                <label className="mb-2 flex items-center justify-between font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  <span>Describe your presentation topic</span>
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. A comprehensive 6-slide presentation introducing a state-of-the-art AI healthcare diagnostics platform..."
                  rows={4}
                  className="auth-input resize-none text-sm"
                  disabled={generating}
                />
              </div>

              {/* Quick Prompts */}
              <div>
                <p className="mb-2 font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                  Quick Prompts:
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((qp) => (
                    <button
                      key={qp}
                      type="button"
                      onClick={() => setPrompt(qp)}
                      disabled={generating}
                      className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-1.5 text-left text-xs text-white/70 transition-colors hover:border-primary/40 hover:bg-white/[0.05] hover:text-white"
                    >
                      {qp}
                    </button>
                  ))}
                </div>
              </div>

              {/* PDF Document Upload */}
              <div>
                <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Or attach a PDF Document (optional)
                </label>
                <label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-4 transition-colors hover:border-primary/50 hover:bg-white/[0.04]">
                  <Upload className="h-4 w-4 text-primary" />
                  <span className="text-xs text-white/70">
                    {pdfFile ? pdfFile.name : 'Upload PDF (up to 30MB)'}
                  </span>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                    disabled={generating}
                  />
                </label>
                {pdfFile && (
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <button
                      type="button"
                      onClick={() => setPdfFile(null)}
                      className="text-destructive hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Controls: Tone & Template */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    disabled={generating}
                    className="auth-input text-xs"
                  >
                    {TONES.map((t) => (
                      <option key={t.id} value={t.id} className="bg-background">
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    Slide Count: {slideCount}
                  </label>
                  <input
                    type="range"
                    min={3}
                    max={8}
                    value={slideCount}
                    onChange={(e) => setSlideCount(Number(e.target.value))}
                    disabled={generating}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between font-mono text-[0.65rem] text-muted-foreground">
                    <span>3 slides</span>
                    <span>8 slides</span>
                  </div>
                </div>
              </div>

              {/* Templates */}
              {templates.length > 0 && (
                <div>
                  <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    Visual Theme
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {templates.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setSelectedTemplate(tpl.id)}
                        disabled={generating}
                        className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs transition-all ${
                          selectedTemplate === tpl.id
                            ? 'border-primary bg-primary/10 text-foreground font-semibold'
                            : 'border-white/10 bg-white/[0.02] text-muted-foreground hover:bg-white/[0.05]'
                        }`}
                      >
                        <span
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: tpl.primaryColor || '#ff4500' }}
                        />
                        <span className="truncate">{tpl.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 font-mono text-xs text-destructive">
                  {error}
                </div>
              )}

              {/* Progress & Logs (When Generating) */}
              {generating && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-primary">
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Producing video...
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  {logs.length > 0 && (
                    <p className="truncate font-mono text-[0.65rem] text-muted-foreground">
                      {logs[logs.length - 1]}
                    </p>
                  )}
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={generating}
                className="cta-primary flex w-full items-center justify-center gap-3 rounded-xl py-4 font-mono text-xs font-bold uppercase tracking-widest text-primary-foreground"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Producing Video...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" /> Generate Presenter Video
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Recent Creations / Preview */}
          <div className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-card p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">Recent Creations</h3>
                <span className="font-mono text-xs text-muted-foreground">
                  {recent.length} {recent.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {recent.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-12 text-center">
                  <Wand2 className="mb-3 h-8 w-8 text-primary/60" />
                  <p className="text-sm text-muted-foreground">No recent presentations</p>
                  <p className="mt-1 text-xs text-white/30">
                    Your generated videos will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recent.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectRecent(item.id)}
                      className="group flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:border-primary/40 hover:bg-white/[0.05]"
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="flex items-center gap-2">
                          {item.hasVideo && (
                            <span className="flex items-center gap-1 rounded bg-primary/20 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase text-primary">
                              <Video className="h-2.5 w-2.5" /> MP4
                            </span>
                          )}
                          <h4 className="truncate font-display text-sm font-bold text-foreground group-hover:text-primary">
                            {item.title}
                          </h4>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {item.slide_count} slides · {item.prompt}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-primary">
                Pro Tips
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  You can provide a prompt or upload an existing PDF presentation.
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  The AI automatically generates slide outlines, narrative scripts, voiceovers, and Remotion animations.
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  Once ready, you can watch the interactive slide deck or download the rendered MP4 video.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {selected && (
        <VideoPlayer presentation={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  );
}
