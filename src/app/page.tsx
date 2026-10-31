"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ghost,
  Search,
  Loader2,
  GitBranch,
  GitPullRequest,
  Skull,
  Calendar,
  ExternalLink,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Volume2,
  VolumeX,
} from "lucide-react";

type SummonState = "idle" | "loading" | "summoned";

interface RepoGhost {
  name: string;
  owner: string;
  epitaph: string;
  dormantDays: number;
  lastCommit: string;
  stalePRs: number;
  causeOfDeath: string;
  starsBuried: number;
  originalUrl: string;
}

/**
 * Custom hook for smooth typewriter effect
 */
function useTypewriter(text: string, speedMs: number = 24) {
  const [displayedText, setDisplayedText] = useState("");
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setIsDone(false);
    if (!text) return;

    let index = 0;
    const timer = setInterval(() => {
      index++;
      if (index <= text.length) {
        setDisplayedText(text.slice(0, index));
      } else {
        setIsDone(true);
        clearInterval(timer);
      }
    }, speedMs);

    return () => clearInterval(timer);
  }, [text, speedMs]);

  return { displayedText, isDone };
}

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [state, setState] = useState<SummonState>("idle");
  const [ghost, setGhost] = useState<RepoGhost | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSummon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    setState("loading");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/summon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: repoUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "The repository spirits refused to awaken.");
      }

      const commitDate = data.lastCommitDate ? new Date(data.lastCommitDate) : new Date();
      const diffTime = Math.abs(Date.now() - commitDate.getTime());
      const dormantDays = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

      setGhost({
        owner: data.owner,
        name: data.repo,
        epitaph: data.ghostMessage,
        dormantDays,
        lastCommit: commitDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        stalePRs: data.commits?.length || 5,
        causeOfDeath: dormantDays > 730 ? "Deep Rot & Abandonment" : "Terminal Scope Creep",
        starsBuried: data.stars || 0,
        originalUrl: `https://github.com/${data.owner}/${data.repo}`,
      });

      setState("summoned");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to channel repository spirit.");
      setState("idle");
    }
  };

  const handleReset = () => {
    setState("idle");
    setGhost(null);
    setRepoUrl("");
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#a1a1aa] flex flex-col items-center justify-start sm:justify-center px-4 py-16 sm:py-24 relative overflow-hidden selection:bg-zinc-800 selection:text-zinc-200">
      {/* Background ambient spectral glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/[0.04] rounded-full blur-[128px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[32rem] h-64 bg-zinc-800/[0.05] rounded-full blur-[140px]" />

      <main className="w-full max-w-sm flex flex-col items-center space-y-8 z-10">
        {/* Minimalist Header */}
        <header className="flex flex-col items-center text-center space-y-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono tracking-wider text-zinc-400 uppercase">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Ghost in the Git
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-zinc-100">
            Summon Repository Spirits
          </h1>
          <p className="text-xs text-zinc-500 max-w-[260px] leading-relaxed">
            Unearth forgotten codebases, dormant commits, and abandoned branches.
          </p>
        </header>

        {/* Minimalist Pill Input Form */}
        <form onSubmit={handleSummon} className="w-full space-y-2">
          <div className="relative group">
            <div className="flex items-center w-full rounded-full bg-zinc-950/80 border border-zinc-800/80 p-1.5 pl-4 transition-all duration-300 focus-within:border-white/40 focus-within:ring-1 focus-within:ring-white/10 shadow-2xl backdrop-blur-md">
              <Search className="w-4 h-4 text-zinc-500 shrink-0 transition-colors group-focus-within:text-zinc-300" />
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="GitHub Repository URL..."
                className="w-full bg-transparent px-3 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none font-mono tracking-tight"
                disabled={state === "loading"}
              />
              <button
                type="submit"
                disabled={state === "loading" || !repoUrl.trim()}
                className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium bg-zinc-100 text-zinc-950 hover:bg-zinc-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 transition-all shadow-sm shrink-0 cursor-pointer"
              >
                {state === "loading" ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Summoning</span>
                  </>
                ) : (
                  <>
                    <Ghost className="w-3.5 h-3.5" />
                    <span>Summon</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-1.5 text-[11px] text-red-400 font-mono text-center pt-1"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </form>

        {/* Dynamic State Section */}
        <div className="w-full min-h-[380px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {state === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-zinc-800/60 rounded-3xl w-full text-zinc-600 space-y-3"
              >
                <div className="w-10 h-10 rounded-full bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-center text-zinc-500">
                  <Ghost className="w-5 h-5 opacity-60" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-mono text-zinc-400">Tomb Empty</p>
                  <p className="text-[11px] text-zinc-600">
                    Paste a GitHub repo above to wake its ghost
                  </p>
                </div>
              </motion.div>
            )}

            {/* Spooky Loading State */}
            {state === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center p-12 text-center w-full space-y-5"
              >
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-950/40">
                    <Ghost className="w-8 h-8 text-emerald-400 animate-pulse" />
                  </div>
                  <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-ping opacity-25" />
                </div>

                <div className="space-y-1.5 flex flex-col items-center">
                  {/* Fading in and out 'Crossing the veil...' */}
                  <motion.p
                    animate={{ opacity: [0.25, 1, 0.25] }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="text-xs font-mono tracking-widest text-emerald-400 uppercase font-medium"
                  >
                    Crossing the veil...
                  </motion.p>
                  <p className="text-[11px] text-zinc-600 font-mono">
                    Interrogating the ghost in the git
                  </p>
                </div>
              </motion.div>
            )}

            {state === "summoned" && ghost && (
              <GhostCard
                key="summoned"
                ghost={ghost}
                onDismiss={handleReset}
              />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function GhostCard({
  ghost,
  onDismiss,
}: {
  ghost: RepoGhost;
  onDismiss: () => void;
}) {
  const { displayedText, isDone } = useTypewriter(ghost.epitaph, 22);

  // Audio state
  const [voiceStatus, setVoiceStatus] = useState<"idle" | "loading" | "playing">("idle");
  const [audioNotice, setAudioNotice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayVoice = async () => {
    // If currently playing, stop it
    if (voiceStatus === "playing" && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setVoiceStatus("idle");
      return;
    }

    setVoiceStatus("loading");
    setAudioNotice(null);

    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: ghost.epitaph }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));

        // Graceful fallback: If ELEVENLABS_API_KEY is not configured yet,
        // use browser Web Speech API with an eerie low pitch so the user hears it immediately!
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(ghost.epitaph);
          utterance.pitch = 0.55; // Eerie deep tone
          utterance.rate = 0.85; // Slow deliberate ghostly pace
          utterance.onend = () => setVoiceStatus("idle");
          utterance.onerror = () => setVoiceStatus("idle");

          window.speechSynthesis.speak(utterance);
          setVoiceStatus("playing");
          if (errorData.isMissingKey) {
            setAudioNotice("Simulated ghostly voice (Add ELEVENLABS_API_KEY for ElevenLabs AI audio)");
          }
          return;
        }

        throw new Error(errorData.error || "Failed to generate audio stream");
      }

      // Convert audio stream to blob and play via native HTML5 Audio object
      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setVoiceStatus("idle");
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setVoiceStatus("idle");
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
      setVoiceStatus("playing");
    } catch (err: unknown) {
      setVoiceStatus("idle");
      setAudioNotice(err instanceof Error ? err.message : "Voice playback failed");
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full rounded-3xl backdrop-blur-md bg-white/5 border border-white/10 p-6 shadow-2xl relative overflow-hidden flex flex-col space-y-6"
    >
      {/* Subtle eerie ambient light inside card */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl" />

      {/* Card Header with Pulsing Status Badge */}
      <div className="flex items-start justify-between gap-2 relative z-10">
        <div className="w-11 h-11 rounded-2xl bg-zinc-900/90 border border-white/10 flex items-center justify-center text-zinc-200 shadow-inner">
          <Ghost className="w-6 h-6 text-zinc-300" />
        </div>

        {/* Pulsing Green 'Status: Deceased' Pill Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium tracking-tight bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 shadow-sm shadow-emerald-950/50">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Status: Deceased
        </div>
      </div>

      {/* Main Profile Info with Live Typewriter Ghost Message */}
      <div className="space-y-2 relative z-10">
        <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-500">
          <span>{ghost.owner}</span>
          <span>/</span>
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-zinc-100">
          {ghost.name}
        </h2>

        {/* Typewritten Ghost Lament */}
        <div className="pt-1.5 pb-0.5">
          <p className="text-xs text-zinc-300 font-mono leading-relaxed min-h-[4.5rem]">
            &ldquo;{displayedText}&rdquo;
            {!isDone && (
              <span className="inline-block w-1.5 h-3.5 bg-emerald-400 ml-1 animate-pulse align-middle" />
            )}
          </p>
        </div>

        {/* Play Voice Pill Button */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayVoice}
              type="button"
              disabled={voiceStatus === "loading"}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-emerald-500/30 text-[11px] font-mono text-zinc-300 hover:text-emerald-300 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              {voiceStatus === "loading" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Chanting...</span>
                </>
              ) : voiceStatus === "playing" ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="text-emerald-400">Silence Voice</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Play Voice</span>
                </>
              )}
            </button>

            {voiceStatus === "playing" && (
              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400/80">
                <span className="inline-block w-1 h-2 bg-emerald-400 animate-pulse" />
                <span className="inline-block w-1 h-3.5 bg-emerald-400 animate-pulse delay-75" />
                <span className="inline-block w-1 h-1.5 bg-emerald-400 animate-pulse delay-150" />
                Specter speaking
              </span>
            )}
          </div>

          {audioNotice && (
            <p className="text-[10px] text-zinc-500 font-mono leading-tight">
              {audioNotice}
            </p>
          )}
        </div>
      </div>

      {/* Mainstack-Style Stacked Metric Pills */}
      <div className="flex flex-col gap-2 relative z-10">
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            <span>Buried</span>
          </div>
          <span className="font-mono text-zinc-200 text-[11px]">
            {ghost.dormantDays} days ago
          </span>
        </div>

        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <Skull className="w-3.5 h-3.5 text-red-400/80" />
            <span>Cause of Death</span>
          </div>
          <span className="font-mono text-zinc-300 text-[11px]">
            {ghost.causeOfDeath}
          </span>
        </div>

        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <GitPullRequest className="w-3.5 h-3.5 text-zinc-500" />
            <span>Recent Burials</span>
          </div>
          <span className="font-mono text-zinc-200 text-[11px]">
            {ghost.stalePRs} commits analyzed
          </span>
        </div>

        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <GitBranch className="w-3.5 h-3.5 text-zinc-500" />
            <span>Last Rites Commit</span>
          </div>
          <span className="font-mono text-zinc-400 text-[11px]">
            {ghost.lastCommit}
          </span>
        </div>
      </div>

      {/* Actions: Mainstack-style Link & Reset */}
      <div className="flex flex-col gap-2 pt-1 relative z-10">
        <a
          href={ghost.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-full bg-zinc-100 text-zinc-950 font-medium text-xs hover:bg-zinc-200 active:scale-[0.99] transition-all shadow-sm"
        >
          <span>Visit Grave (GitHub)</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        <button
          onClick={onDismiss}
          type="button"
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-full text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] text-xs font-mono transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Summon Another Spirit</span>
        </button>
      </div>
    </motion.div>
  );
}
