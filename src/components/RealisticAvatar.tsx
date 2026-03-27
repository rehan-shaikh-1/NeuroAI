"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface RealisticAvatarProps {
  textToSpeak?: string;
  isActive?: boolean;
  sizeMode?: 'chat' | 'video';
}

export default function RealisticAvatar({ textToSpeak, isActive, sizeMode = 'chat' }: RealisticAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  // Dual RAM Caches
  const hiImagesRef = useRef<HTMLImageElement[]>([]);
  const talkingImagesRef = useRef<HTMLImageElement[]>([]);
  
  const animatingRef = useRef(false);
  const currentFrameRef = useRef(0);
  const playModeRef = useRef<'hi' | 'talking'>('hi');
  const animationFrameId = useRef<number | null>(null);

  // 1. Initial Asset Preloading Engine
  useEffect(() => {
    let hiLoaded = 0;
    let talkLoaded = 0;
    
    // The exact sequence indexes you have in your public folders
    const hiIndexes = ["000", "001", "002", "003", "004", "005", "006", "007", "008", "009", "010", "011", "012", "013", "014", "026"];
    const talkIndexes = ["015", "016", "017", "018", "019", "020", "021", "022", "023", "024", "025"];

    const totalToLoad = hiIndexes.length + talkIndexes.length;

    // Load Hi frames
    hiIndexes.forEach((idx) => {
        const img = new Image();
        img.src = `/realistic_girl_avatar_frames/hi/AI_Avatar_Video_Generation_Request_${idx}.jpg`;
        img.onload = () => {
            hiLoaded++;
            if (hiLoaded + talkLoaded === totalToLoad) setImagesLoaded(true);
        };
        hiImagesRef.current.push(img);
    });

    // Load Talk frames
    talkIndexes.forEach((idx) => {
        const img = new Image();
        img.src = `/realistic_girl_avatar_frames/taking/AI_Avatar_Video_Generation_Request_${idx}.jpg`;
        img.onload = () => {
            talkLoaded++;
            if (hiLoaded + talkLoaded === totalToLoad) setImagesLoaded(true);
        };
        talkingImagesRef.current.push(img);
    });

    return () => {
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  // 2. Play initial "Hi" greeting on mount
  useEffect(() => {
    // Only auto-play the greeting if the image cache has successfully hydrated
    if (imagesLoaded) {
      setTimeout(() => {
        const sentence = "Hi, I am your Realistic AI teacher. How can I help you today?";
        triggerVoiceAndAnimation(sentence, 'hi');
      }, 500); // Brief delay for mounting aesthetics
    }
  }, [imagesLoaded]);

  // 3. React to new textual inputs when chatting
  useEffect(() => {
    if (textToSpeak && textToSpeak.trim() !== "") {
      triggerVoiceAndAnimation(textToSpeak, 'talking');
    }
  }, [textToSpeak]);

  // --- Animation Core --- //
  const triggerVoiceAndAnimation = (text: string, mode: 'hi' | 'talking') => {
    if (!("speechSynthesis" in window)) {
        console.error("SpeechSynthesis API not supported");
        return;
    }

    window.speechSynthesis.cancel();
    playModeRef.current = mode;
    currentFrameRef.current = 0; // Reset frame timeline

    const utterance = new SpeechSynthesisUtterance(text);
    
    const pickBestVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        const priority = [
            "Google UK English Female",
            "Google US English",
            "Google UK English Male",
            "Microsoft Zira",
            "Microsoft David",
            "Samantha",
            "Karen",
            "Daniel",
            "Moira",
        ];
        for (const name of priority) {
            const v = voices.find(v => v.name === name);
            if (v) return v;
        }
        return voices.find(v => v.lang.startsWith('en-')) ?? null;
    };

    const voice = pickBestVoice();
    if (voice) utterance.voice = voice;
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    utterance.onstart = () => {
        animatingRef.current = true;
        animateSequence();
    };

    utterance.onend = () => {
        animatingRef.current = false;
        // Rest on the final frame of the active sequence instead of snapping back to zero
        const activeArray = playModeRef.current === 'hi' ? hiImagesRef.current : talkingImagesRef.current;
        if (activeArray.length > 0) {
            drawFrame(activeArray[activeArray.length - 1]);
        }
    };

    window.speechSynthesis.speak(utterance);
  };

  const drawFrame = (img: HTMLImageElement) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Object-fit: cover logic to seamlessly scale landscape images into the circular clipping mask
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const renderWidth = img.width * scale;
      const renderHeight = img.height * scale;
      const offsetX = (canvas.width - renderWidth) / 2;
      const offsetY = (canvas.height - renderHeight) / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
  };

  const animateSequence = () => {
      if (!animatingRef.current) return;

      const activeArray = playModeRef.current === 'hi' ? hiImagesRef.current : talkingImagesRef.current;
      
      // Safety net
      if (activeArray.length === 0) return;

      drawFrame(activeArray[currentFrameRef.current]);

      currentFrameRef.current++;
      
      if (currentFrameRef.current >= activeArray.length) {
          if (playModeRef.current === 'hi') {
              // Stop the 'hi' animation exactly on the final frame (play once)
              currentFrameRef.current = activeArray.length - 1;
              return; 
          } else {
              // Standard loop for the 'talking' animation
              currentFrameRef.current = 0; 
          }
      }

      // Dynamic Frame Rate: noticeably slower for 'hi', standard sequence for 'talking'
      const fps = playModeRef.current === 'hi' ? 10 : 24;

      setTimeout(() => {
          animationFrameId.current = requestAnimationFrame(animateSequence);
      }, 1000 / fps);
  };

  // Draw initial fallback frame once loaded
  useEffect(() => {
      if (imagesLoaded && !animatingRef.current && hiImagesRef.current[0]) {
          drawFrame(hiImagesRef.current[0]);
      }
  }, [imagesLoaded]);

  return (
    <motion.div layoutId="realistic-avatar" className="relative group cursor-pointer flex flex-col items-center justify-center">
        <div className={`
            ${sizeMode === 'video' 
                ? 'w-72 h-72 sm:w-80 sm:h-80 md:w-[450px] md:h-[450px] lg:w-[500px] lg:h-[500px] border-4 md:border-8 shadow-[0_0_100px_rgba(236,72,153,0.3)]' 
                : isActive ? 'w-32 h-32 md:w-56 md:h-56 border-[3px] md:border-4 shadow-[0_0_50px_rgba(236,72,153,0.2)]' : 'w-48 h-48 md:w-64 md:h-64 border-4 shadow-[0_0_50px_rgba(236,72,153,0.2)]'}
            rounded-full border-pink-500 bg-white relative flex items-center justify-center overflow-hidden transition-all duration-700 ease-out
            ${!isActive && sizeMode === 'chat' ? 'hover:scale-105' : ''}
        `}>
            {/* Pink Decor Rings for Realistic AI branding */}
            <div className="absolute inset-2 md:inset-3 rounded-full border-2 border-pink-100 border-dashed animate-[spin_10s_linear_infinite] z-10 pointer-events-none"></div>

            <canvas 
                ref={canvasRef} 
                width={500} 
                height={500} 
                className="w-full h-full object-cover z-20"
            />

            {!imagesLoaded && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                    <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
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
                <span className="text-xs font-bold tracking-widest text-pink-500 bg-pink-50 border border-pink-100 px-4 py-1.5 rounded-full uppercase shadow-sm">
                    {animatingRef.current ? "Realistic Speaking" : "Realistic Listening"}
                </span>
            </div>
        )}
    </motion.div>
  );
}
