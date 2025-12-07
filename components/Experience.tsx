import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float, Sparkles, ContactShadows, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { FoliageParticles } from './FoliageParticles';
import { OrnamentParticles } from './OrnamentParticles';
import { GiftParticles } from './GiftParticles';
import { TopStar } from './TopStar';
import { Ribbon } from './Ribbon';
import { TreeMorphState } from '../types';
import { COLORS } from '../constants';

interface ExperienceProps {
  treeState: TreeMorphState;
}

export const Experience: React.FC<ExperienceProps> = ({ treeState }) => {
  return (
    <Canvas
      dpr={[1, 2]} // Handle high DPI screens
      gl={{ antialias: false, toneMappingExposure: 1.2 }}
      shadows
    >
      <color attach="background" args={[COLORS.bg]} />
      
      {/* Camera Setup */}
      <PerspectiveCamera makeDefault position={[0, 5, 45]} fov={35} />
      <OrbitControls 
        enablePan={false} 
        minDistance={20} 
        maxDistance={70} 
        maxPolarAngle={Math.PI / 1.8} // Prevent going too far below
        autoRotate={treeState === TreeMorphState.TREE_SHAPE}
        autoRotateSpeed={0.8}
      />

      {/* Cinematic Lighting */}
      <ambientLight intensity={0.4} color={COLORS.emeraldDark} />
      <spotLight 
        position={[20, 50, 20]} 
        angle={0.2} 
        penumbra={1} 
        intensity={2500} 
        castShadow 
        color={COLORS.goldLight}
        shadow-bias={-0.0001}
      />
      <pointLight position={[-15, 10, -15]} intensity={800} color={COLORS.emeraldLight} />
      <pointLight position={[15, -5, 15]} intensity={800} color={COLORS.orangeGold} />

      {/* Environment Reflections */}
      <Environment preset="city" />

      {/* Background Stars */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* The Tree Logic */}
      <group position={[0, -5, 0]}>
        <TopStar state={treeState} />
        <Ribbon state={treeState} />
        <FoliageParticles state={treeState} />
        <OrnamentParticles state={treeState} />
        <GiftParticles state={treeState} />
        
        {/* Floating magical dust */}
        <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
            <Sparkles 
                count={400} 
                scale={treeState === TreeMorphState.TREE_SHAPE ? 20 : 50} 
                size={6} 
                speed={0.4} 
                opacity={0.6} 
                color={COLORS.gold} 
            />
        </Float>
      </group>

      {/* Ground Shadow */}
      <ContactShadows 
        opacity={0.6} 
        scale={50} 
        blur={2.5} 
        far={10} 
        resolution={512} 
        color="#000000" 
      />

      {/* Post Processing for the "Arix Signature" Look */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.8} 
          mipmapBlur 
          intensity={1.5} 
          radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
        <Noise opacity={0.03} /> 
      </EffectComposer>
    </Canvas>
  );
};
