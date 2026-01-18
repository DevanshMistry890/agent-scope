import React, { useState } from 'react';
import { LayoutDashboard, Box, Zap, Info, Menu, X, ExternalLink } from 'lucide-react';

import type { SimulationConfig } from '../lib/types';

interface LayoutProps {
    children: React.ReactNode;
    config: SimulationConfig;
    onConfigChange: (config: SimulationConfig) => void;
    mode?: 'simulation' | 'local';
}

export function Layout({ children, config, onConfigChange, mode = 'simulation' }: LayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-950 text-white font-sans overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:bg-gray-900/50
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-14 border-b border-gray-800 flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <Box className="w-5 h-5 text-indigo-400" />
                        <span className="font-semibold text-sm tracking-wide">AGENTSCOPE</span>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden text-gray-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <NavItem icon={LayoutDashboard} label="Dashboard" active />
                </nav>

                <div className={`p-4 border-t border-white/5 space-y-4 transition-opacity duration-300 ${mode === 'local' ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'}`}>
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                        <Zap className="w-3 h-3 text-amber-500" />
                        Chaos Control
                    </h3>

                    <div className="space-y-4">
                        <div className="space-y-2 group">
                            <label className="text-[11px] font-medium text-gray-400 flex justify-between group-hover:text-gray-200 transition-colors">
                                Network Lag
                                <span className="text-indigo-400 font-mono">{config.latencyMultiplier.toFixed(1)}x</span>
                            </label>
                            <input
                                type="range"
                                min="0.5"
                                max="5"
                                step="0.1"
                                value={config.latencyMultiplier}
                                onChange={(e) => onConfigChange({ ...config, latencyMultiplier: Number(e.target.value) })}
                                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                            />
                        </div>

                        <div className="space-y-2 group">
                            <label className="text-[11px] font-medium text-gray-400 flex justify-between group-hover:text-gray-200 transition-colors">
                                Error Rate
                                <span className={config.errorRate > 0.1 ? "text-red-400 font-mono" : "text-emerald-400 font-mono"}>
                                    {(config.errorRate * 100).toFixed(0)}%
                                </span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="0.5"
                                step="0.05"
                                value={config.errorRate}
                                onChange={(e) => onConfigChange({ ...config, errorRate: Number(e.target.value) })}
                                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-400 transition-all"
                            />
                        </div>

                        <div className="space-y-2 group">
                            <label className="text-[11px] font-medium text-gray-400 flex justify-between group-hover:text-gray-200 transition-colors">
                                Drift Level
                                <span className={config.driftLevel > 0.5 ? "text-amber-400 font-mono" : "text-gray-400 font-mono"}>
                                    {config.driftLevel.toFixed(1)}
                                </span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={config.driftLevel}
                                onChange={(e) => onConfigChange({ ...config, driftLevel: Number(e.target.value) })}
                                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-white/5 text-[10px] text-gray-600 font-mono">
                    System v0.9.4 // REDSHIFT
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                <DelayedHeader config={config} onMenuClick={() => setIsMobileMenuOpen(true)} />

                <div className="flex-1 overflow-auto p-4 md:p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}



function DelayedHeader({ config, onMenuClick }: { config: SimulationConfig; onMenuClick: () => void }) {
    // Artificial lag for status updates to feel "real"
    const [displayStatus, setDisplayStatus] = React.useState({ error: false, highLatency: false });
    const [isAboutOpen, setIsAboutOpen] = React.useState(false);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDisplayStatus({
                error: config.errorRate > 0.1,
                highLatency: config.latencyMultiplier > 1.5
            });
        }, 1500); // 1.5s delay
        return () => clearTimeout(timer);
    }, [config.errorRate, config.latencyMultiplier]);

    return (
        <header className="h-14 border-b border-gray-800 flex items-center justify-between px-4 md:px-6 bg-gray-900/30">
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="md:hidden text-gray-400 hover:text-white"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center text-sm text-gray-400">
                    <span className="text-white font-medium">Live Monitoring</span>
                    {displayStatus.error && (
                        <span className="hidden sm:inline-block ml-4 px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse transition-all duration-500">
                            UNSTABLE NETWORK
                        </span>
                    )}
                </div>
            </div>

            {/* About / Creator Info */}
            <div className="flex items-center gap-3 relative">
                <button
                    onClick={() => setIsAboutOpen(!isAboutOpen)}
                    className={`flex items-center gap-2 text-xs transition-colors ${isAboutOpen ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                >
                    <Info className="w-4 h-4" />
                    About
                </button>

                {isAboutOpen && (
                    <div className="absolute top-10 right-0 w-80 bg-gray-900 border border-gray-800 rounded-lg shadow-xl p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                                <Box className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-white tracking-tight">AgentScope</h4>
                                <span className="text-[11px] text-gray-500 font-mono bg-gray-800/50 px-1.5 py-0.5 rounded">v0.9.4 Beta</span>
                            </div>
                        </div>

                        <div className="space-y-4 border-t border-gray-800 pt-4">
                            <div className="text-sm text-gray-400 flex flex-col gap-1.5">
                                <span className="text-[10px] uppercase tracking-wider text-gray-600 font-bold">Created By</span>
                                <a
                                    href="https://www.linkedin.com/in/devansh-mistry/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white font-medium hover:text-indigo-400 transition-colors flex items-center gap-2 group"
                                >
                                    Devansh Mistry
                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                                <a
                                    href="https://devanshmistry890.github.io/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-[11px]"
                                >
                                    View Portfolio
                                    <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                            </div>

                            <div className="text-xs text-gray-400 flex flex-col gap-1.5">
                                <span className="text-[10px] uppercase tracking-wider text-gray-600 font-bold">Stack</span>
                                <div className="flex flex-wrap gap-2">
                                    <span className="bg-gray-800 px-2 py-1 rounded text-gray-300">React</span>
                                    <span className="bg-gray-800 px-2 py-1 rounded text-gray-300">TypeScript</span>
                                    <span className="bg-gray-800 px-2 py-1 rounded text-gray-300">WebGPU</span>
                                    <span className="bg-gray-800 px-2 py-1 rounded text-gray-300">Tailwind</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="hidden sm:block h-3 w-px bg-gray-800"></div>
                <span className="hidden sm:inline text-xs text-gray-600 font-mono">
                    DEV: ON
                </span>
            </div>
        </header>
    );
}

function NavItem({ icon: Icon, label, active }: { icon: any, label: string, active?: boolean }) {
    return (
        <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${active ? 'bg-indigo-500/10 text-indigo-400' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}>
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );
}
