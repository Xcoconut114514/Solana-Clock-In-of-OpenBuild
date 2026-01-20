import React from 'react';
import { Trophy, Users, MapPin, Globe, Clock, Gift } from 'lucide-react';
import { BootcampStats } from '../types';

interface InfoSidebarProps {
  stats: BootcampStats;
}

export const InfoSidebar: React.FC<InfoSidebarProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
      
      {/* Prize Pool Card */}
      <div className="bg-openbuild-card border border-openbuild-border rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-yellow-500/10 rounded-full blur-xl"></div>
        
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <Trophy className="text-yellow-500" size={20} />
          奖池信息 (Prize Pool)
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
            <p className="text-gray-500 text-xs mb-1">当前总奖池</p>
            <p className="text-xl font-mono font-bold text-white">{stats.totalPool} SOL</p>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
            <p className="text-gray-500 text-xs mb-1">参与人数</p>
            <p className="text-xl font-mono font-bold text-white">{stats.participants}</p>
          </div>
        </div>

        <div className="bg-openbuild-green/10 border border-openbuild-green/20 rounded-lg p-3">
          <p className="text-openbuild-green text-xs leading-relaxed flex items-start gap-2">
            <Gift size={14} className="mt-0.5 shrink-0" />
            全勤者瓜分未完成者的押金 + 官方补贴 1 SOL! (Finishers split the forfeit pool + 1 SOL bonus!)
          </p>
        </div>
      </div>

      {/* Bootcamp Info Card */}
      <div className="bg-openbuild-card border border-openbuild-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">训练营信息 (Bootcamp Info)</h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Clock className="text-gray-500 mt-1" size={16} />
            <div>
              <p className="text-gray-300 text-sm font-medium">Time</p>
              <p className="text-gray-500 text-sm">Jan 06 — Feb 06, 2026</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <MapPin className="text-gray-500 mt-1" size={16} />
            <div>
              <p className="text-gray-300 text-sm font-medium">Location</p>
              <p className="text-gray-500 text-sm">Online</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="text-gray-500 mt-1" size={16} />
            <div>
              <p className="text-gray-300 text-sm font-medium">Builders</p>
              <div className="flex -space-x-2 mt-1">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full bg-gray-700 border border-black flex items-center justify-center text-[8px]">
                    👾
                  </div>
                ))}
                <div className="w-6 h-6 rounded-full bg-gray-800 border border-black flex items-center justify-center text-[8px] text-gray-400">
                  +1k
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-800 my-2" />
          
          <div className="flex gap-2">
            <a 
              href="https://openbuild.xyz/quiz/2086624241"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 border border-gray-700 hover:border-white text-white text-sm py-2 rounded-lg transition-colors text-center"
            >
              Quiz
            </a>
            <a 
              href="https://openbuild.xyz/learn/challenges/2086624241"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-white hover:bg-gray-200 text-black font-semibold text-sm py-2 rounded-lg transition-colors text-center"
            >
              Joined
            </a>
          </div>

        </div>
      </div>

       {/* Speakers / Hosts (Simulated from screenshot) */}
       <div className="bg-openbuild-card border border-openbuild-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black border border-gray-700 flex items-center justify-center">
              <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="Solana" className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">Solana Foundation</p>
              <p className="text-gray-500 text-xs">Posted on Dec 22, 2025</p>
            </div>
          </div>
       </div>

    </div>
  );
};