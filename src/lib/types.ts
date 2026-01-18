export type SpanType = 'user' | 'agent' | 'tool' | 'error';

export interface TraceSpan {
  id: string;
  timestamp: number;
  type: SpanType;
  content: string;
  latencyMs?: number;
  tokenCount?: number;
  cost?: number;
  metadata?: Record<string, any>;
}

export interface AgentMetric {
  totalTokens: number;
  totalCost: number;
  avgLatency: number;
  errorRate: number;
  timestamp: number;
}

export type SimulationConfig = {
  latencyMultiplier: number; // 1.0 = Normal, 5.0 = High Lag
  errorRate: number;         // 0.05 = 5%, 0.40 = 40%
  driftLevel: number;        // 0 = Normal, 1 = High Hallucination Risk
};
