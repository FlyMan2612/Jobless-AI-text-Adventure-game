
import React from 'react';
import type { WorldInfo } from '../types';
import LoadingIndicator from './LoadingIndicator';

interface WorldInfoDisplayProps {
  worldInfo: WorldInfo | null;
  isLoadingWorldInfo: boolean;
}

const DetailItem: React.FC<{ label: string; value: string | undefined }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="mb-4">
      <h4 className="text-xs sm:text-sm font-semibold text-sky-300/80 uppercase tracking-wider mb-1">{label}</h4>
      <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap">{value}</p>
    </div>
  );
};

const WorldInfoDisplay: React.FC<WorldInfoDisplayProps> = ({ worldInfo, isLoadingWorldInfo }) => {
  if (isLoadingWorldInfo) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <LoadingIndicator message="Unveiling world details..." size="medium" />
      </div>
    );
  }

  if (!worldInfo) {
    return (
      <div className="h-full bg-transparent p-3 flex flex-col items-center justify-center">
        <p className="text-neutral-500 italic text-center">
          The details of this world remain shrouded in mystery...
        </p>
      </div>
    );
  }

  return (
    <div className="h-full bg-transparent p-1 custom-scrollbar overflow-y-auto">
      <div className="p-2 sm:p-3">
        <h3 className="text-xl font-bold text-sky-200 mb-4 text-center">World Information</h3>
        <DetailItem label="World Overview" value={worldInfo.background} />
        <DetailItem label="Currency System" value={worldInfo.currencySystem} />
        <DetailItem label="Primary Currency" value={worldInfo.currencyName} />
      </div>
    </div>
  );
};

export default WorldInfoDisplay;
