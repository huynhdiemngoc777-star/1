import React, { useState, Suspense } from 'react';
import { Experience } from './components/Experience';
import { Overlay } from './components/Overlay';
import { TreeMorphState } from './types';

const Loader: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-[#020403] text-yellow-600 font-serif tracking-widest animate-pulse">
    INITIALIZING EXPERIENCE...
  </div>
);

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeMorphState>(TreeMorphState.SCATTERED);

  return (
    <div className="relative w-full h-screen bg-[#020403]">
      <Suspense fallback={<Loader />}>
        <Experience treeState={treeState} />
      </Suspense>
      <Overlay treeState={treeState} setTreeState={setTreeState} />
    </div>
  );
};

export default App;
