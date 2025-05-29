import React, { useEffect, useRef } from 'react';
import type { StoryLogEntry } from '../types';

interface StoryLogDisplayProps {
  logEntries: StoryLogEntry[];
}

const StoryLogDisplay: React.FC<StoryLogDisplayProps> = ({ logEntries }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logEntries]);

  const getEntryStyle = (type: StoryLogEntry['type']): string => {
    switch (type) {
      case 'narration':
        return 'text-neutral-400 italic';
      case 'player_action':
        return 'text-neutral-200 font-medium';
      case 'event':
        return 'text-sky-300'; // Using accent for key events
      case 'error_message':
        return 'text-red-400';
      case 'game_over':
        return 'text-yellow-400 font-bold text-lg';
      case 'system_info':
        return 'text-purple-400 text-xs opacity-70';
      case 'character_update':
        return 'text-teal-400 text-sm italic';
      default:
        return 'text-neutral-500';
    }
  };

  return (
    <div className="h-full bg-transparent p-1 custom-scrollbar overflow-y-auto"> {/* Made bg transparent to inherit from parent */}
      {logEntries.length === 0 && (
        <p className="text-neutral-500 italic text-center py-4">Story log is empty.</p>
      )}
      {logEntries.map((entry) => (
        <div 
          key={entry.id} 
          className={`mb-2.5 text-sm leading-relaxed animate-fadeInEntry ${getEntryStyle(entry.type)}`}
        >
          {entry.type === 'player_action' && <span className="text-neutral-500 mr-1.5 opacity-80">{'>'}</span>}
          {entry.text}
        </div>
      ))}
      <div ref={logEndRef} />
    </div>
  );
};

export default StoryLogDisplay;