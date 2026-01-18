import { Bot, Cpu, Download, Play, X } from 'lucide-react';

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRunSimulation: () => void;
    onTestLocalAI: () => void;
}

export function OnboardingModal({ isOpen, onClose, onRunSimulation, onTestLocalAI }: OnboardingModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-2xl w-full shadow-2xl p-0 overflow-hidden relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 pb-6">
                    <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Welcome to AgentScope</h2>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-lg">
                        A client-side Agent Observability platform. Monitor traces, costs, and drift in real-time.
                        All data processing happens locally in your browser.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-8 pt-0">
                    {/* Path A: Simulation */}
                    <button
                        onClick={onRunSimulation}
                        className="group relative flex flex-col gap-4 p-6 rounded-xl bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 hover:border-indigo-500/50 hover:from-indigo-500/20 transition-all text-left"
                    >
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                            <Bot className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="font-semibold text-white mb-1 flex items-center gap-2">
                                Run Simulation Demo
                                <Play className="w-3 h-3 opacity-50" />
                            </div>
                            <p className="text-xs text-indigo-200/60 leading-relaxed">
                                Instant demo with simulated agents. Watch traces flow and manipulate chaos parameters.
                            </p>
                        </div>
                    </button>

                    {/* Path B: Local AI */}
                    <button
                        onClick={onTestLocalAI}
                        className="group relative flex flex-col gap-4 p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 hover:border-emerald-500/50 hover:from-emerald-500/20 transition-all text-left"
                    >
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            <Cpu className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="font-semibold text-white mb-1 flex items-center gap-2">
                                Test Local AI (WebGPU)
                                <Download className="w-3 h-3 opacity-50" />
                            </div>
                            <p className="text-xs text-emerald-200/60 leading-relaxed">
                                Run a real SLM (~80MB download) in-browser. Auto-starts flexible mode loop.
                            </p>
                        </div>
                    </button>
                </div>

                <div className="p-4 bg-gray-950/50 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-500 font-mono uppercase tracking-wider px-8">
                    <span>v0.9.4 Beta</span>
                    <span>Powered by React + Transformers.js</span>
                </div>
            </div>
        </div>
    );
}
