import React from 'react';
import { motion } from 'framer-motion';

export const GameOverScreen = ({ onRestart, message, description, onBack, onShowLeaderboard }) => {
    return (
        <div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center text-center p-6 ui-layer w-full h-full"
            style={{
                background: 'rgba(50, 0, 0, 0.4)', // Semi-transparent for Popup feel
                backdropFilter: 'blur(4px)' // Sligth blur to separate from game
            }}
        >
            <motion.div
                initial={{ y: -50, opacity: 0, rotate: -5 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.6 }}
                className="p-8 rounded-[3rem] border-8 border-red-400 shadow-[0_20px_0_rgba(185,28,28,1)] relative overflow-hidden max-w-lg w-full bg-red-500"
            >
                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-400 rounded-full opacity-50" />
                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-red-600 rounded-full opacity-50" />

                <div className="relative z-10">
                    <motion.div
                        className="text-8xl mb-4"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        🤒
                    </motion.div>

                    <h1 className="text-5xl md:text-6xl text-white mb-6 font-black tracking-wide"
                        style={{
                            textShadow: "4px 4px 0px #7f1d1d, -2px -2px 0px #fca5a5",
                            WebkitTextStroke: "2px #991b1b"
                        }}>
                        YAH, SAKIT!
                    </h1>

                    <div className="bg-white p-6 rounded-3xl border-b-8 border-red-200 mb-8 shadow-xl mx-4">
                        <p className="text-red-500 text-lg font-bold mb-2 uppercase tracking-wider">Tips Sehat:</p>
                        <p className="text-gray-700 text-xl md:text-2xl leading-relaxed font-bold">
                            "{description || "Hindari kuman dan virus jahat ya!"}"
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
                            className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-yellow-500 text-white rounded-full shadow-[0_10px_0_#b45309] active:shadow-none active:translate-y-2 transition-all border-4 border-white/30 relative z-10 group flex items-center justify-center"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onRestart}
                        >
                            <span className="text-5xl drop-shadow-md ml-2">🔄</span>
                            <div className="absolute inset-0 rounded-full bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.button>

                        {/* Leaderboard Button */}
                        <motion.button
                            onClick={onShowLeaderboard}
                            className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center border-4 border-white/30 shadow-[0_4px_0_#9a3412] active:shadow-none active:translate-y-1"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Peringkat"
                        >
                            <span className="text-3xl">🏆</span>
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
