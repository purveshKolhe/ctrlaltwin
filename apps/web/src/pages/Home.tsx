import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Nav } from '../components/Nav';
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { HowItWorks } from '../components/HowItWorks';
import { Gallery } from '../components/Gallery';
import { Footer } from '../components/Footer';
import { GenerationOverlay } from '../components/GenerationOverlay';
import { VideoPlayer } from '../components/VideoPlayer';
import {
  generatePresentation,
  listPresentations,
  getPresentation,
  deletePresentation,
  type PresentationItem,
  type PresentationDetail,
} from '../lib/api';

export default function Home() {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [items, setItems] = useState<PresentationItem[]>([]);
  const [active, setActive] = useState<PresentationDetail | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await listPresentations();
      setItems(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleGenerate = async (prompt: string) => {
    setGenerating(true);
    setProgress(0);
    setLogs([]);
    try {
      const pres = await generatePresentation({ prompt }, (job) => {
        setProgress(job.progress);
        setLogs(job.logs || []);
      });
      setActive(pres);
      refresh();
      toast.success('Your presenter video is ready');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Couldn't generate the video. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleOpen = async (id: string) => {
    try {
      const pres = await getPresentation(id);
      setActive(pres);
    } catch {
      toast.error("Couldn't open this video.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePresentation(id);
      setItems((prev) => prev.filter((p) => p.id !== id));
      toast.success('Deleted');
    } catch {
      toast.error("Couldn't delete.");
    }
  };

  return (
    <div id="top" className="relative min-h-screen bg-background text-foreground">
      <Nav />
      <Hero onGenerate={handleGenerate} generating={generating} />
      <Features />
      <HowItWorks />
      <Gallery items={items} onOpen={handleOpen} onDelete={handleDelete} />
      <Footer />

      {generating && (
        <GenerationOverlay progress={progress} logs={logs} />
      )}
      {active && (
        <VideoPlayer presentation={active} onClose={() => setActive(null)} />
      )}
    </div>
  );
}
