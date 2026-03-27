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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import {
  ArrowLeft,
  Download,
  Film,
  GripVertical,
  Image,
  Layers,
  Loader2,
  Pause,
  Play,
  Plus,
  Save,
  Square,
  Trash2,
  Type,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  EffectType,
  ExternalBlob,
  type Frame,
  OverlayStyle,
  type TextOverlay,
} from "../backend";
import { useActor } from "../hooks/useActor";
import { useGetProject, useUpdateProject } from "../hooks/useQueries";

interface EditorProps {
  projectId: string;
  onNavigateToDashboard: () => void;
}

function genId(): string {
  return `f_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

type LocalFrame = Frame & { localImageUrl?: string };

const EFFECT_LABELS: Record<EffectType, string> = {
  [EffectType.none]: "None",
  [EffectType.speed_lines]: "Speed Lines",
  [EffectType.impact]: "Impact Frame",
  [EffectType.zoom]: "Zoom",
  [EffectType.flash]: "Flash",
};

const OVERLAY_STYLE_LABELS: Record<OverlayStyle, string> = {
  [OverlayStyle.normal]: "Normal",
  [OverlayStyle.shout]: "Shout",
  [OverlayStyle.sfx]: "SFX",
  [OverlayStyle.bubble]: "Bubble",
};

// Effect overlay component
function EffectOverlay({
  effect,
  isPlaying,
}: { effect: EffectType; isPlaying: boolean }) {
  if (!isPlaying || effect === EffectType.none) return null;

  if (effect === EffectType.speed_lines) {
    return (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `repeating-conic-gradient(
            oklch(0.65 0.31 293 / 0.2) 0deg,
            transparent 2deg,
            transparent 5deg
          )`,
          animation: "spin 0.8s linear infinite",
        }}
      />
    );
  }

  if (effect === EffectType.flash) {
    return (
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 pointer-events-none bg-white"
      />
    );
  }

  if (effect === EffectType.impact) {
    return (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: "inset 0 0 60px oklch(0 0 0 / 0.7)",
          animation: "pulse 0.3s ease-in-out 3",
        }}
      />
    );
  }

  if (effect === EffectType.zoom) {
    return (
      <div
        className="absolute inset-0 pointer-events-none border-4"
        style={{
          borderColor: "oklch(0.65 0.31 293 / 0.6)",
          animation: "zoom 0.6s ease-in-out",
        }}
      />
    );
  }

  return null;
}

// Text overlay renderer
function TextOverlayRenderer({ overlay }: { overlay: TextOverlay }) {
  const x = Number(overlay.x);
  const y = Number(overlay.y);

  const style: React.CSSProperties = {
    position: "absolute",
    left: `${x}%`,
    top: `${y}%`,
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
    userSelect: "none",
    maxWidth: "80%",
  };

  if (overlay.style === OverlayStyle.normal) {
    return (
      <div
        style={{
          ...style,
          fontSize: "14px",
          color: "white",
          textShadow: "1px 1px 2px black",
        }}
      >
        {overlay.text}
      </div>
    );
  }
  if (overlay.style === OverlayStyle.shout) {
    return (
      <div
        style={{
          ...style,
          fontSize: "22px",
          fontWeight: "900",
          textTransform: "uppercase",
          color: "white",
          WebkitTextStroke: "2px black",
          letterSpacing: "2px",
        }}
      >
        {overlay.text}
      </div>
    );
  }
  if (overlay.style === OverlayStyle.sfx) {
    return (
      <div
        style={{
          ...style,
          fontSize: "36px",
          fontWeight: "900",
          color: "oklch(0.9 0.3 50)",
          WebkitTextStroke: "3px oklch(0.4 0.3 27)",
          textShadow: "2px 2px 0 oklch(0.4 0.3 27)",
          letterSpacing: "3px",
          textTransform: "uppercase",
        }}
      >
        {overlay.text}
      </div>
    );
  }
  if (overlay.style === OverlayStyle.bubble) {
    return (
      <div
        style={{
          ...style,
          background: "white",
          color: "black",
          padding: "6px 12px",
          borderRadius: "20px",
          border: "2px solid black",
          fontSize: "13px",
          fontWeight: "600",
        }}
      >
        {overlay.text}
      </div>
    );
  }
  return null;
}

export default function Editor({
  projectId,
  onNavigateToDashboard,
}: EditorProps) {
  const { data: project, isLoading } = useGetProject(projectId);
  const updateProject = useUpdateProject();
  const { actor } = useActor();

  const [frames, setFrames] = useState<LocalFrame[]>([]);
  const [selectedFrameIdx, setSelectedFrameIdx] = useState(0);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIdx, setPlaybackIdx] = useState(0);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [addTextOpen, setAddTextOpen] = useState(false);
  const [newTextValue, setNewTextValue] = useState("");
  const [newTextStyle, setNewTextStyle] = useState<OverlayStyle>(
    OverlayStyle.normal,
  );
  const [newTextX, setNewTextX] = useState(50);
  const [newTextY, setNewTextY] = useState(50);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const blobUrlsRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (project) {
      setProjectTitle(project.title);
      setProjectDesc(project.description);
      const sorted = [...project.frames].sort(
        (a, b) => Number(a.order) - Number(b.order),
      );
      const withLocalUrls: LocalFrame[] = sorted.map((f) => ({
        ...f,
        localImageUrl: f.blobId.getDirectURL(),
      }));
      setFrames(withLocalUrls);
    }
  }, [project]);

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      for (const url of blobUrlsRef.current.values()) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  // Playback
  useEffect(() => {
    if (isPlaying && frames.length > 0) {
      const currentFrame = frames[playbackIdx];
      const duration = currentFrame ? Number(currentFrame.duration) : 500;
      const delay = duration / playSpeed;
      playIntervalRef.current = setInterval(() => {
        setPlaybackIdx((prev) => (prev + 1) % frames.length);
      }, delay);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, frames, playbackIdx, playSpeed]);

  const selectedFrame = frames[isPlaying ? playbackIdx : selectedFrameIdx];

  const handleAddFrame = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !actor) return;
    setIsUploading(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes);
      const localUrl = URL.createObjectURL(new Blob([bytes]));
      const frameId = genId();
      blobUrlsRef.current.set(frameId, localUrl);

      const newFrame: LocalFrame = {
        id: frameId,
        blobId: blob,
        duration: BigInt(500),
        order: BigInt(frames.length),
        textOverlays: [],
        effectType: EffectType.none,
        localImageUrl: localUrl,
      };

      setFrames((prev) => [...prev, newFrame]);
      setSelectedFrameIdx(frames.length);
      toast.success("Frame added!");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const updateSelectedFrame = useCallback(
    (updates: Partial<LocalFrame>) => {
      setFrames((prev) =>
        prev.map((f, i) => (i === selectedFrameIdx ? { ...f, ...updates } : f)),
      );
    },
    [selectedFrameIdx],
  );

  const handleDeleteFrame = (idx: number) => {
    setFrames((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return next.map((f, i) => ({ ...f, order: BigInt(i) }));
    });
    setSelectedFrameIdx((prev) => Math.min(prev, frames.length - 2));
  };

  const handleDeleteOverlay = (idx: number) => {
    if (!selectedFrame) return;
    const updated = selectedFrame.textOverlays.filter((_, i) => i !== idx);
    updateSelectedFrame({ textOverlays: updated });
  };

  const handleAddTextOverlay = () => {
    if (!newTextValue.trim() || !selectedFrame) return;
    const overlay: TextOverlay = {
      text: newTextValue.trim(),
      style: newTextStyle,
      x: BigInt(Math.round(newTextX)),
      y: BigInt(Math.round(newTextY)),
    };
    updateSelectedFrame({
      textOverlays: [...selectedFrame.textOverlays, overlay],
    });
    setAddTextOpen(false);
    setNewTextValue("");
    setNewTextStyle(OverlayStyle.normal);
    setNewTextX(50);
    setNewTextY(50);
    toast.success("Text overlay added");
  };

  const handleSave = async () => {
    if (!project) return;
    setIsSaving(true);
    try {
      await updateProject.mutateAsync({
        projectId,
        dto: {
          id: projectId,
          title: projectTitle,
          description: projectDesc,
          frames: frames.map((f, i) => ({
            ...f,
            order: BigInt(i),
          })),
        },
      });
      toast.success("Project saved!");
    } catch {
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlayPause = () => {
    if (!isPlaying) {
      setPlaybackIdx(selectedFrameIdx);
    }
    setIsPlaying((p) => !p);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setPlaybackIdx(0);
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        data-ocid="editor.loading_state"
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-background font-body flex flex-col"
      style={{ height: "100vh", overflow: "hidden" }}
    >
      {/* Top Toolbar */}
      <header className="flex-shrink-0 border-b border-border/40 glass-card z-20">
        <div className="flex items-center gap-3 px-4 h-14">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNavigateToDashboard}
            data-ocid="editor.back.button"
            className="w-8 h-8 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div className="flex-1">
            <input
              className="bg-transparent text-foreground font-display font-semibold text-base outline-none w-full max-w-xs border-b border-transparent focus:border-primary/50 transition-colors"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              data-ocid="editor.project_title.input"
              placeholder="Project Title"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSave}
              disabled={isSaving}
              data-ocid="editor.save.button"
              className="gap-1.5 border-border hover:border-primary/50"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              data-ocid="editor.export.button"
              className="gap-1.5 border-border hover:border-primary/50"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
          </div>
        </div>
      </header>

      {/* Main editor area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar: Frames */}
        <aside
          className="w-40 flex-shrink-0 border-r border-border/40 flex flex-col"
          style={{ background: "oklch(0.11 0.03 293)" }}
        >
          <div className="px-3 py-2.5 border-b border-border/40 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Frames
            </span>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1.5">
              {frames.length === 0 && (
                <div
                  data-ocid="editor.frames.empty_state"
                  className="text-center py-6"
                >
                  <Film className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No frames</p>
                </div>
              )}
              {frames.map((frame, idx) => (
                <button
                  type="button"
                  key={frame.id}
                  data-ocid={`editor.frame.item.${idx + 1}`}
                  onClick={() => {
                    if (!isPlaying) setSelectedFrameIdx(idx);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      if (!isPlaying) setSelectedFrameIdx(idx);
                    }
                  }}
                  className={`relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all group ${
                    idx === (isPlaying ? playbackIdx : selectedFrameIdx)
                      ? "border-primary glow-purple-sm"
                      : "border-transparent hover:border-border"
                  }`}
                >
                  <div
                    className="aspect-video bg-card flex items-center justify-center"
                    style={{ background: "oklch(0.13 0.04 293)" }}
                  >
                    {frame.localImageUrl ? (
                      <img
                        src={frame.localImageUrl}
                        alt={`Frame ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Film className="w-5 h-5 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-background/70 px-1.5 py-0.5 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {idx + 1}
                    </span>
                    <button
                      type="button"
                      data-ocid={`editor.frame.delete_button.${idx + 1}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFrame(idx);
                      }}
                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
          <div className="p-2 border-t border-border/40">
            <Button
              size="sm"
              onClick={handleAddFrame}
              disabled={isUploading}
              data-ocid="editor.add_frame.button"
              className="w-full gap-1.5 text-xs bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
            >
              {isUploading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Plus className="w-3 h-3" />
              )}
              {isUploading ? "Uploading..." : "Add Frame"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              data-ocid="editor.frame.upload_button"
            />
          </div>
        </aside>

        {/* Center canvas */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
            {selectedFrame ? (
              <div
                className="relative rounded-xl overflow-hidden border border-border max-h-full"
                style={{ maxWidth: "600px", width: "100%" }}
                data-ocid="editor.canvas_target"
              >
                <div className="relative aspect-video bg-card">
                  {selectedFrame.localImageUrl ? (
                    <motion.img
                      key={selectedFrame.id}
                      src={selectedFrame.localImageUrl}
                      alt="Frame"
                      className="w-full h-full object-contain"
                      animate={
                        isPlaying &&
                        selectedFrame.effectType === EffectType.zoom
                          ? { scale: [1, 1.1, 1] }
                          : isPlaying &&
                              selectedFrame.effectType === EffectType.impact
                            ? { x: [0, -4, 4, -2, 2, 0] }
                            : { scale: 1, x: 0 }
                      }
                      transition={{ duration: 0.5 }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <Image className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">
                          No image
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Effect overlay */}
                  <EffectOverlay
                    effect={selectedFrame.effectType}
                    isPlaying={isPlaying}
                  />

                  {/* Text overlays */}
                  {selectedFrame.textOverlays.map((overlay) => (
                    <TextOverlayRenderer
                      key={`${overlay.text}-${overlay.style}-${String(overlay.x)}-${String(overlay.y)}`}
                      overlay={overlay}
                    />
                  ))}
                </div>

                {/* Effect indicator badge */}
                {selectedFrame.effectType !== EffectType.none && (
                  <div className="absolute top-2 left-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-primary">
                      {EFFECT_LABELS[selectedFrame.effectType]}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div
                data-ocid="editor.canvas.empty_state"
                className="text-center"
              >
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center mx-auto mb-4">
                  <Film className="w-8 h-8 text-muted-foreground/30" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Add a frame to get started
                </p>
                <Button
                  className="mt-4 gap-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                  onClick={handleAddFrame}
                  size="sm"
                >
                  <Plus className="w-4 h-4" /> Add First Frame
                </Button>
              </div>
            )}
          </div>

          {/* Bottom Timeline */}
          <div
            className="flex-shrink-0 border-t border-border/40 p-3"
            style={{ background: "oklch(0.11 0.03 293)", minHeight: "80px" }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={handlePlayPause}
                data-ocid="editor.play_pause.button"
                className="w-8 h-8 text-muted-foreground hover:text-foreground"
                disabled={frames.length === 0}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleStop}
                data-ocid="editor.stop.button"
                className="w-8 h-8 text-muted-foreground hover:text-foreground"
                disabled={!isPlaying}
              >
                <Square className="w-4 h-4" />
              </Button>
              <Select
                value={String(playSpeed)}
                onValueChange={(v) => setPlaySpeed(Number(v))}
              >
                <SelectTrigger
                  className="w-24 h-7 text-xs border-border"
                  data-ocid="editor.play_speed.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">0.5×</SelectItem>
                  <SelectItem value="1">1×</SelectItem>
                  <SelectItem value="2">2×</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground ml-auto">
                {frames.length} frame{frames.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Frame thumbnails timeline */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {frames.map((frame, idx) => (
                <button
                  type="button"
                  key={frame.id}
                  data-ocid={`editor.timeline.item.${idx + 1}`}
                  onClick={() => {
                    if (!isPlaying) setSelectedFrameIdx(idx);
                  }}
                  className={`flex-shrink-0 relative rounded cursor-pointer border transition-all ${
                    idx === (isPlaying ? playbackIdx : selectedFrameIdx)
                      ? "border-primary"
                      : "border-border hover:border-border/80"
                  }`}
                  style={{
                    width: `${Math.max(40, Number(frame.duration) / 20)}px`,
                    height: "40px",
                  }}
                >
                  {frame.localImageUrl ? (
                    <img
                      src={frame.localImageUrl}
                      alt={`F${idx + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full bg-card rounded flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">
                        {idx + 1}
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </main>

        {/* Right sidebar: Effects & Properties */}
        <aside
          className="w-56 flex-shrink-0 border-l border-border/40 flex flex-col"
          style={{ background: "oklch(0.11 0.03 293)" }}
        >
          <div className="px-3 py-2.5 border-b border-border/40 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Properties
            </span>
          </div>

          <ScrollArea className="flex-1">
            {selectedFrame ? (
              <div className="p-3 space-y-4">
                {/* Effect Type */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Effect
                  </Label>
                  <Select
                    value={selectedFrame.effectType}
                    onValueChange={(v) =>
                      updateSelectedFrame({ effectType: v as EffectType })
                    }
                  >
                    <SelectTrigger
                      className="h-8 text-xs border-border"
                      data-ocid="editor.effect_type.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(EffectType).map((e) => (
                        <SelectItem key={e} value={e}>
                          {EFFECT_LABELS[e]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Duration: {Number(selectedFrame.duration)}ms
                  </Label>
                  <Slider
                    min={100}
                    max={2000}
                    step={50}
                    value={[Number(selectedFrame.duration)]}
                    onValueChange={([v]) =>
                      updateSelectedFrame({ duration: BigInt(v) })
                    }
                    data-ocid="editor.duration.slider"
                    className="mt-1"
                  />
                </div>

                {/* Text Overlays */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                      Text Overlays
                    </Label>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-6 h-6 text-primary"
                      onClick={() => setAddTextOpen(true)}
                      data-ocid="editor.add_text.button"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {selectedFrame.textOverlays.length === 0 && (
                    <p className="text-xs text-muted-foreground/60 italic">
                      No text overlays
                    </p>
                  )}

                  {selectedFrame.textOverlays.map((overlay, i) => (
                    <div
                      key={`${overlay.text}-${overlay.style}-${i}`}
                      data-ocid={`editor.text_overlay.item.${i + 1}`}
                      className="flex items-start gap-1.5 p-2 rounded-lg border border-border bg-card/50 group"
                    >
                      <Type className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground truncate">
                          {overlay.text}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {OVERLAY_STYLE_LABELS[overlay.style]}
                        </p>
                      </div>
                      <button
                        type="button"
                        data-ocid={`editor.text_overlay.delete_button.${i + 1}`}
                        onClick={() => handleDeleteOverlay(i)}
                        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                className="p-4 text-center"
                data-ocid="editor.properties.empty_state"
              >
                <p className="text-xs text-muted-foreground">
                  Select a frame to edit properties
                </p>
              </div>
            )}
          </ScrollArea>
        </aside>
      </div>

      {/* Add Text Dialog */}
      <Dialog open={addTextOpen} onOpenChange={setAddTextOpen}>
        <DialogContent
          className="glass-card border-border"
          data-ocid="editor.add_text.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Add Text Overlay</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Text</Label>
              <Input
                placeholder="Enter text..."
                value={newTextValue}
                onChange={(e) => setNewTextValue(e.target.value)}
                data-ocid="editor.text_overlay.input"
              />
            </div>
            <div className="space-y-2">
              <Label>Style</Label>
              <Select
                value={newTextStyle}
                onValueChange={(v) => setNewTextStyle(v as OverlayStyle)}
              >
                <SelectTrigger data-ocid="editor.text_style.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(OverlayStyle).map((s) => (
                    <SelectItem key={s} value={s}>
                      {OVERLAY_STYLE_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>X Position ({newTextX}%)</Label>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[newTextX]}
                  onValueChange={([v]) => setNewTextX(v)}
                  data-ocid="editor.text_x.slider"
                />
              </div>
              <div className="space-y-2">
                <Label>Y Position ({newTextY}%)</Label>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[newTextY]}
                  onValueChange={([v]) => setNewTextY(v)}
                  data-ocid="editor.text_y.slider"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setAddTextOpen(false)}
              data-ocid="editor.add_text.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTextOverlay}
              disabled={!newTextValue.trim()}
              data-ocid="editor.add_text.confirm_button"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Add Overlay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
