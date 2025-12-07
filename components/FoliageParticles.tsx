import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeMorphState, ParticleData } from '../types';
import { COLORS, TREE_CONFIG, ANIMATION_SPEED } from '../constants';

interface FoliageParticlesProps {
  state: TreeMorphState;
}

const tempObject = new THREE.Object3D();

export const FoliageParticles: React.FC<FoliageParticlesProps> = ({ state }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const particles = useMemo(() => {
    const data: ParticleData[] = [];
    const { foliageCount, treeHeight, baseRadius, scatterRadius } = TREE_CONFIG;

    for (let i = 0; i < foliageCount; i++) {
      // 1. Tree Position
      const y = Math.random() * treeHeight;
      const percentage = 1 - (y / treeHeight);
      const radiusAtHeight = baseRadius * percentage;
      
      const angle = Math.random() * Math.PI * 2;
      const r = (Math.random() * 0.2 + 0.8) * radiusAtHeight;
      
      const treePos = new THREE.Vector3(
        Math.cos(angle) * r,
        y - treeHeight / 2,
        Math.sin(angle) * r
      );

      // 2. Scatter Position
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const scatterR = Math.cbrt(Math.random()) * scatterRadius;
      
      const scatterPos = new THREE.Vector3(
        scatterR * Math.sin(phi) * Math.cos(theta),
        scatterR * Math.sin(phi) * Math.sin(theta),
        scatterR * Math.cos(phi)
      );

      data.push({
        treePosition: treePos,
        scatterPosition: scatterPos,
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
        scale: Math.random() * 0.5 + 0.5,
      });
    }
    return data;
  }, []);

  const currentPositions = useMemo(() => {
    return particles.map(p => p.scatterPosition.clone());
  }, [particles]);

  useLayoutEffect(() => {
    if (meshRef.current) {
      particles.forEach((data, i) => {
        tempObject.position.copy(data.scatterPosition);
        tempObject.rotation.set(...data.rotation);
        tempObject.scale.setScalar(data.scale);
        tempObject.updateMatrix();
        meshRef.current!.setMatrixAt(i, tempObject.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [particles]);

  useFrame((stateThree, delta) => {
    if (!meshRef.current) return;

    const isTree = state === TreeMorphState.TREE_SHAPE;
    const lerpFactor = THREE.MathUtils.clamp(delta * ANIMATION_SPEED, 0, 1);

    particles.forEach((data, i) => {
      const target = isTree ? data.treePosition : data.scatterPosition;
      
      currentPositions[i].lerp(target, lerpFactor);
      
      if (!isTree) {
        currentPositions[i].y += Math.sin(stateThree.clock.elapsedTime + i) * 0.02;
      } else {
         const wind = Math.sin(stateThree.clock.elapsedTime * 2 + currentPositions[i].y) * 0.05;
         currentPositions[i].x += wind * 0.01;
      }

      tempObject.position.copy(currentPositions[i]);
      tempObject.rotation.set(...data.rotation);
      
      tempObject.rotation.x += delta * 0.2;
      tempObject.rotation.y += delta * 0.1;

      tempObject.scale.setScalar(data.scale);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, TREE_CONFIG.foliageCount]} castShadow receiveShadow>
      <tetrahedronGeometry args={[0.2, 0]} />
      {/* Slightly warmer green to support gold theme */}
      <meshStandardMaterial 
        color={COLORS.emeraldWarm} 
        roughness={0.7}
        metalness={0.2}
        emissive={COLORS.emeraldDark}
        emissiveIntensity={0.1}
      />
    </instancedMesh>
  );
};