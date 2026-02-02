import React from 'react';
import { motion } from 'framer-motion';

export const HUD = ({ timer }) => {
    return (
        <div className="absolute top-4 right-4 ui-layer">
            <div className="bg-white/20 backdrop-blur-md border-4 border-white/40 rounded-full px-6 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex items-center gap-3 transform hover:scale-105 transition-transform duration-300">
                <span className="text-3xl filter drop-shadow-md">⏰</span>
                <div className="flex flex-col items-center">
                    <span className="text-white text-xs font-bold uppercase tracking-wider opacity-80">Waktu</span>
                    <span className="text-3xl font-black text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.2)]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                        {Math.ceil(timer)}s
                    </span>
                </div>
            </div>
        </div>
    );
};
