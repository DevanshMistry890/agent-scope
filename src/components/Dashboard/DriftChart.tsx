import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TraceSpan } from '../../lib/types';
import { Activity } from 'lucide-react';

export function DriftChart({ spans }: { spans: TraceSpan[] }) {
    // Transform spans to chart data - reverse to show oldest to newest left to right if we want time progression
    // Or just take the last 20 agent/tool spans with latency
    const chartData = [...spans]
        .reverse()
        .slice(-30) // Take last 30 spans regardless of latency, to show full timeline
        .map((s, i) => ({
            name: i,
            latency: s.latencyMs || 0, // Default to 0 if valid span but no latency
            drift: s.metadata?.drift ? parseFloat(String(s.metadata.drift)) * 100 : 0,
        }));

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col h-[300px]">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-200 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-gray-500" />
                    Latency & Drift
                </h3>
                <div className="flex gap-4 text-[10px] font-mono">
                    <div className="flex items-center gap-1.5 text-indigo-400">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        LATENCY (ms)
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-400">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        DRIFT (%)
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorDrift" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                        <XAxis dataKey="name" hide />
                        <YAxis
                            yAxisId="left"
                            stroke="#4b5563"
                            fontSize={10}
                            tickFormatter={(value) => `${value}ms`}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#f59e0b"
                            fontSize={10}
                            tickFormatter={(value) => `${value}%`}
                            domain={[0, 100]}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem', fontSize: '12px' }}
                            itemStyle={{ color: '#e5e7eb' }}
                            labelStyle={{ display: 'none' }}
                        />
                        <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="latency"
                            stroke="#6366f1"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorLatency)"
                            isAnimationActive={false}
                        />
                        <Area
                            yAxisId="right"
                            type="monotone"
                            dataKey="drift"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorDrift)"
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
