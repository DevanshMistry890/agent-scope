import type { TraceSpan, SimulationConfig } from './types';

// A pre-defined "scenario" the agent will act out loop
const SCENARIO_STEPS = [
    { type: 'user', content: "Can you analyze the sales data for Q3?", latency: 0 },
    { type: 'agent', content: "Thinking... identifying necessary tools.", latency: 450, tokens: 20 },
    { type: 'tool', content: "Tool Call: Database.query('SELECT * FROM sales WHERE quarter=3')", latency: 1200, tokens: 55 },
    { type: 'tool', content: "Tool Result: Returned 1,405 rows. (Data Frame)", latency: 150, tokens: 500 },
    { type: 'agent', content: "Analyzing data patterns and calculating growth...", latency: 2100, tokens: 300 },
    { type: 'agent', content: "Final Answer: Q3 sales were up 15% YoY, driven primarily by the Enterprise sector.", latency: 600, tokens: 150 },
    { type: 'wait', content: "Waiting for user...", latency: 3000 }
];

export const generateNextSpan = (stepIndex: number, config: SimulationConfig = { latencyMultiplier: 1, errorRate: 0.05, driftLevel: 0 }): TraceSpan => {
    const step = SCENARIO_STEPS[stepIndex % SCENARIO_STEPS.length];

    // Apply Chaos
    const isError = Math.random() < config.errorRate;

    // Base latency with randomness, then multiplied
    const baseLatency = step.latency > 0 ? step.latency + (Math.random() * 200 - 100) : 0;
    const latency = baseLatency * config.latencyMultiplier;

    // Simulate Drift: Probability increases with driftLevel
    // If driftLevel is 0.8, there is an 80% chance of a drift warning
    // We also store the raw drift level in metadata for the chart to plot
    const isDrift = config.driftLevel > 0 && Math.random() < config.driftLevel;
    const metadata = isDrift ? {
        warning: "Drift Detected: Semantic Score < 0.7",
        drift: config.driftLevel // Explicitly store the drift level for the chart
    } : {
        drift: 0 // Explicitly store 0 for chart continuity
    };

    return {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        type: isError ? 'error' : (step.type as any),
        content: isError ? "Error: Connection Timeout on DB Shard 04" : step.content,
        latencyMs: Math.max(0, Math.floor(latency)),
        tokenCount: step.tokens || 0,
        cost: (step.tokens || 0) * 0.00003, // Fake cost calculation ($0.03/1k)
        metadata
    };
};
