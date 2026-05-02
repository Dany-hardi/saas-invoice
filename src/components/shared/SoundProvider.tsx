'use client';

import { createContext, useContext } from 'react';
import useSound from 'use-sound';

interface SoundContextType {
    playClick: () => void;
    playSuccess: () => void;
    playPop: () => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

const CLICK_URL = 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3';
const POP_URL = 'https://assets.mixkit.co/active_storage/sfx/1114/1114-preview.mp3';
const SUCCESS_URL = 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3';

export function SoundProvider({ children }: { children: React.ReactNode }) {
    const [playClick] = useSound(CLICK_URL, { volume: 0.2 });
    const [playPop] = useSound(POP_URL, { volume: 0.15 });
    const [playSuccess] = useSound(SUCCESS_URL, { volume: 0.2 });

    return <SoundContext.Provider value={{ playClick, playSuccess, playPop }}>{children}</SoundContext.Provider>;
}

export function useSoundContext() {
    const context = useContext(SoundContext);
    if (!context) {
        throw new Error('useSoundContext must be used within a SoundProvider');
    }
    return context;
}

export { useSoundContext as useSound };
