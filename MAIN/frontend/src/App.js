import "@/App.css";
import { useEffect, useState } from "react";
import { ReactLenis } from "lenis/react";
import { Toaster } from "sonner";
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import Studio from "@/pages/Studio";
import { NoiseOverlay } from "@/components/NoiseOverlay";

function App() {
  const [path, setPath] = useState(window.location.pathname + window.location.hash);

  useEffect(() => {
    const onRouteChange = () => setPath(window.location.pathname + window.location.hash);
    onRouteChange();
    window.addEventListener("hashchange", onRouteChange);
    window.addEventListener("popstate", onRouteChange);
    return () => {
      window.removeEventListener("hashchange", onRouteChange);
      window.removeEventListener("popstate", onRouteChange);
    };
  }, []);

  const session = (() => {
    try {
      return JSON.parse(localStorage.getItem("presentor_session") || "null");
    } catch {
      return null;
    }
  })();

  const renderPage = () => {
    if (path === "/studio" || path.endsWith("#studio")) return <Studio />;
    if (path === "/auth" || path.endsWith("#auth")) return <Auth />;
    if (session && (path === "/" || path === "")) return <Studio />;
    return <Landing />;
  };

  return (
    <ReactLenis root options={{ lerp: 0.08, smoothWheel: true }}>
      <div className="App min-h-screen bg-background text-foreground">
        <NoiseOverlay />
        {renderPage()}
        <Toaster
          theme="dark"
          position="bottom-center"
          toastOptions={{
            style: {
              background: "hsl(0 0% 8%)",
              border: "1px solid hsl(0 0% 15%)",
              color: "hsl(60 10% 96%)",
              fontFamily: "JetBrains Mono, monospace",
            },
          }}
        />
      </div>
    </ReactLenis>
  );
}

export default App;
