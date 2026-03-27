"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import VrmAvatar from "../../../components/VrmAvatar";

export default function ModelSelectPage() {
    const router = useRouter();

    const handleModelSelect = (modelId: string) => {
        router.push(`/session/select?model=${modelId}`);
    };

    return (
        <main className="min-h-screen w-full bg-[#fcfcfc] overflow-y-auto overflow-x-hidden dot-bg-light text-black flex flex-col items-center justify-center relative font-sans selection:bg-orange-200 p-6 md:p-12">
            {/* Header */}
            <header className="absolute top-0 w-full flex justify-between items-center p-5 lg:p-8 z-50 bg-white/40 backdrop-blur-md border-b border-white/50 shadow-sm transition-all">
                <button
                    onClick={() => router.push('/')}
                    className="text-orange-500 font-extrabold tracking-tighter italic text-xl drop-shadow-sm hover:scale-105 transition-transform origin-left"
                >
                    NEURO AI
                </button>
                <div className="hidden md:flex gap-4">
                    <div className="text-xs font-bold text-gray-500 tracking-widest uppercase bg-white/60 px-4 py-2 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.03)] border border-gray-100">Setup Phase</div>
                </div>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center mb-16 pt-20"
            >
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">Select Intelligence Core</h1>
                <p className="text-gray-500 text-lg max-w-xl mx-auto">Choose the physical avatar and neural model powering your AI teacher for this session.</p>
            </motion.div>

            <div className="flex flex-col lg:flex-row gap-8 md:gap-12 w-full max-w-5xl mx-auto z-10 justify-center">

                {/* 1. Cartoon AI Card */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    onClick={() => handleModelSelect('cartoon-ai')}
                    className="flex-1 max-w-sm w-full mx-auto relative group cursor-pointer"
                >
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                    
                    <div className="relative h-[400px] md:h-[480px] w-full bg-[#f8f9fc] rounded-3xl overflow-hidden shadow-lg group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-300 border border-gray-100 group-hover:border-blue-400/50">
                        {/* High-Fidelity 3D Layer */}
                        <div className="absolute inset-0">
                            <VrmAvatar sizeMode="card" />
                        </div>

                        {/* Text Content overlaying the image bottom */}
                        <div className="absolute bottom-0 left-0 w-full p-6 text-white text-left z-20 pointer-events-none">
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent -z-10"></div>
                            <h2 className="text-3xl font-black mb-1 group-hover:text-blue-400 transition-colors">VRM Anime</h2>
                            <p className="text-gray-300 text-sm font-medium">Interactive 3D VTuber</p>
                        </div>
                    </div>
                </motion.div>

                {/* 2. Neuro Core Card (Primary) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    onClick={() => handleModelSelect('neuro-core')}
                    className="flex-1 max-w-sm w-full mx-auto relative group cursor-pointer lg:-mt-4 lg:scale-110 z-20"
                >
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-orange-500/30 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

                    <div className="relative h-[420px] md:h-[500px] w-full bg-white rounded-3xl overflow-hidden shadow-2xl group-hover:shadow-orange-500/20 group-hover:-translate-y-3 transition-all duration-300 border-2 border-orange-400/50 group-hover:border-orange-500">

                        <div className="absolute top-4 right-4 z-20 text-[10px] font-black uppercase tracking-widest bg-orange-500 text-white px-3 py-1 rounded-full shadow-lg">Recommended</div>

                        {/* Image Layer */}
                        <div className="absolute inset-0 bg-gray-100">
                            {/* Defaulting to using one of the user's avatar_frames since we know it exists as a good default! */}
                            <img
                                src="/avatar_frames/WhatsApp Video 2026-03-26 at 10.43.59 PM_074.jpg"
                                alt="Neuro Core v4"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        </div>

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-orange-950/90 via-gray-900/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Text Content overlaying the image bottom */}
                        <div className="absolute bottom-0 left-0 w-full p-6 text-white text-center flex flex-col items-center">
                            <h2 className="text-3xl font-black mb-1 group-hover:text-orange-400 transition-colors drop-shadow-md">Poorna Ma'am AI</h2>
                            <p className="text-gray-300 text-sm font-medium">Emotional & Empathic Tutoring</p>
                        </div>
                    </div>
                </motion.div>

                {/* 3. Realistic Teacher Card */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    onClick={() => handleModelSelect('realistic-teacher')}
                    className="flex-1 max-w-sm w-full mx-auto relative group cursor-pointer"
                >
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-pink-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                    
                    <div className="relative h-[400px] md:h-[480px] w-full bg-white rounded-3xl overflow-hidden shadow-lg group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-300 border border-gray-100 group-hover:border-pink-400/50">
                        {/* Image Layer */}
                        <div className="absolute inset-0 bg-gray-100">
                            {/* Replace src with /realistic_girl_avatar_frames/ai-avatar-girl.jpg */}
                            <img 
                                src="/realistic_girl_avatar_frames/ai-avatar-girl.jpg" 
                                alt="Realistic Teacher"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {/* Fallback pattern */}
                            <div className="absolute inset-0 opacity-5 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==')]"></div>
                            
                            {/* Inner icon fallback if missing */}
                            <div className="absolute inset-0 flex items-center justify-center -z-20 text-pink-100">
                                <svg viewBox="0 0 24 24" width="80" height="80" stroke="currentColor" strokeWidth="1" fill="none"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                            </div>
                        </div>

                        {/* Gradient Overlay for Text Visibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Text Content overlaying the image bottom */}
                        <div className="absolute bottom-0 right-0 w-full p-6 text-white text-right">
                            <h2 className="text-3xl font-black mb-1 group-hover:text-pink-400 transition-colors">Realistic Teacher</h2>
                            <p className="text-gray-300 text-sm font-medium">Immersive Human Avatar</p>
                        </div>
                    </div>
                </motion.div>

            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .dot-bg-light {
                    background-image: radial-gradient(circle, rgba(0,0,0,0.06) 1.5px, transparent 1.5px);
                    background-size: 24px 24px;
                }
            `}} />
        </main>
    );
}
