import React, { useState, useEffect } from 'react';
import type { CustomScenarioData } from '../types';
import LoadingIndicator from './LoadingIndicator';
import ErrorMessage from './ErrorMessage';

interface ScenarioSetupProps {
  onStartRandom: () => void;
  onStartCustom: (data: Omit<CustomScenarioData, 'characterInfo'> & { characterBio: string }) => void;
  isInitializing: boolean;
  apiKeyOk: boolean;
  error: string | null;
  clearError: () => void;
}

const ScenarioSetup: React.FC<ScenarioSetupProps> = ({ onStartRandom, onStartCustom, isInitializing, apiKeyOk, error, clearError }) => {
  const [customSceneDesc, setCustomSceneDesc] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [customInventory, setCustomInventory] = useState('');
  const [customCharacterBio, setCustomCharacterBio] = useState(''); // Changed from customCharacterInfo
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [formVisible, setFormVisible] = useState(false); 

  useEffect(() => {
    if (showCustomForm) {
      const timer = setTimeout(() => setFormVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setFormVisible(false);
    }
  }, [showCustomForm]);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSceneDesc.trim() || !customLocation.trim()) {
      alert("Please provide at least a scene description and location name for your custom scenario.");
      return;
    }
    if (!customCharacterBio.trim()) {
        alert("Please provide a brief bio or concept for your character.");
        return;
    }
    clearError();
    onStartCustom({
      sceneDescription: customSceneDesc.trim(),
      locationName: customLocation.trim(),
      inventory: customInventory.split(',').map(item => item.trim()).filter(item => item),
      characterBio: customCharacterBio.trim(), // Pass as characterBio
    });
  };
  
  const commonInputClass = "w-full p-3 bg-neutral-800/80 text-neutral-100 border border-neutral-700/70 rounded-lg focus:ring-2 accent-ring focus:border-sky-500 outline-none transition-all duration-150 ease-in-out placeholder-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm";
  
  const primaryButtonClass = "w-full text-base font-semibold accent-bg accent-bg-hover text-white py-3.5 px-6 rounded-lg transition-all duration-200 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 accent-ring focus:ring-offset-2 focus:ring-offset-black shadow-md hover:shadow-lg transform hover:scale-105 active:scale-100 flex items-center justify-center gap-2";
  const secondaryButtonClass = "w-full text-base font-semibold bg-neutral-700/70 hover:bg-neutral-600/90 text-neutral-100 py-3.5 px-6 rounded-lg transition-all duration-200 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-black shadow-md hover:shadow-lg transform hover:scale-105 active:scale-100 flex items-center justify-center gap-2";
  const backButtonClass = "w-full sm:w-auto text-base font-medium bg-neutral-600 hover:bg-neutral-500 text-neutral-200 py-3 px-6 rounded-lg transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 focus:ring-offset-black";


  if (isInitializing && !error) {
    return (
      <div className="min-h-full flex flex-col justify-center items-center p-4 animate-fadeIn">
        <LoadingIndicator message="Your adventure is materializing..." size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col justify-center items-center p-4 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-xl md:max-w-2xl bg-neutral-900/70 backdrop-blur-md p-6 sm:p-10 rounded-xl shadow-2xl border border-neutral-700/50">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-neutral-100 mb-6 sm:mb-10 tracking-tight">
          Gemini Text Adventure
        </h1>

        {!apiKeyOk && (
           <ErrorMessage message="API Key is missing or invalid. The game requires a valid API_KEY environment variable to function correctly." />
        )}
        {error && <ErrorMessage message={error} onDismiss={clearError} />}
        
        {isInitializing && error && ( 
            <div className="my-4">
                <LoadingIndicator message="Attempting to initialize..." size="medium" />
            </div>
        )}

        <div className={`transition-opacity duration-300 ease-in-out ${showCustomForm ? 'opacity-0 max-h-0 overflow-hidden pointer-events-none' : 'opacity-100'}`}>
          <div className="space-y-4 sm:space-y-5">
            <button 
              onClick={() => { clearError(); onStartRandom(); }} 
              className={primaryButtonClass}
              disabled={isInitializing || !apiKeyOk}
              aria-label="Start a randomly generated adventure"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5z" />
                <path d="M6 7a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h4a1 1 0 100-2H7z" />
              </svg>
              Start Random Scenario
            </button>
            <button 
              onClick={() => { clearError(); setShowCustomForm(true); }}
              className={secondaryButtonClass}
              disabled={isInitializing || !apiKeyOk}
              aria-label="Create a custom adventure scenario"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Custom Scenario
            </button>
          </div>
        </div>

        <div 
          className={`transition-all duration-500 ease-in-out transform overflow-hidden ${formVisible && showCustomForm ? 'opacity-100 max-h-[1200px] translate-y-0 mt-6' : 'opacity-0 max-h-0 -translate-y-4 pointer-events-none'}`} // Increased max-h for new field
        >
          <form onSubmit={handleCustomSubmit} className="space-y-4 sm:space-y-5 border-t border-neutral-700/50 pt-6">
            <div>
              <label htmlFor="sceneDesc" className="block text-sm font-medium text-neutral-300 mb-1.5">Initial Scene Description *</label>
              <textarea
                id="sceneDesc"
                value={customSceneDesc}
                onChange={(e) => setCustomSceneDesc(e.target.value)}
                rows={3}
                className={commonInputClass}
                placeholder="e.g., You stand at the edge of a whispering forest, a forgotten path leading into the shadows."
                required
                disabled={isInitializing || !apiKeyOk}
              />
            </div>
            <div>
              <label htmlFor="locationName" className="block text-sm font-medium text-neutral-300 mb-1.5">Starting Location Name *</label>
              <input
                id="locationName"
                type="text"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                className={commonInputClass}
                placeholder="e.g., Whispering Woods Edge"
                required
                disabled={isInitializing || !apiKeyOk}
              />
            </div>
             <div>
              <label htmlFor="charBio" className="block text-sm font-medium text-neutral-300 mb-1.5">Character Bio / Core Concept *</label>
              <textarea
                id="charBio"
                value={customCharacterBio}
                onChange={(e) => setCustomCharacterBio(e.target.value)}
                rows={3} // Increased rows
                className={commonInputClass}
                placeholder="e.g., A grizzled dwarf warrior searching for his clan's lost axe. He is brave but stubborn. Wears plate armor and has a long braided beard."
                required // Made this required
                disabled={isInitializing || !apiKeyOk}
              />
               <p className="mt-1 text-xs text-neutral-400">Provide a few key ideas. The AI will expand this into a full character profile (name, class, skills, appearance, etc.).</p>
            </div>
            <div>
              <label htmlFor="inventory" className="block text-sm font-medium text-neutral-300 mb-1.5">Initial Inventory (comma-separated)</label>
              <input
                id="inventory"
                type="text"
                value={customInventory}
                onChange={(e) => setCustomInventory(e.target.value)}
                className={commonInputClass}
                placeholder="e.g., rusty sword, leather pouch"
                disabled={isInitializing || !apiKeyOk}
              />
            </div>
            <div className="flex flex-col sm:flex-row-reverse gap-3 pt-2">
              <button type="submit" className={primaryButtonClass + " sm:w-auto"} disabled={isInitializing || !apiKeyOk || !customSceneDesc.trim() || !customLocation.trim() || !customCharacterBio.trim()}>
                Start Custom Adventure
              </button>
              <button type="button" onClick={() => setShowCustomForm(false)} className={backButtonClass} disabled={isInitializing}>
                Back
              </button>
            </div>
          </form>
        </div>
        
        <footer className="mt-8 sm:mt-10 text-center text-xs text-neutral-500">
            <p>
              {apiKeyOk ? "API Key detected. Ready to play." : "Ensure your API Key is configured to play."}
            </p>
        </footer>
      </div>
    </div>
  );
};

export default ScenarioSetup;