"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import TalkingAvatar from "../../components/TalkingAvatar";
import RealisticAvatar from "../../components/RealisticAvatar";
import VrmAvatar from "../../components/VrmAvatar";

export default function VideoSessionPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const model = searchParams.get('model') || 'neuro-core';
    const [avatarMode, setAvatarMode] = useState<"2d" | "3d">(model === 'cartoon-ai' ? "3d" : "2d");
    const [inputText, setInputText] = useState("");
    const [lastAiMessage, setLastAiMessage] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    
    // Voice STT Integration States
    const [isListening, setIsListening] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const audioChunksRef = useRef<BlobPart[]>([]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 5000);
    };

    const handleSend = async (e?: React.FormEvent | string) => {
        if (typeof e === 'object' && e) e.preventDefault();
        
        const userMsg = typeof e === 'string' ? e : inputText;
        if (userMsg.trim()) {
            if (typeof e !== 'string') setInputText("");
            setIsThinking(true);
            
            try {
                const response = await fetch("http://localhost:8000/api/v1/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: "Ashish",
                        raw_input: userMsg,
                        history: [],
                        target_skill: userMsg,
                        education_level: "Undergraduate"
                    })
                });

                if (!response.ok) throw new Error("Connection failed");
                const data = await response.json();
                setLastAiMessage(data.reply);
            } catch (err) {
                console.error(err);
                setLastAiMessage("Warning: Neuro Core Offline. Ensure your FastAPI Python backend is running on port 8000.");
            } finally {
                setIsThinking(false);
            }
        }
    };

    const toggleMic = async () => {
        if (isListening) {
            // Stop recording
            if (mediaRecorder) {
                mediaRecorder.stop();
            }
            setIsListening(false);
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };
            
            recorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                audioChunksRef.current = []; // reset
                stream.getTracks().forEach(track => track.stop()); // release mic
                
                // Upload to our Whisper endpoint
                const formData = new FormData();
                formData.append('audio', audioBlob, 'recording.webm');
                
                try {
                    // Start processing loading state immediately
                    setIsThinking(true);
                    
                    const response = await fetch('http://localhost:8000/api/v1/stt', {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        const transcript = data.text;
                        if (transcript && transcript.trim()) {
                            // Automatically submit the transcribed message
                            handleSend(transcript);
                        } else {
                            setIsThinking(false);
                        }
                    } else {
                        throw new Error('Transcription failed');
                    }
                } catch (e) {
                    console.error('STT Error:', e);
                    showToast("Failed to transcribe via server Whisper");
                    setIsThinking(false);
                }
            };
            
            audioChunksRef.current = [];
            recorder.start();
            setMediaRecorder(recorder);
            setIsListening(true);
            
        } catch (err) {
            console.error("Microphone access denied:", err);
            showToast("Could not access microphone.");
        }
    };

    return (
        <main className="h-screen w-full bg-[#fcfcfc] overflow-hidden dot-bg-light text-black flex flex-col items-center justify-between relative font-sans selection:bg-orange-200">
            
            {/* Header */}
            <header className="w-full flex justify-between items-center p-6 lg:p-8 z-20 shrink-0">
                <button
                    onClick={() => router.push('/')}
                    className="text-orange-500 font-extrabold tracking-tighter italic text-xl drop-shadow-sm hover:scale-105 transition-transform origin-left"
                >
                    NEURO AI
                </button>
                <div className="flex gap-4 items-center">
                    <button
                        onClick={() => setAvatarMode(prev => prev === "3d" ? "2d" : "3d")}
                        className="text-xs font-bold text-orange-600 bg-orange-100/80 hover:bg-orange-200 px-4 py-1.5 rounded-full transition-colors flex items-center shadow-sm"
                    >
                        {avatarMode === "3d" ? "2D Mode" : "3D Mode"}
                    </button>
                    <div className="px-4 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        Live Session
                    </div>
                </div>
            </header>

            {/* Error Toaster */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3"
                    >
                        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        <span className="font-bold text-sm tracking-wide">{toastMessage}</span>
                        <button onClick={() => setToastMessage(null)} className="ml-2 hover:text-red-200 focus:outline-none">
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Immersive Central Avatar Container */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex-grow w-full flex items-center justify-center relative z-10"
            >
                <div className="relative">
                    {/* Pulsing ring decoration mapping to thinking state */}
                    {isThinking && (
                        <div className="absolute inset-0 z-0">
                            <div className="absolute inset-[-4rem] rounded-full border border-orange-500/30 animate-[ping_2s_linear_infinite]"></div>
                            <div className="absolute inset-[-6rem] rounded-full border border-orange-500/10 animate-[ping_2.5s_linear_infinite]"></div>
                        </div>
                    )}
                    
                    <div className="relative z-10">
                        {avatarMode === "3d" ? (
                            <VrmAvatar isActive={true} textToSpeak={lastAiMessage} sizeMode="video" />
                        ) : model === 'realistic-teacher' ? (
                            <RealisticAvatar isActive={true} textToSpeak={lastAiMessage} sizeMode="video" />
                        ) : (
                            <TalkingAvatar isActive={true} textToSpeak={lastAiMessage} sizeMode="video" />
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Bottom Floating Control Bar */}
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="w-full max-w-4xl px-4 pb-8 md:pb-12 z-20 shrink-0"
            >
                <div className="bg-white border border-gray-200 shadow-2xl shadow-orange-500/10 rounded-full p-2 flex items-center gap-3 w-full relative">
                    
                    {/* Disconnect Button */}
                    <button 
                        onClick={() => router.push('/session/select')} 
                        className="p-4 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm shrink-0"
                        title="End Call"
                    >
                        <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path><line x1="23" y1="1" x2="1" y2="23"></line></svg>
                    </button>

                    {/* Input Field Form with Mic Integrations */}
                    <form onSubmit={handleSend} className="flex-grow flex items-center bg-gray-50 rounded-full px-5 py-3 border border-transparent focus-within:border-orange-500/30 focus-within:bg-white transition-colors relative overflow-hidden h-full">
                        
                        <AnimatePresence>
                            {isListening && (
                                <motion.div 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-orange-500 z-10 flex items-center justify-between px-6 rounded-full"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="relative flex h-3 w-3">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                                        </span>
                                        <span className="text-white font-bold tracking-widest uppercase text-sm">Listening...</span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-70">
                                        <motion.div animate={{ height: ["10px", "24px", "10px"] }} transition={{ repeat: Infinity, duration: 1.0 }} className="w-1 bg-white rounded-full" />
                                        <motion.div animate={{ height: ["14px", "30px", "14px"] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-1 bg-white rounded-full" />
                                        <motion.div animate={{ height: ["10px", "20px", "10px"] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-white rounded-full" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <input 
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Type here to speak with Neuro AI..."
                            className="bg-transparent w-full outline-none text-gray-800 placeholder-gray-400 font-medium z-0"
                            disabled={isThinking || isListening}
                        />
                    </form>

                    {/* Mic Toggle Button */}
                    <button 
                        onClick={toggleMic}
                        disabled={isThinking}
                        className={`p-4 rounded-full transition-all shadow-md shrink-0 flex items-center justify-center border-2 border-transparent
                            ${isListening ? 'bg-white text-red-500 shadow-md scale-110 border-red-100 z-20 relative' : 
                              isThinking ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 
                              'text-orange-500 hover:bg-orange-50 hover:border-orange-100 bg-white'}`}
                        title={isListening ? "Stop listening" : "Speak"}
                    >
                        {isListening ? (
                            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.5" fill="none"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                        ) : (
                            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.5" fill="none"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                        )}
                    </button>

                    {/* Voice/Send Button */}
                    <button 
                        onClick={() => handleSend()}
                        disabled={isThinking || !inputText.trim()}
                        className={`p-4 rounded-full transition-all shadow-md shrink-0 flex items-center justify-center mr-1
                            ${isThinking || !inputText.trim() 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-orange-500 text-white hover:bg-orange-600 hover:shadow-orange-500/30'
                            }`
                        }
                        title="Send Message"
                    >
                        {isThinking ? (
                            <svg viewBox="0 0 24 24" width="22" height="22" className="animate-spin text-orange-500"><path fill="currentColor" d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8Z"/></svg>
                        ) : (
                            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        )}
                    </button>
                    
                </div>
            </motion.div>

            <style dangerouslySetInnerHTML={{__html: `
                .dot-bg-light {
                    background-image: radial-gradient(circle, rgba(0,0,0,0.06) 1.5px, transparent 1.5px);
                    background-size: 24px 24px;
                }
            `}} />
        </main>
    );
}
