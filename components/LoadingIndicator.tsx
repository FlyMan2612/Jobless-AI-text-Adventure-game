import React from 'react';

interface LoadingIndicatorProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message = "Loading...", size = 'medium' }) => {
  let dotSizeClass = 'h-2 w-2';
  if (size === 'small') dotSizeClass = 'h-1.5 w-1.5';
  if (size === 'large') dotSizeClass = 'h-2.5 w-2.5';

  return (
    <div className="flex flex-col items-center justify-center p-4 text-neutral-400" role="status" aria-live="polite">
      <div className="flex space-x-1.5">
        <div className={`${dotSizeClass} bg-neutral-300 rounded-full animate-pulse-custom [animation-delay:-0.3s]`}></div>
        <div className={`${dotSizeClass} bg-neutral-300 rounded-full animate-pulse-custom [animation-delay:-0.15s]`}></div>
        <div className={`${dotSizeClass} bg-neutral-300 rounded-full animate-pulse-custom`}></div>
      </div>
      {message && <p className="mt-4 text-sm text-neutral-500 tracking-wide">{message}</p>}
    </div>
  );
};

export default LoadingIndicator;