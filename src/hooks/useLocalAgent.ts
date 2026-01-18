import { useState, useEffect, useRef, useCallback } from 'react';
import type { TraceSpan } from '../lib/types';

export const useLocalAgent = (onNewSpan: (span: TraceSpan) => void) => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'running' | 'error'>('idle');
    const [progress, setProgress] = useState<{ status: string; name: string; file: string; progress: number; loaded: number; total: number } | null>(null);
    const worker = useRef<Worker | null>(null);

    // Flexible Mode State
    const [mode, setMode] = useState<'manual' | 'flexible'>('manual');
    const [isFlexibleRunning, setIsFlexibleRunning] = useState(false);

    // Refs for Event Listener Access to latest state
    const modeRef = useRef(mode);
    const flexibleRef = useRef(isFlexibleRunning);

    useEffect(() => { modeRef.current = mode; }, [mode]);
    useEffect(() => { flexibleRef.current = isFlexibleRunning; }, [isFlexibleRunning]);

    // Initialize Worker
    useEffect(() => {
        if (!worker.current) {
            worker.current = new Worker(new URL('../worker.ts', import.meta.url), {
                type: 'module'
            });

            worker.current.addEventListener('message', (e) => {
                const { type, data } = e.data;

                switch (type) {
                    case 'progress':
                        if (data.status === 'progress') {
                            setProgress(data);
                        }
                        break;
                    case 'ready':
                        setStatus('ready');
                        setProgress(null);
                        break;
                    case 'complete':
                        completeGeneration(data);
                        break;
                    case 'error':
                        setStatus('error');
                        onNewSpan({
                            id: crypto.randomUUID(),
                            timestamp: Date.now(),
                            type: 'error',
                            content: "Worker Error: " + (data.message || "Unknown"),
                        });
                        break;
                }
            });
        }
        return () => {
            // Cleanup if needed
        };
    }, []);

    const pendingRequest = useRef<{ start: number; prompt: string } | null>(null);

    const completeGeneration = (output: any) => {
        const end = performance.now();
        const latency = pendingRequest.current ? Math.floor(end - pendingRequest.current.start) : 0;
        const text = output?.[0]?.generated_text || "No output";

        onNewSpan({
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            type: 'agent',
            content: text,
            latencyMs: latency,
            tokenCount: text.length / 4,
            cost: 0,
            metadata: { model: "LaMini-Flan-T5 (Worker)" }
        });

        setStatus(prev => prev === 'running' ? 'ready' : prev);

        // Flexible Mode Loop - Check REFS for latest state
        if (flexibleRef.current && modeRef.current === 'flexible') {
            // Schedule next run with very short delay
            setTimeout(() => {
                const fastPrompts = [
                    "Hi",
                    "Answer yes or no: fire hot?",
                    "2 + 2 =",
                    "Say the word OK",
                    "Which is larger: 9 or 12?",
                    "Reverse the word: model",
                    "If x = 3, what is x * 4 + 2?",
                    "A cat is an animal. Is a cat a plant? Answer yes or no.",
                    "Summarize in one sentence: The sun rises in the east and sets in the west.",
                    "John has 3 apples. He buys 2 more, then gives 1 away. How many apples does he have? Answer with a number only."
                ];
                const randomPrompt = fastPrompts[Math.floor(Math.random() * fastPrompts.length)];
                runAgent(randomPrompt);
            }, 300);
        }
    };

    const loadModel = () => {
        if (status === 'idle' || status === 'error') {
            setStatus('loading');
            worker.current?.postMessage({ type: 'init' });
        }
    };

    const runAgent = useCallback((prompt: string) => {
        // Allow running if ready OR if we are in loop (technically status might fleetingly be running, but we want to enqueue or overwrite)
        // Ideally we wait for ready.

        setStatus('running');
        pendingRequest.current = { start: performance.now(), prompt };

        // 1. Emit "Start" Span
        onNewSpan({
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            type: 'user',
            content: prompt,
        });

        // 2. Emit "Thinking" Span
        onNewSpan({
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            type: 'agent',
            content: "Agent is running local inference (Worker)...",
        });

        worker.current?.postMessage({ type: 'generate', data: { prompt } });
    }, [status, onNewSpan]);

    const toggleFlexibleMode = () => {
        if (mode === 'manual') {
            setMode('flexible');
            setIsFlexibleRunning(true);
            if (status === 'ready') {
                runAgent("2 + 2");
            }
        } else {
            setMode('manual');
            setIsFlexibleRunning(false);
        }
    };

    const stop = useCallback(() => {
        setMode('manual');
        setIsFlexibleRunning(false);
        // We don't need to terminate the worker, just stop the loop logic
    }, []);

    return {
        status,
        progress,
        loadModel,
        runAgent,
        mode,
        toggleFlexibleMode,
        isFlexibleRunning,
        stop
    };
};
