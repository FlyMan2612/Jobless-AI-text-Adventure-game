import React from 'react';
import LoadingIndicator from './LoadingIndicator';

interface SceneDisplayProps {
  imageUrl: string | null;
  description: string;
  locationName: string;
  isLoadingImage: boolean;
}

const SceneDisplay: React.FC<SceneDisplayProps> = ({ imageUrl, description, locationName, isLoadingImage }) => {
  return (
    <div className="p-1 h-full flex flex-col"> {/* Reduced padding for internal elements to control it */}
      <div className="aspect-[16/9] bg-neutral-800/70 rounded-lg mb-3 sm:mb-4 flex items-center justify-center overflow-hidden border border-neutral-700/50 shadow-md">
        {isLoadingImage ? (
          <LoadingIndicator message="Generating scene..." size="large" />
        ) : imageUrl ? (
          <img 
            src={imageUrl} 
            alt={description ? description.substring(0, 70) + "..." : locationName} 
            className="w-full h-full object-cover transition-opacity duration-700 ease-in-out opacity-0 data-[loaded=true]:opacity-100"
            onLoad={(e) => e.currentTarget.setAttribute('data-loaded', 'true')}
            aria-busy={isLoadingImage}
          />
        ) : (
          <div className="text-neutral-500 italic p-8 text-center flex flex-col items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-neutral-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Visuals for this scene could not be generated.
          </div>
        )}
      </div>
      <h2 className="text-xl sm:text-2xl font-semibold text-neutral-100 mb-1.5 sm:mb-2 px-1">{locationName || "Unknown Location"}</h2>
      <p className="text-neutral-300 leading-relaxed text-sm sm:text-base whitespace-pre-wrap flex-grow custom-scrollbar overflow-y-auto max-h-28 sm:max-h-40 px-1 pb-1">
        {description || "The details of the scene are elusive..."}
      </p>
    </div>
  );
};

export default SceneDisplay;