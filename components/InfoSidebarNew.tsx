/**
 * InfoSidebar Component
 * ---------------------
 * Displays real-time staking pool stats and bootcamp information.
 */

import React from 'react';
import { Trophy, Users, MapPin, Clock, Gift, Loader2, TrendingUp } from 'lucide-react';
import { useStakePool } from '../contexts/StakePoolContext';
import { useWallet } from '@solana/wallet-adapter-react';

interface InfoSidebarProps {
  // Legacy props - kept for compatibility
  stats?: {
    totalPool: number;
    participants: number;
    daysRemaining: number;
  };
}

export const InfoSidebar: React.FC<InfoSidebarProps> = () => {
  const { stats, isLoading, verifierPublicKey } = useStakePool();
  const { connected } = useWallet();

  return (
    <div className="space-y-6">
      
      {/* Prize Pool Card */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-yellow-500/10 rounded-full blur-xl"></div>
        
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <Trophy className="text-yellow-500" size={20} />
          奖池信息 (Prize Pool)
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
            <p className="text-gray-500 text-xs mb-1">当前总奖池</p>
            <p className="text-xl font-mono font-bold text-white flex items-center gap-1">
              {isLoading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  {stats.totalPoolSol.toFixed(1)} 
                  <span className="text-sm text-gray-400">SOL</span>
                </>
              )}
            </p>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
            <p className="text-gray-500 text-xs mb-1">参与人数</p>
            <p className="text-xl font-mono font-bold text-white">
              {isLoading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                stats.totalParticipants
              )}
            </p>
          </div>
        </div>

        {/* User Stats (if staked) */}
        {stats.userStaked && (
          <div className="mb-4 p-3 bg-green-900/20 border border-green-900/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400 text-sm font-semibold flex items-center gap-1">
                <TrendingUp size={14} />
                你的状态
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500">质押金额</p>
                <p className="text-white font-mono">{stats.userStakeAmount} SOL</p>
              </div>
              <div>
                <p className="text-gray-500">已打卡天数</p>
                <p className="text-white font-mono">{stats.userCheckInDays.length} 天</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-green-400/10 border border-green-400/20 rounded-lg p-3">
          <p className="text-green-400 text-xs leading-relaxed flex items-start gap-2">
            <Gift size={14} className="mt-0.5 shrink-0" />
            全勤者瓜分未完成者的押金 + 官方补贴 1 SOL! (Finishers split the forfeit pool + 1 SOL bonus!)
          </p>
        </div>
      </div>

      {/* Bootcamp Info Card */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
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

          {/* Backend Status */}
          <div className="p-3 bg-black/40 rounded-lg border border-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs">后端状态</span>
              {verifierPublicKey ? (
                <span className="flex items-center gap-1 text-green-400 text-xs">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  在线
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-400 text-xs">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  离线
                </span>
              )}
            </div>
            {verifierPublicKey && (
              <p className="text-gray-600 text-[10px] font-mono mt-1 truncate">
                Verifier: {verifierPublicKey.slice(0, 8)}...
              </p>
            )}
          </div>
          
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
              {connected ? 'Joined' : 'Join'}
            </a>
          </div>

        </div>
      </div>

      {/* Network Info */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Network</span>
          <span className="text-purple-400 font-mono flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
            Solana Devnet
          </span>
        </div>
      </div>
    </div>
  );
};

export default InfoSidebar;
