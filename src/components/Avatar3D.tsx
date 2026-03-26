"use client";
import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, ContactShadows } from "@react-three/drei";

// The Model loader logic, wrapped in Suspense for async fetching
function Model({ url }: { url: string }) {
    const { scene } = useGLTF(url);
    
    // Scale and position fixes applied dynamically so the model fits the card screen
    return <primitive object={scene} scale={2} position={[0, -1.8, 0]} />;
}

// Ensure the GLTF binary doesn't block the rest of the Next.js page load
useGLTF.preload("/models/cartoon-ai.glb");

export default function Avatar3D() {
    return (
        <div className="w-full h-full absolute inset-0 z-10 cursor-grab active:cursor-grabbing">
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                {/* Cinematic Base Lighting */}
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow shadow-mapSize={1024} />
                <directionalLight position={[-5, 5, -5]} intensity={0.5} />
                
                {/* Pre-rendered HDRI reflections help metal/skin materials pop realistically */}
                <Environment preset="city" />
                
                <Suspense fallback={null}>
                    <Model url="/models/cartoon-ai.glb" />
                </Suspense>

                {/* Adds a grounding soft shadow underneath the avatar inside the card */}
                <ContactShadows opacity={0.4} scale={10} blur={2} far={4} position={[0, -1.8, 0]} />

                {/* Interaction & Auto-rotation Controls */}
                <OrbitControls 
                    enableZoom={false} 
                    enablePan={false}
                    autoRotate={true}         
                    autoRotateSpeed={1.5}     
                    maxPolarAngle={Math.PI / 2 + 0.1} // Stop user from looking from bottom
                    minPolarAngle={Math.PI / 3}       // Stop user from looking straight down
                />
            </Canvas>
        </div>
    );
}
