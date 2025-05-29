import React from 'react';
import type { CharacterProfile } from '../types';
import LoadingIndicator from './LoadingIndicator';

interface CharacterDisplayProps {
  characterProfile: CharacterProfile | null;
  characterImageUrl: string | null;
  isLoadingCharacter: boolean;
}

const DetailItem: React.FC<{ label: string; value: string | string[] | undefined }> = ({ label, value }) => {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return null;
  }
  return (
    <div className="mb-3">
      <h4 className="text-xs sm:text-sm font-semibold text-sky-300/80 uppercase tracking-wider mb-0.5">{label}</h4>
      {Array.isArray(value) ? (
        <ul className="list-disc list-inside ml-1">
          {value.map((item, index) => (
            <li key={index} className="text-sm text-neutral-300 leading-snug">{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap">{value}</p>
      )}
    </div>
  );
};

const CharacterDisplay: React.FC<CharacterDisplayProps> = ({ characterProfile, characterImageUrl, isLoadingCharacter }) => {
  if (isLoadingCharacter) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <LoadingIndicator message="Summoning character details..." size="medium" />
      </div>
    );
  }

  if (!characterProfile) {
    return (
      <div className="h-full bg-transparent p-3 flex flex-col items-center justify-center">
        <p className="text-neutral-500 italic text-center">
          Character information is currently unavailable. Perhaps they are still forming in the ethereal mists?
        </p>
      </div>
    );
  }

  const { name, age, class: charClass, skills, background, appearance, personalityTraits } = characterProfile;

  return (
    <div className="h-full bg-transparent p-1 custom-scrollbar overflow-y-auto flex flex-col text-neutral-200">
      <div className="p-2 sm:p-3">
        {characterImageUrl && (
          <div className="mb-4 rounded-lg overflow-hidden border border-neutral-700/50 shadow-lg aspect-square max-w-xs mx-auto sm:max-w-sm">
            <img 
              src={characterImageUrl} 
              alt={`Portrait of ${name}`} 
              className="w-full h-full object-cover transition-opacity duration-500 ease-in-out opacity-0 data-[loaded=true]:opacity-100"
              onLoad={(e) => e.currentTarget.setAttribute('data-loaded', 'true')}
            />
          </div>
        )}
        {!characterImageUrl && (
             <div className="mb-4 rounded-lg border border-neutral-700/50 shadow-lg aspect-square max-w-xs mx-auto sm:max-w-sm bg-neutral-800/60 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
             </div>
        )}

        <h3 className="text-xl sm:text-2xl font-bold text-center text-sky-200 mb-1">{name || "Nameless Wanderer"}</h3>
        <p className="text-sm text-center text-neutral-400 mb-4">{charClass || "Class Unknown"} - {age || "Age Unknown"}</p>

        <div className="space-y-3">
          <DetailItem label="Appearance" value={appearance} />
          <DetailItem label="Background" value={background} />
          <DetailItem label="Skills" value={skills} />
          <DetailItem label="Personality Traits" value={personalityTraits} />
        </div>
      </div>
    </div>
  );
};

export default CharacterDisplay;