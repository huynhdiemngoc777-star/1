import React from 'react';
import { TreeMorphState } from '../types';

interface OverlayProps {
  treeState: TreeMorphState;
  setTreeState: (state: TreeMorphState) => void;
}

export const Overlay: React.FC<OverlayProps> = ({ treeState, setTreeState }) => {
  const isTree = treeState === TreeMorphState.TREE_SHAPE;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-16 z-10">
      
      {/* Header */}
      <header className="flex flex-col items-center md:items-start space-y-2 animate-fade-in-down">
        <h1 className="text-4xl md:text-6xl font-serif text-yellow-500 tracking-wider font-bold drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]">
          ARIX
        </h1>
        <h2 className="text-sm md:text-lg font-light text-emerald-200 uppercase tracking-[0.3em]">
          Signature Interactive Holiday
        </h2>
      </header>

      {/* Control Area */}
      <div className="flex flex-col items-center pointer-events-auto">
        <button
          onClick={() => setTreeState(isTree ? TreeMorphState.SCATTERED : TreeMorphState.TREE_SHAPE)}
          className={`
            group relative px-10 py-4 
            border border-yellow-500/50 
            bg-black/40 backdrop-blur-md
            text-yellow-100 font-serif tracking-widest text-lg
            transition-all duration-700 ease-out
            hover:bg-yellow-900/20 hover:border-yellow-400
            rounded-full
          `}
        >
            <span className="relative z-10 flex items-center gap-3">
               {isTree ? "SCATTER ELEMENTS" : "ASSEMBLE TREE"}
            </span>
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 shadow-[0_0_40px_rgba(255,215,0,0.3)]" />
        </button>
        
        <p className="mt-4 text-emerald-400/60 text-xs tracking-widest font-light">
          {isTree ? "SCROLL TO ROTATE • DRAG TO VIEW" : "ELEMENTS DISPERSED"}
        </p>
      </div>
      
      {/* Footer/Signature */}
      <div className="text-center md:text-right text-emerald-800/80 font-serif italic text-sm">
        Est. 2024
      </div>
    </div>
  );
};
