import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  Search, Loader2, AlertCircle, CheckCircle2,
  ExternalLink, Copy, Check, ArrowLeft,
  Trophy, Sparkles, PlayCircle, Code2, BookOpen, Video,
} from 'lucide-react';
import { useNFTQuery, TaskCompletionStatus } from '../hooks/useNFTQuery';
import { isValidSolanaAddress } from '../services/heliusApi';
import { BLUESHIFT_TASKS, REQUIRED_TASK_IDS } from '../config/blueshiftCollections';
import { BlueshiftTask } from '../types/nft';

interface NFTCheckerProps {
  onBack?: () => void;
}

// Category color mapping
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  TYPESCRIPT: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  ANCHOR: { bg: 'bg-gray-500/10', text: 'text-gray-300', border: 'border-gray-500/30' },
  RUST: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
};

export const NFTChecker: React.FC<NFTCheckerProps> = ({ onBack }) => {
  const { publicKey } = useWallet();
  const [inputAddress, setInputAddress] = useState('');
  const [copiedMint, setCopiedMint] = useState<string | null>(null);

  const {
    isLoading,
    error,
    queried,
    taskStatuses,
    completedCount,
    requiredCompleted,
    queryAddress,
    reset,
  } = useNFTQuery();

  const handleSearch = () => {
    const addr = inputAddress.trim();
    if (addr) queryAddress(addr);
  };

  const handleUseConnectedWallet = () => {
    if (publicKey) {
      const addr = publicKey.toBase58();
      setInputAddress(addr);
      queryAddress(addr);
    }
  };

  const handleCopyMint = async (mintAddress: string) => {
    await navigator.clipboard.writeText(mintAddress);
    setCopiedMint(mintAddress);
    setTimeout(() => setCopiedMint(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const getStatusForTask = (taskId: number): TaskCompletionStatus | undefined => {
    return taskStatuses.find(s => s.taskId === taskId);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Trophy size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Blueshift NFT Checker</h1>
              <p className="text-sm text-gray-400">查询任务完成徽章</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 mb-8">
          <div className="space-y-4">
            <label className="block">
              <span className="text-gray-300 text-sm font-medium mb-2 block">
                输入 Solana 钱包地址 (Enter Solana Wallet Address)
              </span>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputAddress}
                    onChange={(e) => setInputAddress(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="输入地址..."
                    className="w-full bg-black border border-gray-700 focus:border-green-500 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none transition-colors font-mono text-sm"
                  />
                  {inputAddress && !isValidSolanaAddress(inputAddress) && (
                    <p className="absolute -bottom-5 left-0 text-red-400 text-xs">
                      地址格式不正确
                    </p>
                  )}
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isLoading || !inputAddress.trim()}
                  className="px-6 py-3 bg-green-400 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-black font-semibold rounded-xl transition-colors flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Search size={18} />
                  )}
                  查询
                </button>
              </div>
            </label>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              {publicKey && (
                <button
                  onClick={handleUseConnectedWallet}
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <Sparkles size={14} />
                  使用已连接钱包
                </button>
              )}
              {queried && (
                <button
                  onClick={reset}
                  className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                >
                  清除结果
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 flex items-center gap-3 text-red-400 bg-red-900/20 border border-red-900/50 rounded-xl px-4 py-3">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Overall Status Banner */}
        {queried && !isLoading && (
          <div className={`mb-8 rounded-2xl p-6 border ${
            requiredCompleted
              ? 'bg-green-900/10 border-green-500/30'
              : 'bg-gray-900/50 border-gray-800'
          }`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  requiredCompleted ? 'bg-green-400/20' : 'bg-gray-800'
                }`}>
                  {requiredCompleted ? (
                    <CheckCircle2 size={28} className="text-green-400" />
                  ) : (
                    <Trophy size={28} className="text-gray-500" />
                  )}
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${requiredCompleted ? 'text-green-400' : 'text-white'}`}>
                    {requiredCompleted ? '任务达标! (QUALIFIED)' : '任务未完成 (NOT QUALIFIED)'}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    已完成 {completedCount} / {BLUESHIFT_TASKS.length} 个任务
                    {!requiredCompleted && ` (需完成 Task 1-4)`}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full md:w-48">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>进度</span>
                  <span>{completedCount}/{BLUESHIFT_TASKS.length}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      requiredCompleted ? 'bg-green-400' : 'bg-purple-500'
                    }`}
                    style={{ width: `${(completedCount / BLUESHIFT_TASKS.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Task Grid */}
        <div className="space-y-4">
          {BLUESHIFT_TASKS.map((task) => {
            const status = getStatusForTask(task.id);
            const isCompleted = status?.completed ?? false;
            const isRequired = REQUIRED_TASK_IDS.includes(task.id);
            const showGray = queried && !isCompleted;

            return (
              <TaskCard
                key={task.id}
                task={task}
                isCompleted={isCompleted}
                isRequired={isRequired}
                showGray={showGray}
                queried={queried}
                nftMint={status?.nft?.id}
                copiedMint={copiedMint}
                onCopyMint={handleCopyMint}
              />
            );
          })}
        </div>

        {/* Initial State */}
        {!queried && !isLoading && !inputAddress && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              查询 Blueshift 任务完成徽章
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              输入 Solana 钱包地址，查看是否持有 Blueshift 平台的任务完成 NFT 徽章。
              完成 Task 1-4 即视为任务达标。
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

// ---- Task Card Component ----

interface TaskCardProps {
  task: BlueshiftTask;
  isCompleted: boolean;
  isRequired: boolean;
  showGray: boolean;
  queried: boolean;
  nftMint?: string;
  copiedMint: string | null;
  onCopyMint: (mint: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task, isCompleted, isRequired, showGray, queried, nftMint, copiedMint, onCopyMint,
}) => {
  const [expanded, setExpanded] = useState(false);
  const catColor = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.TYPESCRIPT;

  return (
    <div className={`rounded-xl border overflow-hidden transition-all duration-300 ${
      isCompleted
        ? 'bg-green-900/5 border-green-500/30 hover:border-green-500/50'
        : showGray
          ? 'bg-gray-900/30 border-gray-800/50 opacity-60'
          : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
    }`}>
      {/* Main Row */}
      <div
        className="flex items-center gap-4 p-4 md:p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* NFT Image */}
        <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden shrink-0 border ${
          isCompleted ? 'border-green-500/50' : 'border-gray-700'
        } ${showGray ? 'grayscale' : ''}`}>
          <img
            src={task.imageUrl}
            alt={task.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Completed overlay badge */}
          {isCompleted && (
            <div className="absolute inset-0 bg-green-400/10 flex items-center justify-center">
              <div className="absolute bottom-0 right-0 bg-green-400 rounded-tl-lg p-0.5">
                <Check size={12} className="text-black" />
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${catColor.bg} ${catColor.text} ${catColor.border}`}>
              {task.category}
            </span>
            {isRequired && (
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono border border-yellow-500/30 text-yellow-400 bg-yellow-500/10">
                必修 REQUIRED
              </span>
            )}
            {queried && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${
                isCompleted
                  ? 'border-green-500/30 text-green-400 bg-green-500/10'
                  : 'border-red-500/30 text-red-400 bg-red-500/10'
              }`}>
                {isCompleted ? 'QUALIFIED' : 'NOT QUALIFIED'}
              </span>
            )}
          </div>
          <h4 className={`font-semibold truncate ${isCompleted ? 'text-green-400' : showGray ? 'text-gray-500' : 'text-white'}`}>
            Task {task.id}: {task.name}
          </h4>
          <p className="text-gray-500 text-xs mt-0.5 truncate">{task.description}</p>
        </div>

        {/* Status Icon */}
        <div className="shrink-0">
          {queried ? (
            isCompleted ? (
              <CheckCircle2 size={24} className="text-green-400" />
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-gray-700" />
            )
          ) : (
            <div className="text-gray-600 text-xs">
              {expanded ? '收起' : '展开'}
            </div>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-800 px-4 md:px-5 py-4 space-y-3 bg-black/30">
          {/* NFT Mint Address (if found) */}
          {nftMint && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">Mint:</span>
              <code className="text-gray-400 font-mono truncate">{nftMint}</code>
              <button
                onClick={(e) => { e.stopPropagation(); onCopyMint(nftMint); }}
                className="text-gray-500 hover:text-white transition-colors shrink-0"
              >
                {copiedMint === nftMint ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
              </button>
              <a
                href={`https://explorer.solana.com/address/${nftMint}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-gray-500 hover:text-white transition-colors shrink-0"
              >
                <ExternalLink size={12} />
              </a>
            </div>
          )}

          {/* Challenge Link */}
          <div className="flex flex-wrap gap-2">
            <a
              href={task.challengeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-md transition-colors"
            >
              <Code2 size={12} />
              挑战入口
              <ExternalLink size={10} />
            </a>

            {/* Video Links */}
            {task.videoUrls.map((v, i) => (
              <a
                key={i}
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-md transition-colors"
              >
                <Video size={12} />
                {v.label}
                <ExternalLink size={10} />
              </a>
            ))}

            {/* Code Links */}
            {task.codeUrls.map((c, i) => (
              <a
                key={i}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-md transition-colors"
              >
                <PlayCircle size={12} />
                {c.label}
                <ExternalLink size={10} />
              </a>
            ))}

            {/* Article Link */}
            {task.articleUrl && (
              <a
                href={task.articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-md transition-colors"
              >
                <BookOpen size={12} />
                文字攻略
                <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTChecker;
