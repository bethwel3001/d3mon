import { Ghost } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center select-none bg-[#050505] text-[#a1a1aa]">
      <div className="relative flex flex-col items-center max-w-lg space-y-6">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 shadow-2xl text-zinc-300">
          <Ghost className="w-8 h-8 animate-pulse text-zinc-200" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-100">
            Ghost in the Git
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 font-normal leading-relaxed">
            Uncovering forgotten code, haunted branches, and repo spirits.
          </p>
        </div>
      </div>
    </main>
  );
}
