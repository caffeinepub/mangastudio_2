import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import Landing from "./pages/Landing";

type Page =
  | { name: "landing" }
  | { name: "dashboard" }
  | { name: "editor"; projectId: string };

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [page, setPage] = useState<Page>({ name: "landing" });

  useEffect(() => {
    if (!identity && page.name !== "landing") {
      setPage({ name: "landing" });
    }
  }, [identity, page.name]);

  const navigateToDashboard = () => setPage({ name: "dashboard" });
  const navigateToEditor = (projectId: string) =>
    setPage({ name: "editor", projectId });
  const navigateToLanding = () => setPage({ name: "landing" });

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Loading AniPulse Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {page.name === "landing" && (
        <Landing onNavigateToDashboard={navigateToDashboard} />
      )}
      {page.name === "dashboard" && identity && (
        <Dashboard
          onNavigateToEditor={navigateToEditor}
          onNavigateToLanding={navigateToLanding}
        />
      )}
      {page.name === "editor" && identity && (
        <Editor
          projectId={page.projectId}
          onNavigateToDashboard={navigateToDashboard}
        />
      )}
      <Toaster richColors position="top-right" />
    </>
  );
}
