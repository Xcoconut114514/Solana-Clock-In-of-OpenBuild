import React, { useState } from 'react';
import { UserState, DayStatus } from '../types';
import { Lock, ShieldCheck, CalendarCheck, Coins, CheckCircle2, Circle, Loader2, PlayCircle, Trophy, Code2, ExternalLink, Github, BookOpen } from 'lucide-react';

interface CheckInCardProps {
  userState: UserState;
  onStake: () => void;
  onConnect: () => void;
}

const MOCK_DAYS: DayStatus[] = [
  { day: 1, date: 'Jan 06', status: 'completed' },
  { day: 2, date: 'Jan 07', status: 'completed' },
  { day: 3, date: 'Jan 08', status: 'completed' },
  { day: 4, date: 'Jan 09', status: 'missed' },
  { day: 5, date: 'Jan 10', status: 'current' },
  { day: 6, date: 'Jan 11', status: 'future' },
  { day: 7, date: 'Jan 12', status: 'future' },
];

const COURSE_CONTENT = [
  {
    id: 'l1',
    type: 'lesson',
    title: '第1课：区块链介绍 + Solana技术基础',
    link: 'https://openbuild.xyz/learn/challenges/2086624241/1767796873',
    status: 'completed',
    tag: '回放 Available'
  },
  {
    id: 'l2',
    type: 'lesson',
    title: '第2课：Trading Bot原理解析 & Solana代币与NFT',
    link: 'https://openbuild.xyz/learn/challenges/2086624241/1767796891',
    status: 'completed',
    tag: '回放 Available'
  },
  {
    id: 'l3',
    type: 'lesson',
    title: '第3课：互联网资本市场与技术实现',
    link: 'https://openbuild.xyz/learn/challenges/2086624241/1767796916',
    status: 'completed',
    tag: '回放 Available'
  },
  {
    id: 'l4',
    type: 'lesson',
    title: '第4课：Solana程序开发入门 (SPL Token)',
    link: 'https://openbuild.xyz/learn/challenges/2086624241/1767796916',
    status: 'completed',
    tag: '回放 Available'
  },
  {
    id: 't0',
    type: 'task',
    title: 'Task 0: Solana 基本知识通关',
    desc: '得分80分及以上瓜分 200 USDT',
    link: 'https://openbuild.xyz/quiz/2086624241',
    status: 'active',
    tag: '必做 Mandatory'
  },
  {
    id: 't1',
    type: 'task',
    title: 'Task 1: 铸造 SPL Token (web3.js)',
    desc: '使用 TypeScript 与链上交互',
    link: 'https://learn.blueshift.gg/zh-CN/challenges/typescript-mint-an-spl-token',
    extraLink: {
      label: '助教包 (GitHub)',
      url: 'https://github.com/Tools-touch/Task-/',
      icon: <Github size={14} />
    },
    status: 'active',
    tag: 'Challenge'
  }
];

export const CheckInCard: React.FC<CheckInCardProps> = ({ userState, onStake, onConnect }) => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckIn = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsCheckedIn(true);
      setIsProcessing(false);
    }, 2000);
  };

  const renderHeader = () => {
    if (userState === UserState.STAKED) {
      return (
        <div className="space-y-8 mb-10">
           {/* Header Status */}
          <div className="flex items-center justify-between border-b border-gray-800 pb-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">每日打卡 (Daily Check-in)</h3>
              <p className="text-gray-400 text-sm">Keep up the momentum!</p>
            </div>
            <div className="flex items-center gap-2 bg-green-900/20 border border-green-900/50 px-3 py-1.5 rounded-full">
              <CheckCircle2 size={16} className="text-openbuild-green" />
              <span className="text-openbuild-green text-sm font-semibold">已参营 (Joined)</span>
            </div>
          </div>

          {/* Today's Action */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-8 md:p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-openbuild-green/5 rounded-full blur-3xl group-hover:bg-openbuild-green/10 transition-all"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                 <h4 className="text-gray-400 text-sm uppercase tracking-wide font-semibold">Today's Status</h4>
                 {isCheckedIn ? (
                   <div className="text-3xl font-bold text-openbuild-green flex items-center justify-center md:justify-start gap-2">
                     <span>✅ 已打卡 (Checked In)</span>
                   </div>
                 ) : (
                    <div className="text-3xl font-bold text-white">未打卡 (Not Checked-in)</div>
                 )}
                 <p className="text-xs text-gray-500 pt-1">Verify learning & sign on-chain</p>
              </div>

              {!isCheckedIn ? (
                <button 
                  onClick={handleCheckIn}
                  disabled={isProcessing}
                  className="w-full md:w-auto px-10 bg-openbuild-green hover:bg-green-600 text-black font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-900/20 text-xl flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 className="animate-spin" /> : <CalendarCheck size={24} />}
                  {isProcessing ? 'Verifying...' : '立即打卡'}
                </button>
              ) : (
                <div className="w-full md:w-auto px-10 bg-gray-800/50 text-gray-400 font-semibold py-4 rounded-xl cursor-default flex items-center justify-center gap-2 text-lg">
                  <CheckCircle2 size={24} />
                  完成 (Done)
                </div>
              )}
            </div>
          </div>

           {/* Progress Strip */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white font-semibold">本周进度 (Weekly Progress)</span>
            </div>
            <div className="flex justify-between gap-1 md:gap-2 overflow-x-auto pb-2">
              {MOCK_DAYS.map((d) => (
                <div key={d.day} className="flex flex-col items-center gap-2 min-w-[50px]">
                  <div className={`
                    w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border 
                    ${d.status === 'completed' ? 'bg-openbuild-green/20 border-openbuild-green text-openbuild-green' : ''}
                    ${d.status === 'missed' ? 'bg-red-900/20 border-red-900 text-red-500' : ''}
                    ${d.status === 'current' ? 'bg-white text-black border-white ring-2 ring-openbuild-green ring-offset-2 ring-offset-black' : ''}
                    ${d.status === 'future' ? 'bg-gray-900 border-gray-800 text-gray-600' : ''}
                  `}>
                    {d.status === 'completed' && <CheckCircle2 size={20} />}
                    {d.status === 'missed' && <span className="text-sm font-bold">X</span>}
                    {d.status === 'current' && <span className="text-sm font-bold">Today</span>}
                    {d.status === 'future' && <Circle size={20} />}
                  </div>
                  <span className="text-xs text-gray-500 uppercase">{d.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Default: Not Staked / Disconnected
    return (
      <div className="bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-xl p-8 md:p-12 mb-10 relative overflow-hidden min-h-[240px] flex flex-col justify-center">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="text-center md:text-left space-y-4">
            <h3 className="text-3xl font-bold text-white flex items-center justify-center md:justify-start gap-3">
              <Coins className="text-solana-purple" size={32} />
              加入课程奖池
            </h3>
            <p className="text-gray-400 text-base max-w-md leading-relaxed">
              Stake 0.1 SOL to join. Full refund upon completion. Missed days contribute to the prize pool.
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full md:w-auto">
             {userState === UserState.DISCONNECTED ? (
              <button 
                onClick={onConnect}
                className="w-full md:w-72 bg-openbuild-green hover:bg-green-600 text-black font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-lg"
              >
                <Lock size={20} />
                连接钱包 (Connect)
              </button>
            ) : (
              <button 
                onClick={onStake}
                className="w-full md:w-72 bg-openbuild-green hover:bg-green-600 text-black font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-lg"
              >
                <ShieldCheck size={20} />
                质押 0.1 SOL 加入
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-openbuild-card border border-openbuild-border rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
      {/* Top Decor Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-solana-purple via-solana-green to-openbuild-green"></div>

      {/* 1. Dynamic Header Area (Join Action OR Daily Checkin) */}
      {renderHeader()}

      {/* 2. Course Content List (Always Visible) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
           <h3 className="text-lg font-bold text-white flex items-center gap-2">
             <BookOpen size={20} className="text-openbuild-green" />
             课程进度 & 任务 (Course & Tasks)
           </h3>
           <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded border border-gray-800">Season 1</span>
        </div>

        <div className="grid gap-3">
          {COURSE_CONTENT.map((item, index) => (
            <div 
              key={index} 
              className="group bg-black/40 border border-gray-800 hover:border-openbuild-green/50 rounded-xl p-4 transition-all duration-300 hover:bg-white/5 relative overflow-hidden"
            >
              <div className="flex items-start gap-4 relative z-10">
                {/* Icon Column */}
                <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border 
                  ${item.type === 'task' ? 'bg-purple-900/20 border-purple-900/50 text-purple-400' : 'bg-blue-900/20 border-blue-900/50 text-blue-400'}`}>
                  {item.type === 'task' ? <Trophy size={18} /> : <PlayCircle size={18} />}
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="text-white font-medium truncate pr-2 group-hover:text-openbuild-green transition-colors">
                      {item.title}
                    </h4>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border 
                      ${item.type === 'task' ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' : 'border-blue-500/30 text-blue-400 bg-blue-500/10'}
                    `}>
                      {item.tag}
                    </span>
                  </div>
                  
                  {item.desc && (
                    <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <a 
                      href={item.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-md transition-colors"
                    >
                      {item.type === 'task' ? <Code2 size={12} /> : <PlayCircle size={12} />}
                      {item.type === 'task' ? '去完成 (Start Task)' : '观看回放 (Watch)'}
                      <ExternalLink size={10} />
                    </a>

                    {item.extraLink && (
                      <a 
                        href={item.extraLink.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-md transition-colors"
                      >
                        {item.extraLink.icon}
                        {item.extraLink.label}
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};