import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeMorphState } from '../types';
import { COLORS, TREE_CONFIG, ANIMATION_SPEED } from '../constants';

interface RibbonProps {
  state: TreeMorphState;
}

export const Ribbon: React.FC<RibbonProps> = ({ state }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create path points
  const { pointsTree, pointsScatter } = useMemo(() => {
    const segments = TREE_CONFIG.ribbonSegments;
    const { treeHeight, baseRadius, scatterRadius } = TREE_CONFIG;
    
    const pTree: THREE.Vector3[] = [];
    const pScatter: THREE.Vector3[] = [];

    // Tree Shape: Spiral
    const turns = 6;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      
      // Spiral Logic
      const h = -treeHeight / 2 + t * treeHeight;
      const r = baseRadius * (1 - t) + 0.5; // Slightly outside foliage
      const angle = t * Math.PI * 2 * turns;
      
      pTree.push(new THREE.Vector3(
        Math.cos(angle) * r,
        h,
        Math.sin(angle) * r
      ));

      // Scatter Logic: Chaotic wavy line
      const noise = (Math.random() - 0.5) * 5;
      const angleScatter = t * Math.PI * 4; // Loose spiral
      const rScatter = scatterRadius * 0.8;
      
      pScatter.push(new THREE.Vector3(
        Math.cos(angleScatter + noise) * rScatter * (Math.random() * 0.5 + 0.5),
        (t - 0.5) * scatterRadius + noise,
        Math.sin(angleScatter + noise) * rScatter * (Math.random() * 0.5 + 0.5)
      ));
    }
    return { pointsTree: pTree, pointsScatter: pScatter };
  }, []);

  // We need a mutable array of vector3s for the current curve
  const currentPoints = useMemo(() => {
    return pointsScatter.map(p => p.clone());
  }, [pointsScatter]);

  // Create geometry dynamically
  // Since we are morphing a TubeGeometry, it's easier to recreate the geometry or update path.
  // Updating TubeGeometry in real-time is expensive. 
  // Optimization: Update the CURVE, not the geometry, if we use a specialized line. 
  // But for a thick ribbon, TubeGeometry is best. 
  // To keep it performant, we will update the geometry attributes if possible, or create a new one every few frames?
  // Actually, standard TubeGeometry doesn't support vertex updates easily if the path length changes (it doesn't here).
  // A better way is using a custom component that updates the curve and calls geometry.updateFromCurve? No such method.
  
  // We will simply use `CatmullRomCurve3` and update the geometry. 
  // Since `ribbonSegments` is low (200), recreating geometry is okay-ish on modern GPUs, 
  // but let's try to just update vertices.
  
  // Easier approach for high fidelity:
  // Render a thick `Mesh` using `TubeGeometry`.
  // On frame, interpolate `currentPoints`. 
  // Re-generate `CatmullRomCurve3`.
  // Re-generate `TubeGeometry` (or update attributes).
  
  // Let's rely on React's key or a ref update.
  const curve = useMemo(() => new THREE.CatmullRomCurve3(currentPoints), [currentPoints]);
  
  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const isTree = state === TreeMorphState.TREE_SHAPE;
    const lerpFactor = THREE.MathUtils.clamp(delta * ANIMATION_SPEED, 0, 1);

    // 1. Interpolate Points
    let moved = false;
    for (let i = 0; i < currentPoints.length; i++) {
        const target = isTree ? pointsTree[i] : pointsScatter[i];
        if (currentPoints[i].distanceToSquared(target) > 0.001) {
            currentPoints[i].lerp(target, lerpFactor);
            moved = true;
        }
    }

    if (moved) {
        // 2. Update Curve
        // Note: Mutating the points array inside curve is usually enough if we call update?
        // CatmullRomCurve3 stores points by reference? Yes.
        // So we just need to tell the geometry to update.
        
        // Sadly TubeGeometry generates vertices once. We must dispose and recreate, or write a custom shader.
        // For < 300 points, recreating geometry is fine.
        
        // However, in R3F, modifying geometry ref is manual.
        const newGeo = new THREE.TubeGeometry(curve, TREE_CONFIG.ribbonSegments, 0.4, 8, false);
        meshRef.current.geometry.dispose();
        meshRef.current.geometry = newGeo;
    }
  });

  return (
    <mesh ref={meshRef} castShadow>
        <tubeGeometry args={[curve, TREE_CONFIG.ribbonSegments, 0.4, 8, false]} />
        <meshStandardMaterial 
            color={COLORS.gold} 
            emissive={COLORS.orangeGold}
            emissiveIntensity={0.2}
            roughness={0.2}
            metalness={0.8}
            side={THREE.DoubleSide}
        />
    </mesh>
  );
};
