import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  Layers,
  Play,
  Share2,
  Sparkles,
  Type,
  Upload,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface LandingProps {
  onNavigateToDashboard: () => void;
}

const FEATURES = [
  {
    icon: Upload,
    title: "Panel Upload",
    desc: "Import your manga panels and artwork directly from your device. Supports JPG, PNG, and WebP formats.",
  },
  {
    icon: Zap,
    title: "Animation Effects",
    desc: "Apply cinematic effects — speed lines, impact frames, zoom bursts, and flash cuts.",
  },
  {
    icon: Type,
    title: "Text Overlays",
    desc: "Add SFX, shout boxes, speech bubbles, and normal captions with full style control.",
  },
  {
    icon: Share2,
    title: "Export & Share",
    desc: "Export your animation as a shareable link or download as a video clip or GIF.",
  },
];

const WORKFLOW_STEPS = [
  "Upload your manga panels or artwork",
  "Apply speed lines, zoom, flash, and impact effects",
  "Add text overlays: SFX, speech bubbles, shouts",
  "Preview your animation in real-time and export",
];

const GALLERY_ITEMS = [
  {
    src: "/assets/generated/gallery-action.dim_600x400.jpg",
    caption: "Action Battle Sequence",
    tag: "Speed Lines",
  },
  {
    src: "/assets/generated/gallery-portrait.dim_600x400.jpg",
    caption: "Emotional Portrait Edit",
    tag: "Zoom Effect",
  },
  {
    src: "/assets/generated/gallery-cityscape.dim_600x400.jpg",
    caption: "Cyberpunk Cityscape",
    tag: "Impact Frame",
  },
];

export default function Landing({ onNavigateToDashboard }: LandingProps) {
  const { login, loginStatus, identity } = useInternetIdentity();

  const handleStart = () => {
    if (identity) {
      onNavigateToDashboard();
    } else {
      login();
    }
  };

  return (
    <div className="min-h-screen bg-background font-body overflow-x-hidden">
      {/* Sticky Nav */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 glass-card">
        <div className="container mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">
              AniPulse Studio
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {["Features", "Gallery", "Workflow", "Get Started"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                data-ocid={`nav.${item.toLowerCase().replace(" ", "-")}.link`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {!identity && (
              <Button
                variant="ghost"
                size="sm"
                onClick={login}
                data-ocid="nav.signin.button"
                className="text-muted-foreground hover:text-foreground"
              >
                Sign In
              </Button>
            )}
            {identity && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onNavigateToDashboard}
                data-ocid="nav.dashboard.button"
                className="text-muted-foreground hover:text-foreground"
              >
                Dashboard
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleStart}
              data-ocid="nav.start_creating.button"
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-5"
              disabled={loginStatus === "logging-in"}
            >
              Start Creating
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          {/* Background starfield */}
          <div className="absolute inset-0 starfield opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5" />

          <div className="container mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">
                  Anime & Manga Animation Studio
                </span>
              </div>

              <h1 className="font-display font-extrabold text-5xl lg:text-6xl xl:text-7xl leading-none mb-4 uppercase tracking-tight">
                <span className="text-foreground">BRING YOUR</span>
                <br />
                <span className="text-foreground">MANGA</span>
                <br />
                <span
                  className="text-glow-purple"
                  style={{ color: "oklch(0.65 0.31 293)" }}
                >
                  TO LIFE.
                </span>
              </h1>
              <h2
                className="font-display font-bold text-3xl lg:text-4xl uppercase tracking-tight mb-6 text-glow-magenta"
                style={{ color: "oklch(0.75 0.27 345)" }}
              >
                ANIMATE LIKE A PRO.
              </h2>

              <p className="text-base text-muted-foreground max-w-md mb-8 leading-relaxed">
                AniPulse Studio gives you the power to transform static manga
                panels into dynamic animations with cinematic effects, text
                overlays, and seamless exports.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={handleStart}
                  data-ocid="hero.launch_editor.button"
                  className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 glow-purple-sm transition-all"
                  disabled={loginStatus === "logging-in"}
                >
                  {loginStatus === "logging-in"
                    ? "Connecting..."
                    : "Launch Editor (Free Trial)"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  data-ocid="hero.watch_tutorial.button"
                  className="rounded-full border-border hover:border-primary/60 hover:bg-primary/10 gap-2"
                >
                  <Play className="w-4 h-4" />
                  Watch Tutorial
                </Button>
              </div>
            </motion.div>

            {/* Right: Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              className="relative flex justify-center"
            >
              {/* Comic burst shapes */}
              <div className="absolute -top-8 -left-8 w-16 h-16 border-2 border-primary/30 rotate-12 rounded-sm" />
              <div className="absolute -bottom-8 -right-8 w-12 h-12 border-2 border-secondary/30 -rotate-6 rounded-sm" />
              <div className="absolute top-1/4 -right-4 text-primary/40 text-4xl font-bold">
                ✦
              </div>
              <div className="absolute bottom-1/4 -left-4 text-secondary/40 text-2xl font-bold">
                ✦
              </div>
              <div className="absolute top-0 right-1/4 text-primary/30 text-xl">
                ★
              </div>

              {/* Editor mockup */}
              <div className="relative w-full max-w-lg">
                <div className="rounded-xl overflow-hidden glow-purple border border-primary/30">
                  <img
                    src="/assets/generated/hero-editor-mockup.dim_800x500.jpg"
                    alt="AniPulse Studio Editor"
                    className="w-full"
                  />
                </div>
                <div className="mt-3 text-center text-sm text-muted-foreground tracking-widest uppercase">
                  Easy, Powerful, Dynamic.
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent" />
          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-14"
            >
              <h2 className="font-display font-bold text-3xl lg:text-4xl uppercase tracking-wider text-foreground">
                Core Features
              </h2>
              <p className="mt-3 text-muted-foreground">
                Everything you need to animate your manga masterpiece
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="glass-card rounded-xl p-6 hover:border-primary/40 transition-all hover:glow-purple-sm group"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center mb-4 group-hover:bg-primary/25 transition-colors">
                    <f.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-base text-foreground mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section id="workflow" className="py-24">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="rounded-xl overflow-hidden glow-purple border border-primary/30">
                  <img
                    src="/assets/generated/hero-editor-mockup.dim_800x500.jpg"
                    alt="Studio workflow"
                    className="w-full opacity-90"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h2 className="font-display font-bold text-3xl lg:text-4xl uppercase tracking-wider text-foreground mb-8">
                  STUDIO
                  <br />
                  <span
                    style={{ color: "oklch(0.65 0.31 293)" }}
                    className="text-glow-purple"
                  >
                    WORKFLOW
                  </span>
                </h2>
                <div className="space-y-4">
                  {WORKFLOW_STEPS.map((step) => (
                    <div key={step} className="flex items-start gap-3">
                      <CheckCircle2
                        className="w-5 h-5 mt-0.5 flex-shrink-0"
                        style={{ color: "oklch(0.65 0.31 293)" }}
                      />
                      <p className="text-muted-foreground leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
                <Button
                  className="mt-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 gap-2"
                  onClick={handleStart}
                  data-ocid="workflow.get_started.button"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section id="gallery" className="py-24">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-14"
            >
              <h2 className="font-display font-bold text-3xl lg:text-4xl uppercase tracking-wider text-foreground">
                GALLERY
              </h2>
              <p className="mt-3 text-muted-foreground">
                See what creators are building with AniPulse Studio
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {GALLERY_ITEMS.map((item, i) => (
                <motion.div
                  key={item.caption}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="group cursor-pointer"
                  data-ocid={`gallery.item.${i + 1}`}
                >
                  <div className="rounded-xl overflow-hidden border border-border group-hover:border-primary/50 transition-all group-hover:glow-purple-sm">
                    <img
                      src={item.src}
                      alt={item.caption}
                      className="w-full aspect-[3/2] object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between px-1">
                    <span className="text-sm font-medium text-foreground">
                      {item.caption}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full border border-primary/40 text-primary bg-primary/10">
                      {item.tag}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="get-started" className="py-24">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card rounded-2xl border border-primary/30 overflow-hidden relative"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.13 0.055 293 / 0.9) 0%, oklch(0.11 0.04 315 / 0.9) 100%)",
              }}
            >
              <div className="absolute inset-0 starfield opacity-30" />
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-10 lg:p-14">
                <div className="rounded-lg overflow-hidden border border-primary/20">
                  <img
                    src="/assets/generated/hero-editor-mockup.dim_800x500.jpg"
                    alt="Get started"
                    className="w-full opacity-80"
                  />
                </div>
                <div>
                  <h2 className="font-display font-bold text-4xl lg:text-5xl uppercase tracking-wider text-foreground mb-4">
                    GET
                    <br />
                    <span
                      style={{ color: "oklch(0.65 0.31 293)" }}
                      className="text-glow-purple"
                    >
                      STARTED
                    </span>
                  </h2>
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    Join thousands of manga creators and anime editors. Sign in
                    with Internet Identity for a free account — no credit card
                    required.
                  </p>
                  <Button
                    size="lg"
                    onClick={handleStart}
                    data-ocid="cta.start_animating.button"
                    className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-10 py-6 text-base glow-purple transition-all"
                    disabled={loginStatus === "logging-in"}
                  >
                    {loginStatus === "logging-in"
                      ? "Connecting..."
                      : "Start Animating"}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="font-display font-bold text-sm">
                  AniPulse Studio
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The professional anime & manga animation platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3 text-foreground">
                Product
              </h4>
              <ul className="space-y-2">
                {["Features", "Gallery", "Pricing", "Changelog"].map((l) => (
                  <li key={l}>
                    <a
                      href="/#"
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3 text-foreground">
                Support
              </h4>
              <ul className="space-y-2">
                {["Documentation", "Tutorials", "Community", "Contact"].map(
                  (l) => (
                    <li key={l}>
                      <a
                        href="/#"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {l}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3 text-foreground">
                Legal
              </h4>
              <ul className="space-y-2">
                {["Privacy", "Terms", "Licenses"].map((l) => (
                  <li key={l}>
                    <a
                      href="/#"
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-6 text-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()}. Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
