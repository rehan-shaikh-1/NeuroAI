"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import TalkingAvatar from "../../components/TalkingAvatar";
import RealisticAvatar from "../../components/RealisticAvatar";
import VrmAvatar from "../../components/VrmAvatar";

export default function ChatPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const model = searchParams.get('model') || 'neuro-core';
    const [avatarMode, setAvatarMode] = useState<"2d" | "3d">(model === 'cartoon-ai' ? "3d" : "2d");
    const [isActive, setIsActive] = useState(false);
    const [inputText, setInputText] = useState("");
    const [messages, setMessages] = useState<{text: string, sender: string}[]>([]);
    const [lastAiMessage, setLastAiMessage] = useState("");
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const toggleMic = () => {
        if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            alert('Speech recognition is not supported in your browser. Please use Chrome.');
            return;
        }
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInputText(transcript);
            // Auto-send after voice capture
            setTimeout(() => {
                setMessages(prev => [...prev, { text: transcript, sender: "user" }]);
                if (!isActive) setIsActive(true);
                setInputText("");
                sendMessage(transcript);
            }, 100);
        };
        recognitionRef.current = recognition;
        recognition.start();
    };

    const sendMessage = async (userMsg: string) => {
        try {
            const history = messages.map(msg => ({ 
                role: msg.sender === "user" ? "user" : "assistant", 
                content: msg.text 
            }));
            const response = await fetch("http://localhost:8000/api/v1/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: "Ashish",
                    raw_input: userMsg,
                    history: history,
                    target_skill: userMsg,
                    education_level: "Undergraduate"
                })
            });
            if (!response.ok) throw new Error("Connection failed");
            const data = await response.json();
            setMessages(prev => [...prev, { text: data.reply, sender: "ai" }]);
            setLastAiMessage(data.reply);
        } catch (err) {
            console.error(err);
            const fallback = "Neuro Core is offline. Please start the backend server.";
            setMessages(prev => [...prev, { text: fallback, sender: "ai" }]);
            setLastAiMessage(fallback);
        }
    };

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!isActive) setIsActive(true);
        if (inputText.trim()) {
            const userMsg = inputText;
            setMessages(prev => [...prev, { text: userMsg, sender: "user" }]);
            setInputText("");
            await sendMessage(userMsg);
        }
    };

    return (
        <main className="h-screen w-full dot-bg-light text-black flex flex-col overflow-hidden relative font-sans selection:bg-orange-200">
            {/* Header */}
            <header className="absolute top-0 w-full flex justify-between items-center p-6 lg:p-8 z-10">
                <button
                    onClick={() => router.push('/')}
                    className="text-orange-500 font-extrabold tracking-tighter italic text-xl drop-shadow-sm hover:scale-105 transition-transform origin-left"
                >
                    NEURO AI
                </button>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setAvatarMode(prev => prev === "3d" ? "2d" : "3d")}
                        className="text-xs font-bold text-orange-600 bg-orange-100 hover:bg-orange-200 px-4 py-2 rounded-full transition-colors flex items-center shadow-sm"
                    >
                        {avatarMode === "3d" ? "Switch to 2D" : "Switch to 3D"}
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="text-xs font-bold text-gray-500 hover:text-gray-900 bg-white/50 hover:bg-white px-4 py-2 border border-gray-200 rounded-full uppercase tracking-widest transition-all shadow-sm flex items-center gap-2"
                    >
                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        Terminate Session
                    </button>
                </div>
            </header>

            {/* Layout Transitions */}
            <div className="flex-grow w-full max-w-7xl mx-auto flex items-center justify-center p-6 md:p-12 pt-28">
                
                {/* Initial View */}
                {!isActive && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center h-full gap-12"
                    >
                        {/* Avatar */}
                        <div onClick={() => setIsActive(true)}>
                            {avatarMode === "3d" ? (
                                <VrmAvatar isActive={false} textToSpeak={lastAiMessage} sizeMode="chat" />
                            ) : model === 'realistic-teacher' ? (
                                <RealisticAvatar isActive={false} textToSpeak={lastAiMessage} sizeMode="chat" />
                            ) : (
                                <TalkingAvatar isActive={false} textToSpeak={lastAiMessage} sizeMode="chat" />
                            )}
                        </div>

                        {/* Input Area */}
                        <motion.form 
                            layoutId="chat-input-form"
                            onSubmit={handleSend}
                            className="w-full max-w-md flex items-center gap-2 bg-white border border-gray-200 shadow-2xl shadow-orange-500/5 rounded-full p-2 pl-6"
                        >
                            <input 
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Ask Neuro AI to explain a topic..."
                                className="flex-grow bg-transparent outline-none text-gray-800 placeholder-gray-400 font-medium"
                            />
                            <button type="button" onClick={() => setIsActive(true)} className="p-3 text-orange-500 bg-orange-50 rounded-full hover:bg-orange-100 transition-colors shrink-0">
                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                            </button>
                            <button type="submit" className="bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 transition-all shadow-md shrink-0">
                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            </button>
                        </motion.form>
                    </motion.div>
                )}

                {/* Active Chat View */}
                {isActive && (
                    <div className="w-full h-full flex flex-col md:flex-row gap-6 md:gap-10">
                        
                        {/* Left Side: Avatar */}
                        <div className="w-full md:w-1/3 flex flex-col items-center justify-center shrink-0 mb-6 md:mb-0">
                            {avatarMode === "3d" ? (
                                <VrmAvatar isActive={true} textToSpeak={lastAiMessage} sizeMode="chat" />
                            ) : model === 'realistic-teacher' ? (
                                <RealisticAvatar isActive={true} textToSpeak={lastAiMessage} sizeMode="chat" />
                            ) : (
                                <TalkingAvatar isActive={true} textToSpeak={lastAiMessage} sizeMode="chat" />
                            )}
                        </div>

                        {/* Right Side: Chat Area */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20, scale: 0.98 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{ delay: 0.1, duration: 0.4 }}
                            className="w-full md:w-2/3 h-full flex flex-col bg-white border border-gray-200 shadow-2xl rounded-[2rem] overflow-hidden relative"
                        >
                            {/* Chat Header */}
                            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white z-10 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500">
                                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-gray-800 tracking-tight">Audio Transcript</h2>
                                        <p className="text-xs text-gray-400 font-medium">Auto-generated syncing session</p>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-gray-800 transition-colors p-2 bg-gray-50 hover:bg-gray-100 rounded-full">
                                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-grow p-6 overflow-y-auto space-y-6 custom-scrollbar bg-slate-50/50">
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                            <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none" className="opacity-40"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                        </div>
                                        <p className="font-medium text-center">Say hello to Neuro AI to begin a voice session.<br/>Audio will sync with the Avatar.</p>
                                    </div>
                                ) : (
                                    messages.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                                            <div className={`p-4 rounded-2xl max-w-[85%] w-fit text-sm md:text-base leading-relaxed shadow-sm break-words overflow-hidden ${
                                                msg.sender === "user" 
                                                ? "bg-orange-500 text-white rounded-tr-sm" 
                                                : "bg-white border border-gray-100 text-gray-700 rounded-tl-sm shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
                                            }`} style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Form at Bottom */}
                            <div className="p-4 sm:p-5 bg-white border-t border-gray-100 shrink-0">
                                <motion.form 
                                    layoutId="chat-input-form"
                                    onSubmit={handleSend}
                                    className="w-full flex items-center gap-2 sm:gap-3 bg-gray-50 border border-gray-200 rounded-full p-2 pl-4 sm:pl-6 focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500/50 transition-all"
                                >
                                    <input 
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Message Neuro AI..."
                                        className="flex-grow bg-transparent outline-none text-gray-800 placeholder-gray-400 font-medium text-sm sm:text-base w-full min-w-0"
                                    />
                                    <button type="button" onClick={toggleMic} className={`p-2 sm:p-2.5 rounded-full border transition-all shrink-0 ${isListening ? 'bg-red-500 text-white border-red-500 animate-pulse' : 'text-gray-400 hover:bg-white hover:text-orange-500 border-transparent hover:border-gray-200'}`} title={isListening ? "Stop listening" : "Speak"}>
                                        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                                    </button>
                                    <button type="submit" className="bg-orange-500 text-white p-2.5 sm:p-3 rounded-full hover:bg-orange-600 transition-all shadow-md shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                                        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                    </button>
                                </motion.form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .dot-bg-light {
                    background-color: #fcfcfc;
                    background-image: radial-gradient(circle, rgba(0,0,0,0.05) 1.5px, transparent 1.5px);
                    background-size: 24px 24px;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(0, 0, 0, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(0, 0, 0, 0.2);
                }
            `}} />
        </main>
    );
}