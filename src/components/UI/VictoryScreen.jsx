import React from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export const VictoryScreen = ({ onRestart, onBack, onShowLeaderboard }) => {
    // Trigger confetti on mount
    React.useEffect(() => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }, []);

    return (
        <motion.div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center text-center p-6 ui-layer w-full h-full"
            style={{
                background: 'rgba(255, 215, 0, 0.2)', // Very light gold shim
                backdropFilter: 'blur(4px)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <motion.div
                initial={{ scale: 0.5, opacity: 0, rotate: 10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.6 }}
                className="p-10 rounded-[3rem] border-8 border-yellow-400 shadow-[0_20px_0_rgba(202,138,4,1)] relative overflow-hidden bg-yellow-300 w-[90%] max-w-sm"
            >
                {/* Sunburst Effect (CSS) */}
                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0)_70%)] animate-pulse" />

                <div className="relative z-10">
                    <motion.div
                        className="text-8xl mb-4"
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                        🏆
                    </motion.div>

                    <motion.h1
                        className="text-6xl text-white mb-6 font-black tracking-wide"
                        style={{
                            textShadow: "4px 4px 0px #a16207, -2px -2px 0px #fef08a",
                            WebkitTextStroke: "2px #a16207"
                        }}
                    >
                        MENANG!
                    </motion.h1>

                    <div className="bg-white p-8 rounded-3xl border-b-8 border-yellow-100 mb-10 shadow-2xl relative">
                        <p className="text-yellow-600 text-2xl leading-relaxed font-bold">
                            Hebat! Tubuh sekarang sehat berkat kamu!
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        {/* Back Button */}
                        <motion.button
                            onClick={onBack}
                            className="w-16 h-16 bg-white/20 text-white rounded-full flex items-center justify-center border-4 border-white/30 shadow-lg"
                            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.3)" }}
                            whileTap={{ scale: 0.9 }}
                            title="Ganti Nama"
                        >
                            <span className="text-3xl">↩️</span>
                        </motion.button>

                        {/* Restart Button */}
                        <motion.button
                            className="w-24 h-24 bg-gradient-to-tr from-cyan-400 to-cyan-500 text-white rounded-full shadow-[0_8px_0_#0e7490] active:shadow-none active:translate-y-2 transition-all border-4 border-white/30 relative z-10 group flex items-center justify-center"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onRestart}
                        >
                            <span className="text-5xl drop-shadow-md ml-2">🎉</span>
                            <div className="absolute inset-0 rounded-full bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.button>

                        {/* Leaderboard Button */}
                        <motion.button
                            onClick={onShowLeaderboard}
                            className="w-16 h-16 bg-yellow-400 text-white rounded-full flex items-center justify-center border-4 border-white/30 shadow-[0_4px_0_#b45309] active:shadow-none active:translate-y-1"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Peringkat"
                        >
                            <span className="text-3xl">🏆</span>
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
