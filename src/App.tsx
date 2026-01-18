import { useState, useCallback, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { MetricsGrid } from './components/Dashboard/MetricsGrid';
import { TraceWaterfall } from './components/Dashboard/TraceWaterfall';
import { DriftChart } from './components/Dashboard/DriftChart';
import { useAgentSimulation } from './hooks/useAgentSimulation';
import { useLocalAgent } from './hooks/useLocalAgent';
import { OnboardingModal } from './components/OnboardingModal';
import type { SimulationConfig, TraceSpan, AgentMetric } from './lib/types';
import { Play, Pause, Square, Bot, Cpu, Download, RefreshCw, Zap, MessageSquare } from 'lucide-react';

type Mode = 'simulation' | 'local';
type SimStatus = 'idle' | 'running' | 'paused';

function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [mode, setMode] = useState<Mode>('simulation');
  const [simStatus, setSimStatus] = useState<SimStatus>('idle');

  // Auto-Start Local UI Logic
  const pendingAutoStartRef = useRef(false);
  const markAutoStart = () => { pendingAutoStartRef.current = true; };

  const [config, setConfig] = useState<SimulationConfig>({
    latencyMultiplier: 1,
    errorRate: 0.05,
    driftLevel: 0
  });

  // Shared State
  const [spans, setSpans] = useState<TraceSpan[]>([]);
  const [metrics, setMetrics] = useState<AgentMetric>({
    totalTokens: 0,
    totalCost: 0,
    avgLatency: 0,
    errorRate: 0,
    timestamp: Date.now()
  });

  // Stable handlers
  const handleSpan = useCallback((span: TraceSpan) => {
    setSpans(prev => [span, ...prev].slice(0, 50));
  }, []);

  const handleMetrics = useCallback((newMetrics: AgentMetric) => {
    setMetrics(newMetrics);
  }, []);

  const handleStop = useCallback(() => {
    setSpans([]);
    setMetrics({ totalTokens: 0, totalCost: 0, avgLatency: 0, errorRate: 0, timestamp: Date.now() });
  }, []);

  // Simulation Logic
  useAgentSimulation({
    simulationStatus: mode === 'simulation' ? simStatus : 'paused',
    config,
    onSpan: handleSpan,
    onMetricsUpdate: handleMetrics,
    onStop: handleStop
  });

  // Local Agent Logic
  const { status, runAgent, loadModel, progress, mode: localMode, toggleFlexibleMode, isFlexibleRunning, stop: stopLocalAgent } = useLocalAgent((span) => {
    setSpans(prev => [span, ...prev].slice(0, 50));
    if (span.tokenCount || span.latencyMs) {
      setMetrics(prev => ({
        totalTokens: prev.totalTokens + (span.tokenCount || 0),
        totalCost: prev.totalCost,
        avgLatency: (prev.avgLatency * 0.9) + ((span.latencyMs || 0) * 0.1),
        errorRate: span.type === 'error' ? prev.errorRate + 1 : prev.errorRate,
        timestamp: Date.now()
      }));
    }
  });

  // Watch for Ready Status to Auto-Start Flexible Mode
  useEffect(() => {
    if (status === 'ready' && pendingAutoStartRef.current) {
      pendingAutoStartRef.current = false;
      if (localMode !== 'flexible') {
        toggleFlexibleMode();
      }
    }
  }, [status, localMode, toggleFlexibleMode]);

  const [prompt, setPrompt] = useState("");

  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    runAgent(prompt);
    setPrompt("");
  };

  return (
    <>
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onRunSimulation={() => {
          setShowOnboarding(false);
          setMode('simulation');
          setSimStatus('running');
          setConfig(prev => ({ ...prev, errorRate: 0, latencyMultiplier: 1, driftLevel: 0 })); // Low chaos
        }}
        onTestLocalAI={() => {
          setShowOnboarding(false);
          setMode('local');
          // Reset others
          setSimStatus('idle');
          handleStop();

          // Trigger Load
          setTimeout(() => {
            loadModel();
            markAutoStart();
          }, 100);
        }}
      />

      <Layout config={config} onConfigChange={setConfig} mode={mode}>
        <div className="mb-6 flex items-center justify-between">
          <MetricsGrid metrics={metrics} />
        </div>

        <div className="mb-4 bg-gray-900 border border-gray-800 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex gap-2 p-1 bg-gray-950 rounded-lg border border-gray-800">
              <button
                onClick={() => {
                  setMode('simulation');
                  setSimStatus('idle');
                  handleStop(); // Clear data
                  stopLocalAgent(); // Stop flexible mode if running
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'simulation' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
              >
                <Bot className="w-3 h-3" />
                Simulation
              </button>
              <button
                onClick={() => {
                  setMode('local');
                  setSimStatus('idle'); // Ensure simulation stops
                  handleStop(); // Clear data
                  stopLocalAgent(); // Ensure local is reset to manual
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'local' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
              >
                <Cpu className="w-3 h-3" />
                Real Local AI
              </button>
            </div>

            <div className="h-6 w-px bg-gray-800 hidden sm:block"></div>

            {/* Mode Specific Controls */}
            {mode === 'simulation' ? (
              <div className="flex items-center gap-2">
                <button onClick={() => setSimStatus('running')} disabled={simStatus === 'running'} className="p-1.5 rounded hover:bg-gray-800 text-emerald-400 disabled:opacity-50 disabled:hover:bg-transparent">
                  <Play className="w-4 h-4 fill-current" />
                </button>
                <button onClick={() => setSimStatus('paused')} disabled={simStatus === 'paused'} className="p-1.5 rounded hover:bg-gray-800 text-amber-400 disabled:opacity-50 disabled:hover:bg-transparent">
                  <Pause className="w-4 h-4 fill-current" />
                </button>
                <button onClick={() => setSimStatus('idle')} disabled={simStatus === 'idle'} className="p-1.5 rounded hover:bg-gray-800 text-red-400 disabled:opacity-50 disabled:hover:bg-transparent">
                  <Square className="w-4 h-4 fill-current" />
                </button>
                <span className="ml-2 text-xs text-gray-500 font-mono uppercase">{simStatus}</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/* Load Button */}
                {status === 'idle' || status === 'error' ? (
                  <button onClick={loadModel} className="flex items-center gap-2 text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded border border-gray-700 transition-colors">
                    <Download className="w-3 h-3" />
                    Load Model
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded border border-emerald-500/20">
                    {status === 'loading' ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Loading... {progress ? `${Math.round(progress.progress || 0)}%` : ''}</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>Model Ready</span>
                      </>
                    )}
                  </div>
                )}

                {/* Mode Toggle - Always visible but disabled if not ready */}
                {/* Mode Toggle - Segmented Control */}
                <div className="flex items-center bg-gray-800/50 rounded-lg p-1 border border-gray-700/50">
                  <button
                    onClick={() => localMode !== 'manual' && toggleFlexibleMode()}
                    disabled={status === 'loading' || status === 'idle'}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-medium transition-all ${localMode === 'manual'
                      ? 'bg-gray-700 text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                      } ${status === 'loading' || status === 'idle' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <MessageSquare className="w-3 h-3" />
                    Manual
                  </button>
                  <button
                    onClick={() => localMode !== 'flexible' && toggleFlexibleMode()}
                    disabled={status === 'loading' || status === 'idle'}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-medium transition-all ${localMode === 'flexible'
                      ? 'bg-purple-500 text-white shadow-sm shadow-purple-500/20'
                      : 'text-gray-400 hover:text-gray-200'
                      } ${status === 'loading' || status === 'idle' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <Zap className="w-3 h-3" />
                    Flexible (Auto)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {mode === 'local' && (
          <form onSubmit={handleLocalSubmit} className="mb-6 flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={localMode === 'flexible' && isFlexibleRunning ? "Agent is auto-generating insights..." : "Message the local agent..."}
              disabled={status !== 'ready' || (localMode === 'flexible' && isFlexibleRunning)}
              className="flex-1 bg-gray-900 border border-gray-700 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 text-white placeholder-gray-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status !== 'ready' || (localMode === 'flexible' && isFlexibleRunning)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
          {/* Left Col: Traces */}
          <TraceWaterfall spans={spans} />

          {/* Right Col: Charts & Additional Details */}
          <div className="space-y-6 flex flex-col">
            <DriftChart spans={spans} />

            <div className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-200 mb-2">System Status</h3>
              <DelayedSystemStatusPanel config={config} />
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

function StatusItem({ label, status }: { label: string, status: string }) {
  const isBad = status !== "Operational";
  return (
    <div className="flex items-center justify-between text-xs bg-gray-950 p-2 rounded border border-gray-800">
      <span className="text-gray-400">{label}</span>
      <span className={`${isBad ? 'text-amber-400' : 'text-emerald-400'} flex items-center gap-1`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isBad ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
        {status}
      </span>
    </div>
  )
}

function DelayedSystemStatusPanel({ config }: { config: SimulationConfig }) {
  const [status, setStatus] = useState({
    db: "Operational",
    llm: "Operational"
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus({
        db: config.errorRate > 0.2 ? "Degraded" : "Operational",
        llm: config.latencyMultiplier > 2 ? "High Latency" : "Operational"
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [config.errorRate, config.latencyMultiplier]);

  return (
    <div className="space-y-2">
      <StatusItem label="Vector DB Cluster" status={status.db} />
      <StatusItem label="LLM Gateway" status={status.llm} />
      <StatusItem label="Tool Execution Sandbox" status="Operational" />
    </div>
  );
}

export default App;
