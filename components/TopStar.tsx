import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeMorphState } from '../types';
import { COLORS, TREE_CONFIG, ANIMATION_SPEED } from '../constants';

interface TopStarProps {
  state: TreeMorphState;
}

export const TopStar: React.FC<TopStarProps> = ({ state }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Create 5-pointed Star Shape
  const starGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 1.8; // Huge star
    const innerRadius = 0.8;

    for (let i = 0; i < points * 2; i++) {
      const r = (i % 2 === 0) ? outerRadius : innerRadius;
      const angle = (i / (points * 2)) * Math.PI * 2;
      const x = Math.cos(angle + Math.PI / 2) * r; // Rotate to point up
      const y = Math.sin(angle + Math.PI / 2) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    const extrudeSettings = {
      depth: 0.5,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.1,
      bevelThickness: 0.1,
    };

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center(); // Center geometry for correct rotation
    return geo;
  }, []);

  // Define positions
  const positions = useMemo(() => {
    const { treeHeight, scatterRadius } = TREE_CONFIG;
    
    // Tree Position: Exactly at the top tip
    const treePos = new THREE.Vector3(0, treeHeight / 2 + 1.5, 0);

    // Scatter Position: Random somewhere far
    const scatterR = scatterRadius * 0.8;
    const scatterPos = new THREE.Vector3(
      (Math.random() - 0.5) * scatterR,
      (Math.random() - 0.5) * scatterR + 10, 
      (Math.random() - 0.5) * scatterR
    );

    return { treePos, scatterPos };
  }, []);

  const currentPos = useRef(positions.scatterPos.clone());

  useLayoutEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.copy(positions.scatterPos);
    }
  }, [positions]);

  useFrame((stateThree, delta) => {
    if (!meshRef.current) return;

    const isTree = state === TreeMorphState.TREE_SHAPE;
    const lerpFactor = THREE.MathUtils.clamp(delta * ANIMATION_SPEED, 0, 1);
    const target = isTree ? positions.treePos : positions.scatterPos;

    // Smooth movement
    currentPos.current.lerp(target, lerpFactor);
    
    // Add floating motion
    const floatY = Math.sin(stateThree.clock.elapsedTime * 1.5) * 0.1;
    
    // Rotate the star continuously
    meshRef.current.rotation.y += delta * 0.5;

    // Apply positions
    meshRef.current.position.copy(currentPos.current);
    meshRef.current.position.y += floatY;
    
    // Sync glow mesh
    if (glowRef.current) {
        glowRef.current.position.copy(meshRef.current.position);
        glowRef.current.rotation.copy(meshRef.current.rotation);
        const scalePulse = 1.1 + Math.sin(stateThree.clock.elapsedTime * 4) * 0.1;
        glowRef.current.scale.setScalar(scalePulse);
    }
  });

  return (
    <>
      <mesh ref={meshRef} geometry={starGeometry} castShadow>
        <meshStandardMaterial 
          color={COLORS.gold} 
          emissive={COLORS.gold}
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={1}
        />
      </mesh>
      
      {/* Outer Glow Halo */}
      <mesh ref={glowRef} geometry={starGeometry}>
        <meshBasicMaterial 
            color={COLORS.goldLight} 
            transparent 
            opacity={0.3} 
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
        />
      </mesh>
    </>
  );
};
