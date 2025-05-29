import React, { useState } from 'react';

interface UserInputProps {
  onSubmit: (command: string) => void;
  disabled: boolean;
}

const UserInput: React.FC<UserInputProps> = ({ onSubmit, disabled }) => {
  const [command, setCommand] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim() && !disabled) {
      onSubmit(command.trim());
      setCommand('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3" aria-label="Player command input">
      <input
        type="text"
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        placeholder="What do you do next?"
        className="flex-grow p-3 bg-neutral-800/80 text-neutral-100 border border-neutral-700/70 rounded-lg focus:ring-2 accent-ring focus:border-sky-500 outline-none transition-all duration-150 ease-in-out placeholder-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        disabled={disabled}
        aria-label="Enter your command"
      />
      <button
        type="submit"
        className="accent-bg accent-bg-hover text-white font-semibold py-3 px-5 sm:px-6 rounded-lg transition-all duration-150 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 accent-ring focus:ring-offset-2 focus:ring-offset-black shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
        disabled={disabled || !command.trim()}
      >
        Send
      </button>
    </form>
  );
};

export default UserInput;