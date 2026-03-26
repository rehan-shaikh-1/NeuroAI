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
      <div className="relative z-10 flex flex-col items-center justify-center h-full">

        <div className="text-center space-y-4">
          <h1 className="text-gray-900 text-7xl font-black tracking-tighter uppercase italic drop-shadow-sm">
            NEURO<span className="text-orange-500">AI</span>
          </h1>
          <div className="h-[2px] w-24 bg-orange-500 mx-auto mb-4" />
          <p className="text-gray-500 font-mono tracking-[0.4em] text-sm uppercase font-bold">
            Neural Learning Interface
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => router.push('/session/models')}
          className="mt-16 px-10 py-4 bg-white border-2 border-orange-500/30 text-orange-500 font-bold tracking-widest hover:bg-orange-500 hover:text-white transition-all duration-300 rounded-lg shadow-lg shadow-orange-500/10 hover:shadow-orange-500/30 uppercase"
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