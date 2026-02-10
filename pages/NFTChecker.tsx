/**
 * NFT Checker Page
 * ----------------
 * Allows users to input their Solana address and check
 * if they hold Blueshift challenge completion NFTs.
 * 
 * - Tasks 1-4 required for QUALIFIED status
 * - Completed tasks are color-highlighted; incomplete are grayed out
 * - Expandable details with challenge links, video tutorials, code repos
 */

import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, ExternalLink, Play, Code, BookOpen, CheckCircle, XCircle, Trophy, ArrowLeft } from 'lucide-react';
import { useNFTQuery, TaskResult } from '../hooks/useNFTQuery';
import { categoryColors, REQUIRED_TASK_COUNT, TaskCategory } from '../config/blueshiftCollections';

// ─── Category Icon Components ────────────────────────────────────
const TypeScriptIcon: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-sky-500/20 border border-sky-500/30 ${className || ''}`}>
    <span className="text-sky-400 font-bold text-sm">TS</span>
  </div>
);

const AnchorIcon: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 border border-gray-600 ${className || ''}`}>
    <span className="text-gray-300 text-lg">⚓</span>
  </div>
);

const RustIcon: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-orange-500/20 border border-orange-500/30 ${className || ''}`}>
    <span className="text-orange-400 font-bold text-sm">RS</span>
  </div>
);

function getCategoryIcon(category: TaskCategory) {
  switch (category) {
    case 'TypeScript':
      return <TypeScriptIcon />;
    case 'Anchor':
      return <AnchorIcon />;
    case 'Rust':
      return <RustIcon />;
  }
}

// ─── Task Card Component ─────────────────────────────────────────
const TaskCard: React.FC<{ taskResult: TaskResult }> = ({ taskResult }) => {
  const [expanded, setExpanded] = useState(false);
  const { task, completed, imageUrl } = taskResult;
  const colors = categoryColors[task.category];

  return (
    <div
      className={`relative rounded-xl border transition-all duration-300 overflow-hidden ${
        completed
          ? 'border-green-500/40 bg-green-500/5 shadow-[0_0_20px_rgba(0,200,83,0.08)]'
          : 'border-gray-800 bg-gray-900/50'
      }`}
    >
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* NFT Image / Placeholder */}
          <div
            className={`w-20 h-20 rounded-lg overflow-hidden border flex-shrink-0 ${
              completed ? 'border-green-500/30' : 'border-gray-700'
            }`}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={task.name}
                className={`w-full h-full object-cover ${completed ? '' : 'grayscale opacity-40'}`}
              />
            ) : (
              <div
                className={`w-full h-full flex items-center justify-center text-2xl ${
                  completed ? 'bg-green-500/10' : 'bg-gray-800 grayscale opacity-40'
                }`}
              >
                {getCategoryIcon(task.category)}
              </div>
            )}
          </div>

          {/* Task Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`px-2 py-0.5 rounded text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}
              >
                {task.category}
              </span>
              {task.required && (
                <span className="px-2 py-0.5 rounded text-xs font-semibold border border-yellow-500/30 bg-yellow-500/10 text-yellow-400">
                  必修
                </span>
              )}
              <span className="text-gray-600 text-xs">Task {task.id}</span>
            </div>
            <h3
              className={`text-lg font-bold mb-2 ${
                completed ? 'text-white' : 'text-gray-500'
              }`}
            >
              {task.name}
            </h3>

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              {completed ? (
                <span className="flex items-center gap-1.5 text-green-400 text-sm font-semibold">
                  <CheckCircle size={16} />
                  <span>✓ QUALIFIED</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-gray-600 text-sm">
                  <XCircle size={16} />
                  <span>未完成</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expand Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1 py-2.5 border-t border-gray-800/50 text-gray-500 hover:text-gray-300 hover:bg-gray-800/30 transition-colors text-sm"
      >
        <span>{expanded ? '收起详情' : '查看通关秘籍'}</span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-gray-800/50 bg-black/20">
          {/* Challenge Link */}
          <a
            href={task.challengeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors mt-3"
          >
            <ExternalLink size={14} />
            <span>🔗 挑战入口</span>
          </a>

          {/* Video Tutorials */}
          {task.videoTutorials.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">📺 视频教程</p>
              {task.videoTutorials.map((video) => (
                <a
                  key={video.url}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300 transition-colors pl-2"
                >
                  <Play size={12} />
                  <span>{video.label}</span>
                </a>
              ))}
            </div>
          )}

          {/* Code Repos */}
          {task.codeRepos.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">💻 参考代码</p>
              {task.codeRepos.map((repo) => (
                <a
                  key={repo.url}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors pl-2"
                >
                  <Code size={12} />
                  <span>{repo.label}</span>
                </a>
              ))}
            </div>
          )}

          {/* Article */}
          {task.articleUrl && (
            <a
              href={task.articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition-colors"
            >
              <BookOpen size={14} />
              <span>📖 文字攻略</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main NFT Checker Page ───────────────────────────────────────
interface NFTCheckerProps {
  onBack: () => void;
}

export const NFTChecker: React.FC<NFTCheckerProps> = ({ onBack }) => {
  const [address, setAddress] = useState('');
  const { loading, error, result, queryNFTs, reset } = useNFTQuery();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    queryNFTs(address);
  };

  const handleReset = () => {
    setAddress('');
    reset();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative w-full py-10 px-4 md:px-8 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-80 h-80 bg-purple-600/15 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute top-5 right-1/3 w-72 h-72 bg-green-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm"
          >
            <ArrowLeft size={16} />
            <span>返回主页</span>
          </button>

          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-1 rounded border border-green-500/30 text-green-400 text-xs font-semibold bg-green-500/10">
              NFT 检测
            </span>
            <span className="px-2 py-1 rounded border border-gray-700 text-gray-400 text-xs bg-gray-900">
              Blueshift
            </span>
            <span className="px-2 py-1 rounded border border-gray-700 text-gray-400 text-xs bg-gray-900">
              Mainnet
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
            Blueshift 任务 NFT 检测器
          </h1>
          <p className="text-gray-400">
            输入你的 Solana 钱包地址，查看你在{' '}
            <a
              href="https://learn.blueshift.gg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:underline"
            >
              learn.blueshift.gg
            </a>{' '}
            上的挑战完成情况
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="输入 Solana 钱包地址 (例如: 7xKX...)"
                className="w-full pl-11 pr-4 py-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all font-mono text-sm"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !address.trim()}
              className="px-6 py-3.5 bg-green-500 hover:bg-green-400 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold rounded-xl transition-all whitespace-nowrap text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  查询中...
                </span>
              ) : (
                '查询 NFT'
              )}
            </button>
            {result && (
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-3.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-all text-sm border border-gray-700"
              >
                重置
              </button>
            )}
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-8 pb-20">
            {/* Summary Card */}
            <div
              className={`relative rounded-2xl border p-6 overflow-hidden ${
                result.isQualified
                  ? 'border-green-500/40 bg-gradient-to-br from-green-500/10 to-transparent'
                  : 'border-gray-800 bg-gray-900/50'
              }`}
            >
              {/* Background glow for qualified */}
              {result.isQualified && (
                <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/20 rounded-full blur-[60px] -z-10"></div>
              )}

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy
                      size={24}
                      className={result.isQualified ? 'text-green-400' : 'text-gray-600'}
                    />
                    <h2 className="text-2xl font-bold">
                      {result.isQualified ? (
                        <span className="text-green-400">🎉 QUALIFIED — 恭喜通关！</span>
                      ) : (
                        <span className="text-gray-400">任务进行中...</span>
                      )}
                    </h2>
                  </div>
                  <p className="text-gray-500 text-sm">
                    已完成 {result.completedCount}/6 个任务 · 必修任务 {result.requiredCompletedCount}/{REQUIRED_TASK_COUNT} 完成
                    {!result.isQualified && ' · 需完成全部 4 个必修任务'}
                  </p>
                </div>

                {/* Progress Circle */}
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="#1f2937"
                        strokeWidth="4"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke={result.isQualified ? '#22c55e' : '#6b7280'}
                        strokeWidth="4"
                        strokeDasharray={`${(result.completedCount / 6) * 175.9} 175.9`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-sm font-bold ${result.isQualified ? 'text-green-400' : 'text-gray-400'}`}>
                        {result.completedCount}/6
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      result.isQualified
                        ? 'bg-gradient-to-r from-green-500 to-green-400'
                        : 'bg-gradient-to-r from-gray-600 to-gray-500'
                    }`}
                    style={{ width: `${(result.completedCount / 6) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  {[1, 2, 3, 4, 5, 6].map((n) => {
                    const taskResult = result.tasks[n - 1];
                    return (
                      <span
                        key={n}
                        className={`text-xs ${
                          taskResult.completed ? 'text-green-400' : 'text-gray-700'
                        }`}
                      >
                        {taskResult.completed ? '●' : '○'}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Required Tasks Section */}
            <div>
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <span className="text-yellow-400">⭐</span>
                必修任务 (Task 1-4)
              </h3>
              <p className="text-gray-500 text-sm mb-4">完成全部 4 个必修任务即可获得 QUALIFIED 认证</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.tasks
                  .filter((r) => r.task.required)
                  .map((taskResult) => (
                    <TaskCard key={taskResult.task.id} taskResult={taskResult} />
                  ))}
              </div>
            </div>

            {/* Optional Tasks Section */}
            <div>
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <span className="text-purple-400">🚀</span>
                进阶任务 (Task 5-6)
              </h3>
              <p className="text-gray-500 text-sm mb-4">选修任务，完成可获得额外成就</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.tasks
                  .filter((r) => !r.task.required)
                  .map((taskResult) => (
                    <TaskCard key={taskResult.task.id} taskResult={taskResult} />
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !loading && !error && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-400 mb-2">输入钱包地址开始查询</h3>
            <p className="text-gray-600 text-sm max-w-md mx-auto">
              查询你在 Blueshift 挑战中获得的 NFT 徽章，完成 Task 1-4 所有必修任务即可获得 QUALIFIED 认证
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
