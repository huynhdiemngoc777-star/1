import { Vector3 } from 'three';

export enum TreeMorphState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export interface ParticleData {
  scatterPosition: Vector3;
  treePosition: Vector3;
  rotation: [number, number, number];
  scale: number;
}

export interface TreeConfig {
  foliageCount: number;
  ornamentCount: number;
  treeHeight: number;
  baseRadius: number;
  scatterRadius: number;
}
