"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface TalkingAvatarProps {
  textToSpeak?: string;
  isActive?: boolean;
  sizeMode?: 'chat' | 'video';
}

const TOTAL_FRAMES = 80;

export default function TalkingAvatar({ textToSpeak, isActive, sizeMode = 'chat' }: TalkingAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameIndexRef = useRef(0);
  const animatingRef = useRef(false);
  const directionRef = useRef<1 | -1>(1);

  // Preload Images
  useEffect(() => {
    let loadedCount = 0;
    const loadedImages: HTMLImageElement[] = [];

    for (let i = 0; i < TOTAL_FRAMES; i++) {
        const img = new Image();
        const frameNumber = i.toString().padStart(3, '0');
        img.src = `/avatar_frames/WhatsApp Video 2026-03-26 at 10.43.59 PM_${frameNumber}.jpg`;
        
        img.onload = () => {
            loadedCount++;
            if (loadedCount === TOTAL_FRAMES) setImagesLoaded(true);
        };
        img.onerror = () => {
            // Fallback for missing images
            loadedCount++;
            if (loadedCount === TOTAL_FRAMES) setImagesLoaded(true);
        };
        loadedImages.push(img);
    }
    imagesRef.current = loadedImages;
  }, []);

  // Frame Rendering Logic
  const drawFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);

    const currentImg = imagesRef.current[frameIndex];
    if (currentImg && currentImg.naturalWidth > 0) {
        // Draw real human video frame keeping aspect ratio
        ctx.save();
        ctx.beginPath();
        ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
        ctx.clip();
        
        const scale = Math.max(size / currentImg.naturalWidth, size / currentImg.naturalHeight);
        const w = currentImg.naturalWidth * scale;
        const h = currentImg.naturalHeight * scale;
        const x = (size - w) / 2;
        const y = (size - h) / 2;
        
        ctx.drawImage(currentImg, x, y, w, h);
        ctx.restore();
    } else {
        // Aesthetic Fallback (Pulsing Energy Core)
        ctx.beginPath();
        ctx.arc(size/2, size/2, size*0.4, 0, Math.PI*2);
        
        // If animating (speaking), pulse faster
        const time = Date.now() / (animatingRef.current ? 150 : 800);
        const pulse = (Math.sin(time) + 1) / 2; 
        
        const radGrad = ctx.createRadialGradient(size/2, size/2, size*0.1, size/2, size/2, size*0.4);
        radGrad.addColorStop(0, `rgba(249, 115, 22, ${0.8 + pulse*0.2})`);
        radGrad.addColorStop(1, "rgba(249, 115, 22, 0)");
        
        ctx.fillStyle = radGrad;
        ctx.fill();

        // Inner solid core
        ctx.beginPath();
        ctx.arc(size/2, size/2, size*0.15 + pulse*size*0.05, 0, Math.PI*2);
        ctx.fillStyle = "#ffedd5"; 
        ctx.fill();
    }
  };

  // Audio Duration Estimation (Characters per second)
  const CHARS_PER_SECOND = 14; 
  const currentDurationRef = useRef(2000); // default 2s
  const startTimeRef = useRef(0);

  // Dedicated Render Loop synced to audio playback
  useEffect(() => {
    let animationFrameId: number;

    const animate = (time: number) => {
        if (!animatingRef.current) {
            // Halt gracefully on first frame
            if (frameIndexRef.current !== 0) {
                frameIndexRef.current = 0;
                drawFrame(0);
            } else {
                drawFrame(0);
            }
            animationFrameId = requestAnimationFrame(animate);
            return;
        }

        // Time-based synchronization
        const elapsedTime = time - startTimeRef.current;
        const duration = currentDurationRef.current;
        
        // Calculate progress (0.0 to 1.0)
        let progress = elapsedTime / duration;
        
        // If it speaks longer than estimated, we can loop it smoothly instead of freezing.
        // progress % 1.0 gives a repeating 0.0 to 1.0
        const loopProgress = progress % 1.0;
        
        // Ping-Pong mapping: 0.0 -> 1.0 -> 0.0 using a triangle wave
        const pingPong = 1 - Math.abs((loopProgress * 2) - 1);
        
        frameIndexRef.current = Math.floor(pingPong * (TOTAL_FRAMES - 1));

        drawFrame(frameIndexRef.current);

        animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [imagesLoaded]);

  // TTS Synchronization
  const [, setSpeakTick] = useState(0); // For forcing re-render of badge
  useEffect(() => {
    if (!textToSpeak) return;

    window.speechSynthesis.cancel();
    
    // Slight delay to simulate processing before answering
    const timer = setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        
        const voices = window.speechSynthesis.getVoices();
        
        // Find a Female English voice robustly (Zira on Windows, Samantha on macOS, or generic "female" label)
        const femaleKeywords = ["female", "zira", "samantha", "victoria", "karen", "tessa", "moira", "fiona"];
        let selectedVoice = voices.find(v => 
            v.lang.startsWith('en-') && femaleKeywords.some(k => v.name.toLowerCase().includes(k))
        );
        
        // Fallback to any english voice if a specific female one isn't explicitly named
        if (!selectedVoice) {
            selectedVoice = voices.find(v => v.lang.startsWith('en-'));
        }
        
        if (selectedVoice) utterance.voice = selectedVoice;
        
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
            animatingRef.current = true;
            startTimeRef.current = performance.now();
            currentDurationRef.current = Math.max((textToSpeak.length / CHARS_PER_SECOND) * 1000, 1000);
            setSpeakTick(t => t + 1);
        };

        utterance.onend = () => {
            animatingRef.current = false;
            setSpeakTick(t => t + 1);
        };

        utterance.onerror = (e) => {
            console.error("Speech Synthesis Error:", e);
            animatingRef.current = false;
            setSpeakTick(t => t + 1);
        };

        window.speechSynthesis.speak(utterance);
    }, 100);

    return () => {
        clearTimeout(timer);
        window.speechSynthesis.cancel();
        animatingRef.current = false;
    };
  }, [textToSpeak]);

  // Force cancel on pure unmount to prevent ghostly voices
  useEffect(() => {
    return () => {
        window.speechSynthesis.cancel();
    }
  }, []);

  return (
    <motion.div layoutId="ai-avatar" className="relative group cursor-pointer flex flex-col items-center justify-center">
        <div className={`
            ${sizeMode === 'video' 
                ? 'w-72 h-72 sm:w-80 sm:h-80 md:w-[450px] md:h-[450px] lg:w-[500px] lg:h-[500px] border-4 md:border-8 shadow-[0_0_100px_rgba(249,115,22,0.3)]' 
                : isActive ? 'w-32 h-32 md:w-56 md:h-56 border-[3px] md:border-4 shadow-[0_0_50px_rgba(249,115,22,0.2)]' : 'w-48 h-48 md:w-64 md:h-64 border-4 shadow-[0_0_50px_rgba(249,115,22,0.2)]'}
            rounded-full border-orange-500 bg-white relative flex items-center justify-center overflow-hidden transition-all duration-700 ease-out
            ${!isActive && sizeMode === 'chat' ? 'hover:scale-105' : ''}
        `}>
            {/* Neural Rings (Only decorative now, the image takes precedence but sits underneath if z-indexed!) */}
            <div className="absolute inset-2 md:inset-3 rounded-full border-2 border-orange-100 border-dashed animate-[spin_10s_linear_infinite] z-10 pointer-events-none"></div>
            <div className="absolute inset-4 md:inset-6 rounded-full border border-orange-200 animate-[spin_15s_linear_infinite_reverse] z-10 pointer-events-none"></div>
            
            <canvas 
                ref={canvasRef} 
                width={512} 
                height={512} 
                className="w-full h-full object-cover z-0 rounded-full"
            />
            
            {!imagesLoaded && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                    <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                </div>
            )}
        </div>
        
        {!isActive && sizeMode === 'chat' && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white px-4 py-1.5 rounded-full border border-gray-100 shadow-md whitespace-nowrap z-20">
                <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">Tap to start</span>
            </div>
        )}
        
        {isActive && sizeMode === 'chat' && (
            <div className="mt-6 flex flex-col items-center relative z-20">
                <span className="text-xs font-bold tracking-widest text-orange-500 bg-orange-50 border border-orange-100 px-4 py-1.5 rounded-full uppercase shadow-sm">
                    {animatingRef.current ? "Neuro Speaking" : "Neuro Listening"}
                </span>
            </div>
        )}
    </motion.div>
  );
}
