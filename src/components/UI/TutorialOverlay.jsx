import React from 'react';
import { motion } from 'framer-motion';

export const TutorialOverlay = ({ header, title, description, imageSrc, onContinue }) => {
    return (
        <div className="absolute inset-0 z-[70] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fade-in pointer-events-auto">
            <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 max-w-sm text-center shadow-2xl border-4 border-pink-400 relative overflow-hidden"
            >
                {/* Decorative Background Blob */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-100 rounded-full opacity-50 pointer-events-none" />

                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-pink-600 mb-2 uppercase tracking-wide drop-shadow-sm">
                        {header || "⚠️ INFO PENTING!"}
                    </h2>

                    <div className="my-6 relative">
                        {/* Glow Effect behind image */}
                        <div className="absolute inset-0 bg-red-500/30 blur-xl rounded-full scale-125" />
                        <img
                            src={imageSrc}
                            alt="Enemy"
                            className="w-24 h-24 mx-auto object-contain relative z-10 drop-shadow-xl animate-bounce-slow"
                        />
                    </div>

                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        {title}
                    </h3>

                    <p className="text-gray-600 font-medium text-lg leading-snug mb-8">
                        {description}
                    </p>

                    <button
                        onClick={onContinue}
                        className="w-full py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-bold text-xl shadow-[0_4px_0_#db2777] active:shadow-none active:translate-y-1 transition-all"
                    >
                        MENGERTI, AYO LAWAN! ⚔️
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
