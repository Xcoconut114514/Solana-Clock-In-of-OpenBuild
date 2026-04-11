import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useNavigate } from 'react-router-dom';
import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  Search, Loader2, AlertCircle, CheckCircle2,
  ExternalLink, Copy, Check, ArrowLeft,
  Trophy, Sparkles, PlayCircle, Code2, BookOpen, Video,
  Flame, AlertTriangle, Wallet, RefreshCw, CheckSquare, Square,
  LogOut,
} from 'lucide-react';
import { useNFTQuery, TaskCompletionStatus } from '../hooks/useNFTQuery';
import { isValidSolanaAddress, getAssetsByOwner } from '../services/heliusApi';
import { BLUESHIFT_TASKS, REQUIRED_TASK_IDS, getCollectionAddressSet } from '../config/blueshiftCollections';
import { BlueshiftTask, NFTAsset } from '../types/nft';
import { WalletConnectModal } from '../components/WalletConnectModal';

// Category color mapping
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  TYPESCRIPT: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  ANCHOR: { bg: 'bg-gray-500/10', text: 'text-gray-300', border: 'border-gray-500/30' },
  RUST: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
};

export const NFTChecker: React.FC = () => {
  const navigate = useNavigate();
  const { publicKey, connected, disconnect, wallet } = useWallet();
  const [inputAddress, setInputAddress] = useState('');
  const [copiedMint, setCopiedMint] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'checker' | 'burn'>('checker');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);

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

  // Auto-fill and query when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      const addr = publicKey.toBase58();
      setInputAddress(addr);
      setAutoFilled(true);
      setTimeout(() => setAutoFilled(false), 600);
      queryAddress(addr);
    }
  }, [connected, publicKey?.toBase58()]);

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

  const shortAddress = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : '';

  const handleCopyWalletAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toBase58());
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowWalletDropdown(false);
  };

  const getStatusForTask = (taskId: number): TaskCompletionStatus | undefined => {
    return taskStatuses.find(s => s.taskId === taskId);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Trophy size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Blueshift NFT Checker</h1>
              <p className="text-sm text-gray-400">查询任务完成徽章</p>
            </div>
          </div>

          {/* Wallet Button */}
          <div className="ml-auto">
            {connected && publicKey ? (
              <div className="relative">
                <button
                  onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                  className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-full px-4 py-1.5 cursor-pointer hover:border-green-500/50 transition-all"
                >
                  {wallet?.adapter.icon && (
                    <img src={wallet.adapter.icon} alt="" className="w-5 h-5 rounded" />
                  )}
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm font-mono text-gray-200">{shortAddress}</span>
                </button>

                {showWalletDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowWalletDropdown(false)} />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="p-4 border-b border-gray-800">
                        <div className="flex items-center gap-3">
                          {wallet?.adapter.icon && (
                            <img src={wallet.adapter.icon} alt="" className="w-10 h-10 rounded-xl" />
                          )}
                          <div>
                            <p className="text-white font-semibold">{wallet?.adapter.name}</p>
                            <p className="text-gray-500 text-sm font-mono">{shortAddress}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={handleCopyWalletAddress}
                          className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          {copiedAddress ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                          <span>{copiedAddress ? '已复制!' : '复制地址'}</span>
                        </button>
                        <button
                          onClick={() => window.open(`https://explorer.solana.com/address/${publicKey.toBase58()}`, '_blank')}
                          className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <ExternalLink size={16} />
                          <span>在浏览器查看</span>
                        </button>
                        <hr className="my-2 border-gray-800" />
                        <button
                          onClick={handleDisconnect}
                          className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <LogOut size={16} />
                          <span>断开连接</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
              >
                <Wallet size={16} />
                Connect
              </button>
            )}
          </div>
        </div>
        {/* Tab Switcher */}
        <div className="max-w-5xl mx-auto px-4 flex">
          <button
            onClick={() => setActiveTab('checker')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'checker'
                ? 'border-green-400 text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <Search size={14} />
            查询徽章
          </button>
          <button
            onClick={() => setActiveTab('burn')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'burn'
                ? 'border-red-400 text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <Flame size={14} />
            销毁 &amp; 退租金
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === 'burn' ? (
          <BurnPanel />
        ) : (<>
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
                    className={`w-full bg-black border rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none transition-all font-mono text-sm ${
                      autoFilled
                        ? 'border-green-400 shadow-[0_0_0_3px_rgba(74,222,128,0.15)]'
                        : 'border-gray-700 focus:border-green-500'
                    }`}
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
        </>)}
      </main>

      <WalletConnectModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
    </div>
  );
};

// ---- Burn Panel Constants & Helpers ----

const TOKEN_META_PROG = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
const RENT_PER_NFT_SOL = 0.01009;

type BurnStatus = 'pending' | 'success' | 'error';
interface BurnResult { mintId: string; taskName: string; status: BurnStatus; txSignature?: string; error?: string; }

async function makeBurnIx(mint: PublicKey, owner: PublicKey): Promise<TransactionInstruction> {
  const [metadata] = await PublicKey.findProgramAddress(
    [Buffer.from('metadata'), TOKEN_META_PROG.toBuffer(), mint.toBuffer()],
    TOKEN_META_PROG,
  );
  const [edition] = await PublicKey.findProgramAddress(
    [Buffer.from('metadata'), TOKEN_META_PROG.toBuffer(), mint.toBuffer(), Buffer.from('edition')],
    TOKEN_META_PROG,
  );
  const [ata] = await PublicKey.findProgramAddress(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  return new TransactionInstruction({
    programId: TOKEN_META_PROG,
    keys: [
      { pubkey: metadata, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: true },
      { pubkey: ata, isSigner: false, isWritable: true },
      { pubkey: edition, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.from([29]),
  });
}

// ---- Burn Panel Component ----

const BurnPanel: React.FC = () => {
  const wallet = useWallet();
  const { publicKey, connected } = wallet;
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [ownedNFTs, setOwnedNFTs] = useState<TaskCompletionStatus[]>([]);
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedMints, setSelectedMints] = useState<Set<string>>(new Set());
  const [isBurning, setIsBurning] = useState(false);
  const [burnResults, setBurnResults] = useState<BurnResult[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const mainnetConn = useMemo(() => {
    const apiKey = import.meta.env.VITE_HELIUS_API_KEY || '4014dcd5-6f37-456f-98b5-41d3b1e5147e';
    return new Connection(`https://mainnet.helius-rpc.com/?api-key=${apiKey}`, 'confirmed');
  }, []);

  const taskMap = useMemo(() => new Map(BLUESHIFT_TASKS.map(t => [t.id, t])), []);

  const loadNFTs = useCallback(async (address: string) => {
    setIsLoadingNFTs(true);
    setLoadError(null);
    setOwnedNFTs([]);
    setSelectedMints(new Set());
    setBurnResults([]);
    try {
      const colSet = getCollectionAddressSet();
      let all: NFTAsset[] = [];
      let page = 1;
      let hasMore = true;
      while (hasMore) {
        const res = await getAssetsByOwner(address, page, 1000);
        all = [...all, ...res.items];
        hasMore = res.items.length === 1000;
        page++;
        if (page > 5) break;
      }
      const byCol = new Map<string, NFTAsset>();
      for (const nft of all) {
        const c = nft.grouping?.find(g => g.group_key === 'collection');
        if (c && colSet.has(c.group_value)) byCol.set(c.group_value, nft);
      }
      const statuses: TaskCompletionStatus[] = BLUESHIFT_TASKS
        .map(t => ({ taskId: t.id, completed: byCol.has(t.collectionAddress), nft: byCol.get(t.collectionAddress) ?? null }))
        .filter(s => s.completed && s.nft !== null);
      setOwnedNFTs(statuses);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : '加载失败，请重试');
    } finally {
      setIsLoadingNFTs(false);
    }
  }, []);

  useEffect(() => {
    if (connected && publicKey) {
      loadNFTs(publicKey.toBase58());
    } else {
      setOwnedNFTs([]);
      setSelectedMints(new Set());
      setBurnResults([]);
    }
  }, [connected, publicKey, loadNFTs]);

  const toggleSelect = (id: string) => setSelectedMints(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });
  const selAll = () => setSelectedMints(new Set(ownedNFTs.filter(s => s.nft).map(s => s.nft!.id)));
  const clrAll = () => setSelectedMints(new Set());
  const estimatedRent = (selectedMints.size * RENT_PER_NFT_SOL).toFixed(4);

  const executeBurn = async () => {
    if (!wallet.publicKey || !wallet.sendTransaction || selectedMints.size === 0) return;
    setShowConfirm(false);
    setIsBurning(true);
    const toProcess = ownedNFTs.filter(s => s.nft && selectedMints.has(s.nft.id));
    setBurnResults(toProcess.map(s => ({
      mintId: s.nft!.id,
      taskName: taskMap.get(s.taskId)?.name ?? `Task ${s.taskId}`,
      status: 'pending' as BurnStatus,
    })));
    const done = new Set<string>();
    for (const s of toProcess) {
      const nft = s.nft!;
      try {
        const mint = new PublicKey(nft.id);
        const ix = await makeBurnIx(mint, wallet.publicKey);
        const { blockhash, lastValidBlockHeight } = await mainnetConn.getLatestBlockhash();
        const tx = new Transaction();
        tx.recentBlockhash = blockhash;
        tx.feePayer = wallet.publicKey;
        tx.add(ix);
        const sig = await wallet.sendTransaction(tx, mainnetConn);
        await mainnetConn.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'confirmed');
        done.add(nft.id);
        setBurnResults(p => p.map(r => r.mintId === nft.id ? { ...r, status: 'success', txSignature: sig } : r));
      } catch (e) {
        const msg = e instanceof Error ? e.message.slice(0, 80) : '交易失败';
        setBurnResults(p => p.map(r => r.mintId === nft.id ? { ...r, status: 'error', error: msg } : r));
      }
    }
    setOwnedNFTs(p => p.filter(s => !s.nft || !done.has(s.nft.id)));
    setSelectedMints(p => { const n = new Set(p); done.forEach(m => n.delete(m)); return n; });
    setIsBurning(false);
  };

  // ── Not connected ──
  if (!connected || !publicKey) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center">
          <Wallet size={32} className="text-gray-500" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">请先连接钱包</h3>
          <p className="text-gray-500 text-sm">连接后可查看并销毁你持有的 Blueshift 任务 NFT，链上租金将自动退回至你的钱包</p>
        </div>
        <button
          onClick={() => setShowConnectModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-green-400 hover:bg-green-500 text-black font-semibold rounded-xl transition-colors"
        >
          <Wallet size={18} />
          连接钱包
        </button>
        <WalletConnectModal isOpen={showConnectModal} onClose={() => setShowConnectModal(false)} />
      </div>
    );
  }

  // ── Burning progress / results ──
  if (isBurning || burnResults.length > 0) {
    const successCount = burnResults.filter(r => r.status === 'success').length;
    const failCount = burnResults.filter(r => r.status === 'error').length;
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            {isBurning
              ? <><Loader2 size={18} className="animate-spin text-gray-400" /> 销毁进行中...</>
              : '销毁完成'}
          </h2>
          {!isBurning && (
            <div className="flex gap-3 text-sm">
              {successCount > 0 && <span className="text-green-400">{successCount} 成功</span>}
              {failCount > 0 && <span className="text-red-400">{failCount} 失败</span>}
            </div>
          )}
        </div>
        <div className="space-y-3">
          {burnResults.map(r => (
            <div key={r.mintId} className={`flex items-center gap-4 p-4 rounded-xl border ${
              r.status === 'success' ? 'bg-green-900/10 border-green-500/30' :
              r.status === 'error'   ? 'bg-red-900/10 border-red-500/30'     :
                                       'bg-gray-900/50 border-gray-800'
            }`}>
              <div className="shrink-0">
                {r.status === 'pending' && <Loader2 size={20} className="text-gray-400 animate-spin" />}
                {r.status === 'success' && <CheckCircle2 size={20} className="text-green-400" />}
                {r.status === 'error'   && <AlertCircle size={20} className="text-red-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{r.taskName}</p>
                <p className="text-xs text-gray-500 font-mono truncate">{r.mintId.slice(0, 20)}...{r.mintId.slice(-6)}</p>
                {r.error && <p className="text-xs text-red-400 mt-1 break-words">{r.error}</p>}
              </div>
              {r.txSignature && (
                <a href={`https://explorer.solana.com/tx/${r.txSignature}`} target="_blank" rel="noopener noreferrer"
                   className="shrink-0 text-gray-500 hover:text-white transition-colors">
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          ))}
        </div>
        {!isBurning && (
          <button
            onClick={() => { setBurnResults([]); loadNFTs(publicKey.toBase58()); }}
            className="flex items-center gap-2 mt-4 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw size={14} />
            刷新列表
          </button>
        )}
      </div>
    );
  }

  // ── Main two-column UI ──
  const allMintIds = ownedNFTs.filter(s => s.nft).map(s => s.nft!.id);
  const allSelected = allMintIds.length > 0 && allMintIds.every(id => selectedMints.has(id));
  const selectedNFTs = ownedNFTs.filter(s => s.nft && selectedMints.has(s.nft.id));

  return (
    <div>
      {/* Mainnet warning */}
      <div className="flex items-start sm:items-center gap-3 mb-6 p-3 bg-orange-900/10 border border-orange-500/20 rounded-xl text-sm text-orange-300">
        <AlertTriangle size={16} className="shrink-0 mt-0.5 sm:mt-0" />
        <span>以下操作在 <strong>Mainnet</strong> 上执行。NFT 销毁后<strong>永久不可恢复</strong>，链上租金自动退回至你的钱包。</span>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={allSelected ? clrAll : selAll}
          disabled={ownedNFTs.length === 0}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-lg transition-colors disabled:opacity-40"
        >
          {allSelected ? <CheckSquare size={14} className="text-green-400" /> : <Square size={14} />}
          {allSelected ? '取消全选' : '全部选择'}
        </button>
        {selectedMints.size > 0 && (
          <span className="text-sm text-gray-500">
            已选 <span className="text-white font-medium">{selectedMints.size}</span> 个
          </span>
        )}
        <div className="ml-auto">
          <button
            onClick={() => { if (publicKey) loadNFTs(publicKey.toBase58()); }}
            disabled={isLoadingNFTs}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-300 border border-gray-800 rounded-lg transition-colors disabled:opacity-40"
          >
            <RefreshCw size={13} className={isLoadingNFTs ? 'animate-spin' : ''} />
            刷新
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: NFT selection (7/12) */}
        <div className="lg:col-span-7">
          {isLoadingNFTs ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 size={32} className="text-gray-500 animate-spin" />
              <p className="text-gray-500 text-sm">正在加载你的 Blueshift NFT...</p>
            </div>
          ) : loadError ? (
            <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-900/50 rounded-xl text-red-400 text-sm">
              <AlertCircle size={16} />
              {loadError}
            </div>
          ) : ownedNFTs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <div className="text-4xl">🎖️</div>
              <p className="text-gray-400 font-medium">该钱包未持有任何 Blueshift NFT</p>
              <p className="text-gray-600 text-sm">完成 Blueshift 挑战后才能看到可销毁的 NFT</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ownedNFTs.map(s => {
                const task = taskMap.get(s.taskId);
                const nft = s.nft!;
                const checked = selectedMints.has(nft.id);
                return (
                  <div
                    key={nft.id}
                    onClick={() => toggleSelect(nft.id)}
                    className={`relative cursor-pointer rounded-xl border overflow-hidden transition-all ${
                      checked
                        ? 'border-red-400/70 bg-red-900/10 shadow-lg shadow-red-900/20'
                        : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
                    }`}
                  >
                    <div className="relative aspect-video">
                      <img
                        src={task?.imageUrl}
                        alt={task?.name}
                        className={`w-full h-full object-cover transition-all ${checked ? '' : 'opacity-70'}`}
                        loading="lazy"
                      />
                      <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        checked ? 'bg-red-400 border-red-400' : 'bg-black/50 border-gray-500'
                      }`}>
                        {checked && <Check size={12} className="text-black" />}
                      </div>
                    </div>
                    <div className="p-3">
                      {task && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border inline-block mb-1.5
                          ${CATEGORY_COLORS[task.category]?.bg ?? ''} ${CATEGORY_COLORS[task.category]?.text ?? ''} ${CATEGORY_COLORS[task.category]?.border ?? ''}`}>
                          {task.category}
                        </span>
                      )}
                      <p className="text-sm font-semibold text-white truncate">
                        Task {s.taskId}: {task?.name ?? nft.content.metadata.name}
                      </p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5 truncate">
                        {nft.id.slice(0, 16)}...{nft.id.slice(-6)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Rent return summary (5/12) */}
        <div className="lg:col-span-5">
          <div className="sticky top-32 space-y-4">
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Wallet size={16} className="text-green-400" />
                租金退回明细
              </h3>
              {selectedNFTs.length === 0 ? (
                <p className="text-gray-600 text-sm py-6 text-center">← 在左侧选择要销毁的 NFT</p>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {selectedNFTs.map(s => {
                      const task = taskMap.get(s.taskId);
                      return (
                        <div key={s.nft!.id} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-300 font-medium truncate max-w-[60%]">
                              Task {s.taskId}: {task?.name ?? '—'}
                            </span>
                            <span className="text-green-400 font-mono text-xs shrink-0">+{RENT_PER_NFT_SOL.toFixed(4)} SOL</span>
                          </div>
                          <div className="pl-2 space-y-0.5 text-xs text-gray-600 border-l border-gray-800">
                            <div className="flex justify-between"><span>Token Account</span><span>≈0.0020 SOL</span></div>
                            <div className="flex justify-between"><span>Metadata Account</span><span>≈0.0058 SOL</span></div>
                            <div className="flex justify-between"><span>Edition Account</span><span>≈0.0023 SOL</span></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t border-gray-800 pt-3 flex items-center justify-between">
                    <span className="text-sm text-gray-400">预计合计退回</span>
                    <span className="text-xl font-bold text-green-400">+{estimatedRent} SOL</span>
                  </div>
                </>
              )}
            </div>

            {selectedNFTs.length > 0 && (
              <>
                <div className="flex items-start gap-2 p-3 bg-red-900/10 border border-red-500/20 rounded-xl text-xs text-red-400">
                  <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                  <span>销毁后 NFT 从链上<strong>永久删除</strong>，无法撤销。请仔细确认选中内容。</span>
                </div>
                <button
                  onClick={() => setShowConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors"
                >
                  <Flame size={16} />
                  确认销毁 {selectedNFTs.length} 个 NFT
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-[#111] border border-red-500/30 rounded-2xl w-full max-w-sm mx-4 p-6 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <Flame size={28} className="text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-2">最终确认销毁</h3>
            <p className="text-sm text-gray-400 text-center mb-1">
              钱包: <span className="text-white font-mono">{publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-6)}</span>
            </p>
            <p className="text-sm text-gray-400 text-center mb-1">
              销毁 <span className="text-white font-bold">{selectedMints.size}</span> 个 Blueshift NFT
            </p>
            <p className="text-sm text-gray-400 text-center mb-5">
              预计退回 <span className="text-green-400 font-bold">{estimatedRent} SOL</span>
            </p>
            <p className="text-xs text-red-400 text-center mb-6 font-semibold">⚠️ 此操作在 Mainnet 执行，永久不可逆</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 text-sm border border-gray-700 text-gray-300 hover:text-white rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                onClick={executeBurn}
                className="flex-1 py-2.5 text-sm bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors"
              >
                🔥 确认销毁
              </button>
            </div>
          </div>
        </div>
      )}
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
    <div
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`rounded-xl border overflow-hidden transition-all duration-300 ${
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
        title=""
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
              {expanded ? '▲ 收起' : '▼ 展开'}
            </div>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      <div className={`border-t border-gray-800 px-4 md:px-5 py-4 space-y-3 bg-black/30 transition-all duration-200 ${
        expanded ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0 py-0 overflow-hidden border-t-0'
      }`}>
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
    </div>
  );
};

export default NFTChecker;
