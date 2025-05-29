import React from 'react';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div 
      className="bg-red-900/50 border border-red-700/70 text-red-200 px-4 py-3 rounded-lg relative mb-4 shadow-lg animate-fadeIn flex items-start" 
      role="alert"
    >
      <svg className="fill-current h-5 w-5 text-red-400 mr-3 shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path d="M10 0C4.486 0 0 4.486 0 10s4.486 10 10 10 10-4.486 10-10S15.514 0 10 0zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
        <path d="M11 14v-4a1 1 0 0 0-2 0v4a1 1 0 0 0 2 0zm0-6a1 1 0 1 0-2 0 1 1 0 0 0 2 0z"/>
      </svg>
      <div className="flex-grow">
        <p className="font-semibold text-red-300">Error</p>
        <p className="text-sm text-red-200">{message}</p>
      </div>
      {onDismiss && (
        <button 
          onClick={onDismiss}
          className="ml-4 p-1 text-red-300 hover:text-red-100 focus:outline-none rounded-full hover:bg-red-700/50 transition-colors"
          aria-label="Dismiss error"
        >
          <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <title>Close</title>
            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
          </svg>
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;