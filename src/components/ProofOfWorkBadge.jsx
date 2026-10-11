import React from 'react';
import { ShieldCheck, Sparkles, Award } from 'lucide-react';

export default function ProofOfWorkBadge({
  score = 99.2,
  hash = '0x8f4c...b92a',
  level = 'Elite Master',
  compact = false
}) {
  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-brand-indigo/20 via-brand-cyan/20 to-brand-violet/20 border border-brand-cyan/30 text-xs font-semibold text-brand-cyan shadow-sm">
        <ShieldCheck className="w-3.5 h-3.5 text-brand-cyan animate-pulse" />
        <span>{score}</span>
        <span className="text-[10px] text-slate-400 font-mono">WM</span>
      </div>
    );
  }

  return (
    <div className="relative p-3.5 rounded-2xl glass-panel hologram-border overflow-hidden group">
      {/* Glow aura */}
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-brand-cyan/15 rounded-full blur-xl pointer-events-none group-hover:bg-brand-cyan/25 transition-all" />

      <div className="flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-indigo via-brand-cyan to-brand-violet flex items-center justify-center shadow-lg shadow-brand-indigo/30 transform group-hover:rotate-6 transition-transform">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Workmark Score</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-brand-cyan/20 text-brand-cyan font-mono font-bold">VERIFIED</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-brand-cyan font-mono tracking-tight">
                {score}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ 100 ({level})</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Proof Hash</div>
          <div className="text-xs font-mono text-brand-indigo font-semibold bg-void-900/60 px-2 py-0.5 rounded-lg border border-slate-700/50">
            {hash}
          </div>
        </div>
      </div>
    </div>
  );
}
