import { TreeConfig } from './types';

export const COLORS = {
  emeraldDark: '#013220', // Deepest green
  emeraldLight: '#005533', // Highlight green
  emeraldWarm: '#2E4A3B', // Warmer green/brownish
  
  // Golds & Yellows (Main Theme)
  gold: '#FFD700',        // Standard Gold
  goldLight: '#FFFACD',   // Lemon Chiffon (Highlight)
  goldDark: '#B8860B',    // Dark Goldenrod (Shadow)
  amber: '#FFBF00',       // Amber
  orangeGold: '#DAA520',  // Goldenrod
  bronze: '#CD7F32',      // Bronze
  champagne: '#F7E7CE',   // Pale gold

  // Accents (Rich but not clashing)
  deepRed: '#500000',     // Velvet red
  pearl: '#F0F0F0',       // Pearl white

  bg: '#020403',          // Almost black green
  
  // Gift Wrapping
  giftRed: '#8B0000',
  giftGreen: '#004d00',
  giftGold: '#FFD700',
  giftWhite: '#F0F0F0',
};

export const TREE_CONFIG: TreeConfig & { giftCount: number; ribbonSegments: number } = {
  foliageCount: 4500,
  ornamentCount: 1200, // Increased for richness
  giftCount: 50,
  ribbonSegments: 200, // Smoothness of the ribbon
  treeHeight: 18,
  baseRadius: 6,
  scatterRadius: 35,
};

export const ANIMATION_SPEED = 2.0; // Slightly slower for majesty
