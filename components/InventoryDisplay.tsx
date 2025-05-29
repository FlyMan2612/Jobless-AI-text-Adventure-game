
import React from 'react';

interface InventoryDisplayProps {
  items: string[];
  currencyName: string;
  currencyAmount: number;
}

const InventoryDisplay: React.FC<InventoryDisplayProps> = ({ items, currencyName, currencyAmount }) => {
  return (
    <div className="h-full bg-transparent p-1 flex flex-col">
      <div className="flex justify-between items-baseline mb-3 px-1 shrink-0">
        <h3 className="text-lg font-semibold text-neutral-100">Inventory</h3>
        <p className="text-sm text-sky-300 font-medium">
          {currencyAmount} {currencyName}
        </p>
      </div>
      
      {items.length === 0 ? (
        <p className="text-neutral-500 italic text-sm flex-grow flex items-center justify-center">Your inventory is empty.</p>
      ) : (
        <ul className="list-none space-y-2 text-neutral-300 text-sm custom-scrollbar overflow-y-auto flex-grow pr-1">
          {items.map((item, index) => (
            <li key={`${item}-${index}`} className="bg-neutral-800/70 p-2.5 rounded-md border border-neutral-700/60 shadow-sm">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InventoryDisplay;
