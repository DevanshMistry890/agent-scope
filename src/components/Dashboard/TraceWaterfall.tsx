import type { TraceSpan } from '../../lib/types';
import { Terminal, Bot, User, AlertTriangle, Clock, Code } from 'lucide-react';
import { clsx } from 'clsx';

interface TraceWaterfallProps {
    spans: TraceSpan[];
}

export function TraceWaterfall({ spans }: TraceWaterfallProps) {
    if (spans.length === 0) {
        return (
            <div className="h-full glass-panel rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 space-y-3">
                <div className="p-3 bg-white/5 rounded-full">
                    <Terminal className="w-6 h-6 opacity-30" />
                </div>
                <p className="text-sm font-medium">Waiting for agent activity...</p>
                <span className="text-xs text-gray-600">Start simulation or query local model</span>
            </div>
        )
    }

    return (
        <div className="h-[400px] lg:h-full glass-panel rounded-xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                    <ActivityIcon />
                    Live Trace Stream
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full animate-pulse">
                    LIVE
                </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
                {spans.map((span) => (
                    <TraceItem key={span.id} span={span} />
                ))}
            </div>
        </div>
    );
}

function ActivityIcon() {
    return (
        <div className="flex gap-0.5 items-end h-3">
            <div className="w-0.5 h-1 bg-indigo-500 animate-[bounce_1s_infinite]"></div>
            <div className="w-0.5 h-2 bg-indigo-500 animate-[bounce_1.2s_infinite]"></div>
            <div className="w-0.5 h-1.5 bg-indigo-500 animate-[bounce_0.8s_infinite]"></div>
        </div>
    )
}

function TraceItem({ span }: { span: TraceSpan }) {
    const isError = span.type === 'error';
    const isTool = span.type === 'tool';
    const isUser = span.type === 'user';

    return (
        <div className={clsx(
            "p-3 rounded-lg border text-sm transition-all duration-300 animate-in slide-in-from-top-2 fade-in relative group hover:scale-[1.01] hover:shadow-lg",
            isError ? "bg-red-500/10 border-red-500/30 text-red-200" :
                isTool ? "bg-gray-800/40 border-gray-700/50 font-mono text-xs text-blue-300" :
                    isUser ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-100 ml-4" :
                        "bg-gray-900/40 border-gray-800 text-gray-300 mr-4" // Agent
        )}>
            {/* Connector Line Logic could go here for threaded view */}

            <div className="flex items-start gap-3">
                <div className={clsx(
                    "mt-0.5 p-1.5 rounded-md backdrop-blur-sm",
                    isError ? "bg-red-500/20 text-red-400" :
                        isTool ? "bg-blue-500/10 text-blue-400" :
                            isUser ? "bg-indigo-500/20 text-indigo-400" :
                                "bg-emerald-500/10 text-emerald-400"
                )}>
                    {isError ? <AlertTriangle className="w-3.5 h-3.5" /> :
                        isTool ? <Code className="w-3.5 h-3.5" /> :
                            isUser ? <User className="w-3.5 h-3.5" /> :
                                <Bot className="w-3.5 h-3.5" />}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <span className={clsx("text-[10px] font-bold uppercase tracking-wider opacity-70",
                            isError ? "text-red-400" : "text-gray-500"
                        )}>
                            {span.type}
                        </span>
                        <span className="text-[10px] font-mono text-gray-600 flex items-center gap-1">
                            {span.latencyMs && <span>{span.latencyMs}ms</span>}
                            {span.latencyMs && <Clock className="w-2.5 h-2.5" />}
                        </span>
                    </div>

                    <p className={clsx(
                        "break-words leading-relaxed",
                        isTool && "font-mono opacity-90"
                    )}>
                        {span.content}
                    </p>

                    {span.metadata && (
                        <div className="mt-2 flex items-center gap-2">
                            {Object.entries(span.metadata).map(([k, v]) => (
                                <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-gray-500 font-mono">
                                    {k}: {v}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
