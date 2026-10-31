"use client";

import { useState } from "react";
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

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [state, setState] = useState<SummonState>("idle");
  const [ghost, setGhost] = useState<RepoGhost | null>(null);

  const handleSummon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    setState("loading");
    setTimeout(() => {
      setGhost({
        owner: "octocat",
        name: "Hello-World",
        epitaph: "Left to wither in the void after the initial release sprint.",
        dormantDays: 1460,
        lastCommit: "October 31, 2022",
        stalePRs: 29,
        causeOfDeath: "Terminal Scope Creep",
        starsBuried: 412,
        originalUrl: repoUrl,
      });
      setState("summoned");
    }, 1000);
  };

  const handleReset = () => {
    setState("idle");
    setGhost(null);
    setRepoUrl("");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#a1a1aa] flex flex-col items-center justify-start sm:justify-center px-4 py-16 sm:py-24 relative overflow-hidden">
      <main className="w-full max-w-sm flex flex-col items-center space-y-8 z-10">
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

        <form onSubmit={handleSummon} className="w-full">
          <div className="flex items-center w-full rounded-full bg-zinc-950/80 border border-zinc-800/80 p-1.5 pl-4 transition-all duration-300 focus-within:border-white/40 focus-within:ring-1 focus-within:ring-white/10 shadow-2xl backdrop-blur-md">
            <Search className="w-4 h-4 text-zinc-500 shrink-0" />
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="GitHub Repository URL..."
              className="w-full bg-transparent px-3 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none font-mono"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition-all shrink-0 cursor-pointer"
            >
              <Ghost className="w-3.5 h-3.5" />
              <span>Summon</span>
            </button>
          </div>
        </form>

        <AnimatePresence mode="wait">
          {state === "summoned" && ghost && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="w-full rounded-3xl backdrop-blur-md bg-white/5 border border-white/10 p-6 shadow-2xl relative overflow-hidden flex flex-col space-y-6"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-11 h-11 rounded-2xl bg-zinc-900/90 border border-white/10 flex items-center justify-center text-zinc-200">
                  <Ghost className="w-6 h-6 text-zinc-300" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  Status: Deceased
                </div>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-xl font-semibold tracking-tight text-zinc-100">{ghost.name}</h2>
                <p className="text-xs text-zinc-400 leading-relaxed">&ldquo;{ghost.epitaph}&rdquo;</p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs">
                  <span className="text-zinc-400">Buried</span>
                  <span className="font-mono text-zinc-200 text-[11px]">{ghost.dormantDays} days ago</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
