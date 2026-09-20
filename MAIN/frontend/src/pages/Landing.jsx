import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { Gallery } from "@/components/Gallery";
import { Footer } from "@/components/Footer";
import { GenerationOverlay } from "@/components/GenerationOverlay";
import { VideoPlayer } from "@/components/VideoPlayer";
import {
  generatePresentation,
  listPresentations,
  getPresentation,
  deletePresentation,
} from "@/lib/api";

export default function Landing() {
  const [generating, setGenerating] = useState(false);
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(null);

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

  const handleGenerate = async (prompt) => {
    setGenerating(true);
    try {
      const pres = await generatePresentation({ prompt });
      setActive(pres);
      refresh();
      toast.success("Your presenter video is ready");
    } catch (e) {
      console.error(e);
      toast.error("Couldn't generate the video. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleOpen = async (id) => {
    try {
      const pres = await getPresentation(id);
      setActive(pres);
    } catch (e) {
      toast.error("Couldn't open this video.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePresentation(id);
      setItems((prev) => prev.filter((p) => p.id !== id));
      toast.success("Deleted");
    } catch (e) {
      toast.error("Couldn't delete.");
    }
  };

  return (
    <div id="top" className="relative">
      <Nav />
      <Hero onGenerate={handleGenerate} generating={generating} />
      <Features />
      <HowItWorks />
      <Gallery items={items} onOpen={handleOpen} onDelete={handleDelete} />
      <Footer />

      {generating && <GenerationOverlay />}
      {active && <VideoPlayer presentation={active} onClose={() => setActive(null)} />}
    </div>
  );
}
