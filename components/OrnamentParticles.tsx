import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeMorphState, ParticleData } from '../types';
import { COLORS, TREE_CONFIG, ANIMATION_SPEED } from '../constants';

interface OrnamentParticlesProps {
  state: TreeMorphState;
}

// Reusable logic to generate particle data
const useOrnamentData = (count: number, type: 'bauble' | 'crystal') => {
  return useMemo(() => {
    const data: (ParticleData & { color: string })[] = [];
    const { treeHeight, baseRadius, scatterRadius } = TREE_CONFIG;
    
    // Rich golden/warm palette
    const colorPalette = [
        COLORS.gold, 
        COLORS.gold, 
        COLORS.amber, 
        COLORS.orangeGold, 
        COLORS.bronze,
        COLORS.champagne,
        COLORS.pearl, // Adds some white elegance
        COLORS.deepRed // Occasional accent
    ];

    for (let i = 0; i < count; i++) {
      // 1. Tree Position
      const y = Math.random() * treeHeight;
      const heightPercent = y / treeHeight; // 0 (bottom) to 1 (top)
      const percentage = 1 - heightPercent;
      
      const radiusAtHeight = baseRadius * percentage;
      const angle = i * 2.4; 
      
      const treePos = new THREE.Vector3(
        Math.cos(angle) * (radiusAtHeight + (type === 'bauble' ? 0.3 : 0.6)), // Crystals stick out more
        y - treeHeight / 2,
        Math.sin(angle) * (radiusAtHeight + (type === 'bauble' ? 0.3 : 0.6))
      );

      // 2. Scatter Position
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const scatterR = Math.cbrt(Math.random()) * scatterRadius * 1.5;
      
      const scatterPos = new THREE.Vector3(
        scatterR * Math.sin(phi) * Math.cos(theta),
        scatterR * Math.sin(phi) * Math.sin(theta),
        scatterR * Math.cos(phi)
      );

      // 3. Size Gradient Logic: Bigger at bottom, smaller at top
      // Baubles: 0.3 to 0.7
      // Crystals: 0.2 to 0.5
      const baseScale = type === 'bauble' ? 0.7 : 0.5;
      const minScale = 0.25;
      const scale = minScale + (baseScale - minScale) * (1 - heightPercent * 0.8);

      data.push({
        treePosition: treePos,
        scatterPosition: scatterPos,
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
        scale: scale,
        color: colorPalette[Math.floor(Math.random() * colorPalette.length)]
      });
    }
    return data;
  }, [count, type]);
};

// Sub-component for rendering an instanced mesh
const OrnamentLayer: React.FC<{ 
  state: TreeMorphState, 
  geometry: THREE.BufferGeometry, 
  material: THREE.Material,
  count: number,
  type: 'bauble' | 'crystal'
}> = ({ state, geometry, material, count, type }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particles = useOrnamentData(count, type);
  const currentPositions = useMemo(() => particles.map(p => p.scatterPosition.clone()), [particles]);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

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
    const lerpFactor = THREE.MathUtils.clamp(delta * ANIMATION_SPEED * 0.8, 0, 1);

    particles.forEach((data, i) => {
      const target = isTree ? data.treePosition : data.scatterPosition;
      currentPositions[i].lerp(target, lerpFactor);

      tempObject.position.copy(currentPositions[i]);
      tempObject.rotation.set(...data.rotation);
      // Gentle rotation for crystals
      if (type === 'crystal') {
          tempObject.rotation.y += delta * 0.5;
      }
      tempObject.scale.setScalar(data.scale);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh 
        ref={meshRef} 
        args={[undefined, undefined, count]} 
        geometry={geometry} 
        material={material} 
        castShadow
    />
  );
};

export const OrnamentParticles: React.FC<OrnamentParticlesProps> = ({ state }) => {
  const { ornamentCount } = TREE_CONFIG;
  
  // Split count: 70% Baubles, 30% Crystals
  const baubleCount = Math.floor(ornamentCount * 0.7);
  const crystalCount = ornamentCount - baubleCount;

  // Geometries
  const sphereGeo = useMemo(() => new THREE.IcosahedronGeometry(0.5, 2), []);
  const diamondGeo = useMemo(() => new THREE.OctahedronGeometry(0.5, 0), []); // Sharp diamond

  // Materials
  const baubleMat = useMemo(() => new THREE.MeshStandardMaterial({
    roughness: 0.15,
    metalness: 0.9,
    emissive: COLORS.goldDark,
    emissiveIntensity: 0.1
  }), []);

  const crystalMat = useMemo(() => new THREE.MeshStandardMaterial({
    roughness: 0.0,
    metalness: 1.0,
    color: '#ffffff', // Base white, tinted by instance color
    emissive: '#444444',
    emissiveIntensity: 0.2
  }), []);

  return (
    <group>
      <OrnamentLayer 
        state={state} 
        count={baubleCount} 
        type="bauble" 
        geometry={sphereGeo} 
        material={baubleMat} 
      />
      <OrnamentLayer 
        state={state} 
        count={crystalCount} 
        type="crystal" 
        geometry={diamondGeo} 
        material={crystalMat} 
      />
    </group>
  );
};
