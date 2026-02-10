import React from 'react';

export const Hero: React.FC = () => {
  return (
    <div className="relative w-full py-12 md:py-16 px-4 md:px-8 overflow-hidden">
      {/* Background Gradient Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-solana-purple/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute top-10 right-1/4 w-80 h-80 bg-solana-green/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded border border-openbuild-green/30 text-openbuild-green text-xs font-semibold bg-openbuild-green/10">
              Ongoing
            </span>
            <span className="px-2 py-1 rounded border border-gray-700 text-gray-400 text-xs bg-gray-900">
              Solana
            </span>
            <span className="px-2 py-1 rounded border border-gray-700 text-gray-400 text-xs bg-gray-900">
              Bootcamp
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            2026 Solana 开发者训练营 (Season 1)
          </h1>
          
          <p className="text-gray-400 text-lg flex items-center gap-2">
            <span>📅 1月6日 - 2月6日</span>
            <span className="text-gray-600">|</span>
            <span className="text-solana-green">Stake-to-Learn Check-in System</span>
          </p>
        </div>
      </div>
    </div>
  );
};