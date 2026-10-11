import React, { useState, useEffect } from 'react';
import { Sparkles, Sun, Zap, Globe, Compass, Check } from 'lucide-react';
import { ATMOSPHERE_PALETTES } from './ThreeBackground';

export default function AtmosphereSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState('aurora');

  useEffect(() => {
    const saved = localStorage.getItem('workmark_atmosphere');
    if (saved && ATMOSPHERE_PALETTES[saved]) {
      setActiveTheme(saved);
    }
  }, []);

  const handleSelect = (key) => {
    setActiveTheme(key);
    localStorage.setItem('workmark_atmosphere', key);
    window.dispatchEvent(
      new CustomEvent('workmark-atmosphere-change', {
        detail: { theme: key }
      })
    );
    setIsOpen(false);
  };

  const current = ATMOSPHERE_PALETTES[activeTheme] || ATMOSPHERE_PALETTES.aurora;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-void-900/90 border border-brand-cyan/40 hover:border-brand-cyan text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-lg shadow-brand-cyan/10 group"
        title="Switch 3D Light Atmosphere"
      >
        <span
          className="w-2.5 h-2.5 rounded-full animate-ping"
          style={{ backgroundColor: current.primary }}
        />
        <Sparkles className="w-3.5 h-3.5 text-brand-cyan group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline font-mono text-[11px] text-brand-cyan font-bold">
          3D Light:
        </span>
        <span className="hidden sm:inline text-[11px] text-white">
          {current.name.split(' ')[0]}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl glass-panel hologram-border p-3 shadow-2xl z-50 animate-fade-in bg-void-950/95 border border-slate-700/80">
          <div className="p-2 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-brand-cyan" />
              <h4 className="text-xs font-bold text-white">3D Lighting Atmosphere</h4>
            </div>
            <span className="text-[10px] text-brand-cyan font-mono font-bold bg-brand-cyan/20 px-1.5 py-0.5 rounded">
              WebGL Realtime
            </span>
          </div>

          <div className="py-2 space-y-1">
            {Object.entries(ATMOSPHERE_PALETTES).map(([key, item]) => {
              const isSelected = activeTheme === key;
              return (
                <button
                  key={key}
                  onClick={() => handleSelect(key)}
                  className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-void-900 border border-brand-cyan/50 text-white'
                      : 'hover:bg-void-900/60 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Color Swatch */}
                    <div className="flex items-center -space-x-1">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-void-950 shadow"
                        style={{ backgroundColor: item.primary }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-void-950 shadow"
                        style={{ backgroundColor: item.secondary }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-void-950 shadow"
                        style={{ backgroundColor: item.accent }}
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold">{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Speed: {item.waveSpeed}x · Light: {item.lightIntensity}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-brand-cyan" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 text-center">
            <p className="text-[10px] text-slate-500 font-mono">
              Hover cursor across screen to direct 3D light beacon
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
