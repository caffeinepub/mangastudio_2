import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Film,
  Layers,
  Loader2,
  LogOut,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateProject,
  useDeleteProject,
  useListProjects,
} from "../hooks/useQueries";

interface DashboardProps {
  onNavigateToEditor: (projectId: string) => void;
  onNavigateToLanding: () => void;
}

function generateId(): string {
  return `proj_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function Dashboard({
  onNavigateToEditor,
  onNavigateToLanding,
}: DashboardProps) {
  const { clear, identity } = useInternetIdentity();
  const { data: projects, isLoading } = useListProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();

  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal ? `${principal.slice(0, 8)}...` : "";

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    const id = generateId();
    try {
      await createProject.mutateAsync({
        id,
        title: newTitle.trim(),
        description: newDesc.trim(),
        frames: [],
      });
      setNewProjectOpen(false);
      setNewTitle("");
      setNewDesc("");
      toast.success("Project created!");
      onNavigateToEditor(id);
    } catch {
      toast.error("Failed to create project");
    }
  };

  const handleDelete = async (projectId: string) => {
    try {
      await deleteProject.mutateAsync(projectId);
      setDeleteConfirm(null);
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete project");
    }
  };

  const handleLogout = () => {
    clear();
    onNavigateToLanding();
  };

  const formatDate = (ts: bigint) => {
    return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 glass-card">
        <div className="container mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-bold text-lg">
              AniPulse Studio
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">
              Principal: {shortPrincipal}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              data-ocid="dashboard.logout.button"
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-2xl lg:text-3xl text-foreground">
              My Projects
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your manga animations
            </p>
          </div>
          <Button
            onClick={() => setNewProjectOpen(true)}
            data-ocid="dashboard.new_project.button"
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                className="h-52 rounded-xl"
                data-ocid="dashboard.loading_state"
              />
            ))}
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                data-ocid={`dashboard.item.${idx + 1}`}
                className="glass-card rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-all group cursor-pointer"
                onClick={() => onNavigateToEditor(project.id)}
              >
                {/* Thumbnail */}
                <div
                  className="h-36 relative overflow-hidden flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.16 0.06 293) 0%, oklch(0.12 0.04 315) 100%)",
                  }}
                >
                  <div className="absolute inset-0 speed-lines opacity-30" />
                  <Film className="w-12 h-12 text-primary/40" />
                  <div className="absolute top-2 right-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-primary">
                      {Number(project.frameCount)} frames
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-display font-semibold text-sm text-foreground truncate mb-1">
                    {project.title}
                  </h3>
                  {project.description && (
                    <p className="text-xs text-muted-foreground truncate mb-2">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {formatDate(project.updatedAt)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      data-ocid={`dashboard.delete_button.${idx + 1}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(project.id);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            data-ocid="dashboard.empty_state"
            className="glass-card rounded-2xl border border-border p-16 text-center"
          >
            <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
              <Layers className="w-8 h-8 text-primary/60" />
            </div>
            <h3 className="font-display font-semibold text-lg text-foreground mb-2">
              No projects yet
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              Create your first manga animation project to get started.
            </p>
            <Button
              onClick={() => setNewProjectOpen(true)}
              data-ocid="dashboard.empty_new_project.button"
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <Plus className="w-4 h-4" />
              Create First Project
            </Button>
          </motion.div>
        )}
      </main>

      {/* New Project Dialog */}
      <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
        <DialogContent
          className="glass-card border-border"
          data-ocid="dashboard.new_project.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="proj-title">Project Title</Label>
              <Input
                id="proj-title"
                placeholder="My Epic Manga Animation"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                data-ocid="dashboard.new_project.input"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proj-desc">Description (optional)</Label>
              <Input
                id="proj-desc"
                placeholder="Action sequence from Chapter 5..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                data-ocid="dashboard.new_project_desc.input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setNewProjectOpen(false)}
              data-ocid="dashboard.new_project.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newTitle.trim() || createProject.isPending}
              data-ocid="dashboard.new_project.submit_button"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {createProject.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent
          className="glass-card border-border"
          data-ocid="dashboard.delete.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Delete Project?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            This will permanently delete this project and all its frames. This
            cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteConfirm(null)}
              data-ocid="dashboard.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={deleteProject.isPending}
              data-ocid="dashboard.delete.confirm_button"
            >
              {deleteProject.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
