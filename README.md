# AgentScope: Client-Side Agent Observability Platform

**A real-time dashboard for monitoring AI Agent lifecycle, cost, and drift—running 100% locally via WebAssembly.**

AgentScope visually demonstrates complex backend MLOps concepts (traces, latency, cost tracking) purely on the frontend, bridging the gap between simulation and real-world edge AI execution.

![AgentScope Dashboard](./dashboard_preview.png)

## Key Features

*   **Live Trace Waterfall**: Visualizes the "Chain of Thought" execution path of your agents in real-time.
*   **Drift Simulation & Chaos Mode**: Interactive controls to model network lag, error spikes, and agent degradation to test system resiliency.
*   **Edge Inference**: Integrated with **Transformers.js** to run real LLMs (e.g., LaMini-Flan-T5) directly in the browser, profiling profiling actual latency and token usage.
*   **Cost Tracking**: Simulates enterprise-grade token billing logic to track spend accumulation.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Explore**:
    *   **Simulation Mode**: Watch a pre-scripted agent analyze sales data. Use the Sidebar sliders to inject Chaos (latency/errors).
    *   **Real Local AI**: Switch modes to chat with a local LLM running entirely in your browser.

## Built With
*   React 19 & Vite
*   Tailwind CSS v4
*   Recharts
*   Transformers.js (WebAssembly AI)
