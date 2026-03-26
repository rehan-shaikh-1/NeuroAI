"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export default function SessionSelectPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const model = searchParams.get('model') || 'neuro-core';

    return (
        <main className="h-screen w-full bg-[#fcfcfc] overflow-hidden dot-bg-light text-black flex flex-col items-center justify-center relative font-sans selection:bg-orange-200 p-6">
            {/* Header */}
            <header className="absolute top-0 w-full flex justify-between items-center p-6 lg:p-8 z-10">
                <button
                    onClick={() => router.push('/')}
                    className="text-orange-500 font-extrabold tracking-tighter italic text-xl drop-shadow-sm hover:scale-105 transition-transform origin-left"
                >
                    NEURO AI
                </button>
            </header>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
            >
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">Choose Your Interface</h1>
                <p className="text-gray-500 text-lg">Select how you want to interact with Neuro AI today.</p>
            </motion.div>

            <div className="flex flex-col md:flex-row gap-6 md:gap-10 w-full max-w-4xl mx-auto z-10">
                {/* 1. Video Call Card */}
                <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    onClick={() => router.push(`/video?model=${model}`)}
                    className="flex-1 bg-white border border-gray-200 rounded-3xl p-8 md:p-12 flex flex-col items-center text-center cursor-pointer hover:border-orange-500/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group shadow-lg"
                >
                    <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-8 border border-orange-100 group-hover:bg-orange-500 transform transition-colors">
                        <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500 group-hover:text-white transition-colors">
                            <path d="M23 7l-7 5 7 5V7z"></path>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-orange-500 transition-colors">Video Call with AI</h2>
                    <p className="text-gray-500">Engage in a face-to-face immersive learning session with real-time visual feedback.</p>
                </motion.div>

                {/* 2. Text Chat Card */}
                <motion.div 
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    onClick={() => router.push(`/chats?model=${model}`)}
                    className="flex-1 bg-white border border-gray-200 rounded-3xl p-8 md:p-12 flex flex-col items-center text-center cursor-pointer hover:border-orange-500/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group shadow-lg"
                >
                    <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-8 border border-orange-100 group-hover:bg-orange-500 transform transition-colors">
                        <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500 group-hover:text-white transition-colors">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-orange-500 transition-colors">Chat with AI</h2>
                    <p className="text-gray-500">Deep-dive into texts, prompt-driven sessions, and document analysis at your own pace.</p>
                </motion.div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .dot-bg-light {
                    background-image: radial-gradient(circle, rgba(0,0,0,0.06) 1.5px, transparent 1.5px);
                    background-size: 24px 24px;
                }
            `}} />
        </main>
    );
}
