"use client";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { VRMLoaderPlugin } from "@pixiv/three-vrm";
import { motion } from "framer-motion";

interface VrmAvatarProps {
  textToSpeak?: string;
  isActive?: boolean;
  sizeMode?: 'chat' | 'video' | 'card';
}

function VrmModel({ url, isTalking }: { url: string; isTalking: boolean }) {
  const [vrm, setVrm] = useState<any>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    let active = true;
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    loader.load(url, (gltf) => {
      if (!active) return;
      const vrmData = gltf.userData.vrm;
      vrmData.scene.rotation.y = Math.PI; // Face camera correctly
      
      // Relax arms from T-Pose into a natural neutral A-Pose
      const leftArm = vrmData.humanoid.getNormalizedBoneNode('leftUpperArm');
      const rightArm = vrmData.humanoid.getNormalizedBoneNode('rightUpperArm');
      if (leftArm) leftArm.rotation.z = Math.PI / 3;
      if (rightArm) rightArm.rotation.z = -Math.PI / 3;

      setVrm(vrmData);
    });
    return () => { active = false; };
  }, [url]);

  useFrame((state, delta) => {
    if (vrm) {
      vrm.update(delta);
      const neck = vrm.humanoid.getNormalizedBoneNode('neck');
      const spine = vrm.humanoid.getNormalizedBoneNode('spine');

      if (isTalking) {
        timeRef.current += delta * 12.0; // Talking speed scalar
        const openAmount = Math.max(0, Math.sin(timeRef.current));
        vrm.expressionManager.setValue('aa', openAmount);

        // Simple procedural body language while talking
        if (neck) {
            neck.rotation.x = Math.sin(timeRef.current * 0.4) * 0.08;
            neck.rotation.y = Math.cos(timeRef.current * 0.3) * 0.05;
        }
        if (spine) {
            spine.rotation.z = Math.sin(timeRef.current * 0.2) * 0.03;
        }
      } else {
        vrm.expressionManager.setValue('aa', 0);
        // Smoothly lerp skeletal rotations back to center when quiet
        if (neck) {
            neck.rotation.x = THREE.MathUtils.lerp(neck.rotation.x, 0, 0.1);
            neck.rotation.y = THREE.MathUtils.lerp(neck.rotation.y, 0, 0.1);
        }
        if (spine) {
            spine.rotation.z = THREE.MathUtils.lerp(spine.rotation.z, 0, 0.1);
        }
      }

      // Idle Breathing Animation (Always active)
      const chest = vrm.humanoid.getNormalizedBoneNode('chest');
      if (chest) {
          const breath = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.015;
          chest.scale.set(breath, breath, breath);
      }
    }
  });

  if (!vrm) return null;
  // Push character up so face centers cleanly for Bizdude models
  return <primitive object={vrm.scene} position={[0, -0.4, 0]} />;
}

export default function VrmAvatar({ textToSpeak, isActive, sizeMode = 'chat' }: VrmAvatarProps) {
  const [isTalking, setIsTalking] = useState(false);
  const [, setSpeakTick] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Map speech synthesis identically to the Talk Avatar flips
  useEffect(() => {
    if (!textToSpeak) return;

    if (audioRef.current) audioRef.current.pause();
    
    const timer = setTimeout(() => {
        const url = `http://localhost:8000/api/v1/tts?text=${encodeURIComponent(textToSpeak)}&model=vrm`;
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onplay = () => {
            setIsTalking(true);
            setSpeakTick(t => t + 1);
        };

        audio.onended = () => {
            setIsTalking(false);
            setSpeakTick(t => t + 1);
        };

        audio.onerror = () => {
            setIsTalking(false);
            setSpeakTick(t => t + 1);
        };

        audio.play().catch(e => console.error("Playback failed:", e));

    }, 100);

    return () => { 
        clearTimeout(timer); 
        if (audioRef.current) audioRef.current.pause(); 
        setIsTalking(false); 
    };
  }, [textToSpeak]);

  useEffect(() => {
    return () => {
        if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const vrmUrl = '/Bizdude.vrm';

  if (sizeMode === 'card') {
      return (
          <div className="absolute inset-0 w-full h-full">
              <Canvas camera={{ position: [0, 0, 3], fov: 30 }}>
                  <ambientLight intensity={2} />
                  <directionalLight position={[1, 1, 1]} intensity={1} />
                  <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} maxPolarAngle={Math.PI / 2 + 0.1} minPolarAngle={Math.PI / 3} target={[0, 1.4, 0]} />
                  <VrmModel url={vrmUrl} isTalking={false} />
              </Canvas>
          </div>
      );
  }

  return (
    <motion.div layoutId="vrm-avatar" className="relative group cursor-pointer flex flex-col items-center justify-center">
        <div className={`
            ${sizeMode === 'video' 
                ? 'w-72 h-72 sm:w-80 sm:h-80 md:w-[450px] md:h-[450px] lg:w-[500px] lg:h-[500px] border-4 md:border-8 shadow-[0_0_100px_rgba(249,115,22,0.3)]' 
                : isActive ? 'w-48 h-48 md:w-72 md:h-72 border-[3px] md:border-4 shadow-[0_0_50px_rgba(249,115,22,0.2)]' : 'w-48 h-48 md:w-64 md:h-64 border-4 shadow-[0_0_50px_rgba(249,115,22,0.2)]'}
            rounded-full border-orange-500 bg-[#1a1a2e] relative flex items-center justify-center overflow-hidden transition-all duration-700 ease-out
            ${!isActive && sizeMode === 'chat' ? 'hover:scale-105' : ''}
        `}>
            {/* Neural Rings Overlay */}
            <div className="absolute inset-2 md:inset-3 rounded-full border-2 border-orange-100 border-dashed animate-[spin_10s_linear_infinite] z-20 pointer-events-none"></div>
            <div className="absolute inset-4 md:inset-6 rounded-full border border-orange-200 animate-[spin_15s_linear_infinite_reverse] z-20 pointer-events-none"></div>
            
            {/* True 3D R3F Canvas */}
            <div className="absolute inset-0 z-10">
                <Canvas camera={{ position: [0, 0, 3], fov: 30 }}>
                    <ambientLight intensity={2} />
                    <directionalLight position={[1, 1, 1]} intensity={1} />
                    {/* The controls clamp looking too far up/down */}
                    <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.1} minPolarAngle={Math.PI / 3} target={[0, 1.4, 0]} />
                    <VrmModel url={vrmUrl} isTalking={isTalking} />
                </Canvas>
            </div>
        </div>
        
        {!isActive && sizeMode === 'chat' && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white px-4 py-1.5 rounded-full border border-gray-100 shadow-md whitespace-nowrap z-30">
                <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">Tap to start interactions</span>
            </div>
        )}

        {isActive && sizeMode === 'chat' && (
            <div className="mt-6 flex flex-col items-center relative z-20">
                <span className="text-xs font-bold tracking-widest text-orange-500 bg-orange-50 border border-orange-100 px-4 py-1.5 rounded-full uppercase shadow-sm">
                    {isTalking ? "Neuro Speaking" : "Neuro Listening"}
                </span>
            </div>
        )}
    </motion.div>
  );
}
