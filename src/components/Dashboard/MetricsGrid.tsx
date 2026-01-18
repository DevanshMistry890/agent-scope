import { DollarSign, Zap, Activity } from 'lucide-react';
import type { AgentMetric } from '../../lib/types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface MetricsGridProps {
    metrics: AgentMetric;
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <MetricCard
                title="Total Spend"
                value={`$${metrics.totalCost.toFixed(4)}`}
                icon={DollarSign}
                color="text-emerald-400"
                bg="bg-emerald-500/10"
                border="border-emerald-500/20"
            />
            <MetricCard
                title="Avg Latency"
                value={`${Math.round(metrics.avgLatency)}ms`}
                icon={Activity}
                color="text-blue-400"
                bg="bg-blue-500/10"
                border="border-blue-500/20"
            />
            <MetricCard
                title="Total Tokens"
                value={metrics.totalTokens.toLocaleString()}
                icon={Zap}
                color="text-amber-400"
                bg="bg-amber-500/10"
                border="border-amber-500/20"
            />
        </div>
    );
}

interface MetricCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    border: string;
}

function MetricCard({ title, value, icon: Icon, color, bg, border }: MetricCardProps) {
    return (
        <div className={twMerge("bg-[#0A0A0A] border rounded-xl p-5 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300", border)}>
            {/* Ambient Glow - Reduced opacity and blur for sharpness */}
            <div className={clsx("absolute -right-6 -top-6 w-24 h-24 rounded-full blur-[40px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity", bg.replace('/10', '/50'))}></div>

            <div className="flex items-start justify-between relative z-10">
                <div>
                    <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{title}</h3>
                    <p className={clsx("text-2xl font-bold font-mono tracking-tight", color)}>{value}</p>
                </div>
                <div className={clsx("p-2 rounded-lg bg-opacity-20", bg)}>
                    <Icon className={clsx("w-5 h-5", color)} />
                </div>
            </div>

            {/* Decorative line */}
            <div className={clsx("absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-30 transition-opacity", color)}></div>
        </div>
    );
}
