import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeMorphState, ParticleData } from '../types';
import { COLORS, TREE_CONFIG, ANIMATION_SPEED } from '../constants';

interface GiftParticlesProps {
  state: TreeMorphState;
}

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

export const GiftParticles: React.FC<GiftParticlesProps> = ({ state }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    const data: (ParticleData & { color: string })[] = [];
    const { giftCount, treeHeight, baseRadius, scatterRadius } = TREE_CONFIG;
    
    const giftPalette = [COLORS.giftRed, COLORS.giftGreen, COLORS.giftGold, COLORS.giftWhite, COLORS.goldDark];

    for (let i = 0; i < giftCount; i++) {
      // 1. Tree Position: Scattered around the base
      // Radius between baseRadius * 0.2 and baseRadius * 1.5 to pile them up
      const r = (Math.random() * 0.8 + 0.4) * baseRadius; 
      const theta = Math.random() * Math.PI * 2;
      
      // Height: Piled up on the floor, some slightly stacked
      const yStack = (Math.random() * 2); 
      
      const treePos = new THREE.Vector3(
        r * Math.cos(theta),
        -treeHeight / 2 + yStack * 0.8, // Near ground
        r * Math.sin(theta)
      );

      // 2. Scatter Position
      const scatterR = Math.cbrt(Math.random()) * scatterRadius;
      const u = Math.random();
      const v = Math.random();
      const phi = Math.acos(2 * v - 1);
      const scatterTheta = 2 * Math.PI * u;
      
      const scatterPos = new THREE.Vector3(
        scatterR * Math.sin(phi) * Math.cos(scatterTheta),
        scatterR * Math.sin(phi) * Math.sin(scatterTheta),
        scatterR * Math.cos(phi)
      );

      data.push({
        treePosition: treePos,
        scatterPosition: scatterPos,
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
        scale: Math.random() * 0.8 + 0.5, // Box size
        color: giftPalette[Math.floor(Math.random() * giftPalette.length)]
      });
    }
    return data;
  }, []);

  const currentPositions = useMemo(() => particles.map(p => p.scatterPosition.clone()), [particles]);

  useLayoutEffect(() => {
    if (meshRef.current) {
        particles.forEach((data, i) => {
            tempObject.position.copy(data.scatterPosition);
            tempObject.rotation.set(...data.rotation);
            tempObject.scale.setScalar(data.scale);
            tempObject.updateMatrix();
            meshRef.current!.setMatrixAt(i, tempObject.matrix);
            
            tempColor.set(data.color);
            meshRef.current!.setColorAt(i, tempColor);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [particles]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const isTree = state === TreeMorphState.TREE_SHAPE;
    // Gifts move slower, heavier
    const lerpFactor = THREE.MathUtils.clamp(delta * ANIMATION_SPEED * 0.6, 0, 1);

    particles.forEach((data, i) => {
      const target = isTree ? data.treePosition : data.scatterPosition;
      currentPositions[i].lerp(target, lerpFactor);

      tempObject.position.copy(currentPositions[i]);
      tempObject.rotation.set(...data.rotation);
      // Slowly rotate boxes when scattered
      if (!isTree) {
         tempObject.rotation.x += delta * 0.2;
         tempObject.rotation.y += delta * 0.2;
      }
      tempObject.scale.setScalar(data.scale);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, TREE_CONFIG.giftCount]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        roughness={0.2} 
        metalness={0.5} 
      />
    </instancedMesh>
  );
};