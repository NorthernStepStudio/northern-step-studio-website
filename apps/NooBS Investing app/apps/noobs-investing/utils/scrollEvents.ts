// Simple event emitter that works in React Native (no Node.js dependencies)

type Callback = () => void;
const listeners: Callback[] = [];

export function emitScrollToTop() {
    console.log('[ScrollEvents] Emitting scroll-to-top');
    listeners.forEach(cb => cb());
}

export function onScrollToTop(callback: Callback): () => void {
    listeners.push(callback);
    return () => {
        const idx = listeners.indexOf(callback);
        if (idx > -1) listeners.splice(idx, 1);
    };
}
