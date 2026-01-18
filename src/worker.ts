/// <reference lib="webworker" />
import { pipeline, env } from '@xenova/transformers';

// Skip local checks
env.allowLocalModels = false;
env.useBrowserCache = false;

class PipelineSingleton {
    static task = 'text2text-generation' as const;
    static model = 'Xenova/LaMini-Flan-T5-783M';
    static instance: any = null;

    static async getInstance(progressCallback: any = null) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, this.model, { progress_callback: progressCallback });
        }
        return this.instance;
    }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    const { type, data } = event.data;

    if (type === 'init') {
        try {
            await PipelineSingleton.getInstance((x: any) => {
                // We also get progress callbacks here
                self.postMessage({ type: 'progress', data: x });
            });
            self.postMessage({ type: 'ready' });
        } catch (e) {
            self.postMessage({ type: 'error', data: e });
        }
    } else if (type === 'generate') {
        try {
            const generator = await PipelineSingleton.getInstance();
            const output = await generator(data.prompt, {
                max_new_tokens: 50,
                // Add parameters as needed
            });
            self.postMessage({ type: 'complete', data: output });
        } catch (e) {
            self.postMessage({ type: 'error', data: e });
        }
    }
});
