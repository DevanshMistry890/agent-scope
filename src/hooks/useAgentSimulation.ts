import { useState, useEffect } from 'react';
import type { TraceSpan, AgentMetric, SimulationConfig } from '../lib/types';
import { generateNextSpan } from '../lib/simulationEngine';

type Props = {
    simulationStatus: 'idle' | 'running' | 'paused';
    config: SimulationConfig;
    onSpan?: (span: TraceSpan) => void;
    onMetricsUpdate?: (metrics: AgentMetric) => void;
    onStop?: () => void;
}

export const useAgentSimulation = ({ simulationStatus, config, onSpan, onMetricsUpdate, onStop }: Props) => {
    // Internal state (fallback)
    const [spans, setSpans] = useState<TraceSpan[]>([]);
    const [metrics, setMetrics] = useState<AgentMetric>({
        totalTokens: 0,
        totalCost: 0,
        avgLatency: 0,
        errorRate: 0,
        timestamp: Date.now()
    });
    const [stepIndex, setStepIndex] = useState(0);

    // Reset when moving to IDLE (Stop)
    // Reset when moving to IDLE (Stop)
    useEffect(() => {
        if (simulationStatus === 'idle') {
            setStepIndex(0);
            // reset internal state
            setSpans([]);
            setMetrics({
                totalTokens: 0,
                totalCost: 0,
                avgLatency: 0,
                errorRate: 0,
                timestamp: Date.now()
            });

            // Trigger callback if provided (beware of loops if parent re-creates callback)
            if (onStop) onStop();
        }
    }, [simulationStatus, onStop]);

    useEffect(() => {
        if (simulationStatus !== 'running') return;

        const interval = setInterval(() => {
            const newSpan = generateNextSpan(stepIndex, config);

            // Ignore 'wait' steps
            if (newSpan.type !== 'wait' as any) {
                if (onSpan) {
                    onSpan(newSpan);
                } else {
                    setSpans(prev => [newSpan, ...prev].slice(0, 50));
                }

                setMetrics(prev => {
                    const nextMetrics = {
                        totalTokens: prev.totalTokens + (newSpan.tokenCount || 0),
                        totalCost: prev.totalCost + (newSpan.cost || 0),
                        avgLatency: (prev.avgLatency * 0.9) + ((newSpan.latencyMs || 0) * 0.1),
                        errorRate: newSpan.type === 'error' ? prev.errorRate + 1 : prev.errorRate,
                        timestamp: Date.now()
                    };
                    if (onMetricsUpdate) {
                        onMetricsUpdate(nextMetrics);
                    }
                    return nextMetrics;
                });
            }

            setStepIndex(prev => prev + 1);
        }, 2000);

        return () => clearInterval(interval);
    }, [simulationStatus, stepIndex, config, onSpan, onMetricsUpdate]);

    return { spans, metrics };
};
