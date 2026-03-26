"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Page() {
  const router = useRouter();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePos({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <main className="relative w-screen h-screen bg-[#fcfcfc] overflow-hidden dot-bg-light text-black">

      {/* 1. SPOTLIGHT LAYER */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        animate={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(249, 115, 22, 0.15), transparent 90%)`,
        }}
        transition={{ type: "tween", ease: "backOut", duration: 0.5 }}
      />


      {/* 2. CENTRAL CONTENT LAYER */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full pt-10 px-4">

        {/* Vertical Hero Layout: Avatar Top, Logo Bottom */}
        <div className="flex flex-col items-center justify-center relative z-20 mb-0">

          {/* Native Cutout Hero Avatar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            className="w-48 md:w-[350px] lg:w-[420px] pointer-events-none mix-blend-multiply z-20 mb-0 md:mb-4"
            style={{ filter: "drop-shadow(0px 20px 25px rgba(249, 115, 22, 0.15))" }}
          >
            <img
              src="/HomeScreenAvatar/avatar.png"
              alt="Neuro AI Hero"
              className="w-full h-auto object-contain"
            />
          </motion.div>

          {/* Logo */}
          <h1 className="text-gray-900 text-6xl md:text-[8rem] font-black tracking-tighter uppercase italic drop-shadow-md z-30 leading-none">
            NEURO<span className="text-orange-500">AI</span>
          </h1>
        </div>

        {/* Subtitles sitting perfectly crisp below the logo */}
        <div className="flex flex-col items-center z-20 mb-10 md:mb-12 mt-0 md:-mt-2">
          <div className="h-[2px] w-16 md:w-24 bg-orange-500 mx-auto mb-3 md:mb-4" />
          <p className="text-gray-500 font-mono tracking-[0.3em] md:tracking-[0.4em] text-[10px] md:text-sm uppercase font-bold text-center">
            Neural Learning Interface
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => router.push('/session/models')}
          className="px-10 py-4 bg-white border border-gray-100 text-orange-600 font-bold tracking-[0.2em] transform transition-all duration-300 hover:scale-105 hover:bg-orange-500 hover:text-white rounded-full shadow-[0_10px_40px_rgba(249,115,22,0.15)] uppercase z-30"
        >
          BEGIN SESSION
        </button>

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