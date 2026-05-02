'use client';

import { createContext, useContext, useCallback } from 'react';
// We will use standard HTML5 Audio for simplicity and reliability without needing external assets immediately.
// We can generate simple synthesized sounds.

interface SoundContextType {
    playClick: () => void;
    playSuccess: () => void;
    playPop: () => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

export function SoundProvider({ children }: { children: React.ReactNode }) {
    // Simple synthesizer for UI sounds
    const playTone = useCallback((frequency: number, type: OscillatorType, duration: number, volume: number = 0.1) => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;

            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(frequency, ctx.currentTime);

            gain.gain.setValueAtTime(volume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            // Ignore audio errors (e.g., user hasn't interacted with page yet)
        }
    }, []);

    const playClick = useCallback(() => playTone(600, 'sine', 0.05, 0.05), [playTone]);
    const playPop = useCallback(() => playTone(400, 'sine', 0.1, 0.05), [playTone]);
    const playSuccess = useCallback(() => {
        playTone(440, 'sine', 0.1, 0.05);
        setTimeout(() => playTone(554, 'sine', 0.1, 0.05), 100);
        setTimeout(() => playTone(659, 'sine', 0.2, 0.05), 200);
    }, [playTone]);

    return (
        <SoundContext.Provider value={{ playClick, playSuccess, playPop }}>
            {children}
        </SoundContext.Provider>
    );
}

export function useSound() {
    const context = useContext(SoundContext);
    if (!context) {
        throw new Error('useSound must be used within a SoundProvider');
    }
    return context;
}
