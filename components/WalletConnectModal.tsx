/**
 * Multi-Wallet Connection Modal
 * -----------------------------
 * Beautiful wallet selector supporting multiple Solana wallets.
 * Displays installed wallets and allows users to install new ones.
 */

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName, WalletReadyState } from '@solana/wallet-adapter-base';
import { X, ExternalLink, Wallet, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Wallet metadata for display
const WALLET_INFO: Record<string, { 
  name: string; 
  icon: string; 
  color: string;
  installUrl: string;
  description: string;
}> = {
  'Phantom': {
    name: 'Phantom',
    icon: '👻',
    color: 'from-purple-600 to-purple-800',
    installUrl: 'https://phantom.app/',
    description: 'Most popular Solana wallet'
  },
  'Solflare': {
    name: 'Solflare',
    icon: '🔥',
    color: 'from-orange-500 to-red-600',
    installUrl: 'https://solflare.com/',
    description: 'Feature-rich Solana wallet'
  },
  'Coinbase Wallet': {
    name: 'Coinbase',
    icon: '🔵',
    color: 'from-blue-500 to-blue-700',
    installUrl: 'https://www.coinbase.com/wallet',
    description: 'By Coinbase exchange'
  },
  'Ledger': {
    name: 'Ledger',
    icon: '🔐',
    color: 'from-gray-600 to-gray-800',
    installUrl: 'https://www.ledger.com/',
    description: 'Hardware wallet'
  },
  'Torus': {
    name: 'Torus',
    icon: '🌐',
    color: 'from-blue-400 to-cyan-500',
    installUrl: 'https://tor.us/',
    description: 'Social login wallet'
  },
  // OKX, Bitget, and other wallets using Wallet Standard will be detected automatically
  'OKX Wallet': {
    name: 'OKX',
    icon: '⚫',
    color: 'from-gray-800 to-black',
    installUrl: 'https://www.okx.com/web3',
    description: 'OKX Exchange Wallet'
  },
  'Bitget Wallet': {
    name: 'Bitget',
    icon: '🅱️',
    color: 'from-blue-500 to-cyan-400',
    installUrl: 'https://web3.bitget.com/',
    description: 'Bitget Exchange Wallet'
  },
};

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ isOpen, onClose }) => {
  const { wallets, select, connecting, connected, wallet } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  // Close modal when connected
  useEffect(() => {
    if (connected && wallet) {
      setTimeout(onClose, 500);
    }
  }, [connected, wallet, onClose]);

  if (!isOpen) return null;

  const handleWalletClick = async (walletName: WalletName) => {
    setSelectedWallet(walletName);
    try {
      select(walletName);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  // Separate installed and not installed wallets
  // Use WalletReadyState enum for proper comparison
  const installedWallets = wallets.filter(w => 
    w.readyState === WalletReadyState.Installed || 
    w.readyState === WalletReadyState.Loadable
  );
  const notInstalledWallets = wallets.filter(w => 
    w.readyState === WalletReadyState.NotDetected ||
    w.readyState === WalletReadyState.Unsupported
  );

  // Debug log
  console.log('Available wallets:', wallets.map(w => ({ name: w.adapter.name, readyState: w.readyState })));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#111] border border-gray-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
              <Wallet className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">连接钱包</h2>
              <p className="text-sm text-gray-400">Connect Wallet</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          
          {/* Installed Wallets */}
          {installedWallets.length > 0 && (
            <div className="mb-6">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-3 px-2">
                已安装 • Installed
              </p>
              <div className="space-y-2">
                {installedWallets.map((w) => {
                  const info = WALLET_INFO[w.adapter.name] || {
                    name: w.adapter.name,
                    icon: '💎',
                    color: 'from-gray-600 to-gray-800',
                    description: 'Solana Wallet'
                  };
                  const isSelecting = selectedWallet === w.adapter.name && connecting;
                  const isConnected = connected && wallet?.adapter.name === w.adapter.name;

                  return (
                    <button
                      key={w.adapter.name}
                      onClick={() => handleWalletClick(w.adapter.name)}
                      disabled={selectedWallet === w.adapter.name && connecting}
                      className={`
                        w-full flex items-center gap-4 p-4 rounded-xl border transition-all
                        ${isConnected 
                          ? 'bg-green-900/20 border-green-500/50' 
                          : 'bg-gray-900/50 border-gray-800 hover:border-gray-600 hover:bg-gray-800/50'
                        }
                        disabled:opacity-50
                      `}
                    >
                      {/* Wallet Icon */}
                      <div className={`w-12 h-12 bg-gradient-to-br ${info.color} rounded-xl flex items-center justify-center text-2xl`}>
                        {w.adapter.icon ? (
                          <img src={w.adapter.icon} alt={w.adapter.name} className="w-8 h-8 rounded-lg" />
                        ) : (
                          info.icon
                        )}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 text-left">
                        <p className="text-white font-semibold">{info.name}</p>
                        <p className="text-gray-500 text-sm">{info.description}</p>
                      </div>

                      {/* Status */}
                      {isSelecting ? (
                        <Loader2 className="text-green-400 animate-spin" size={20} />
                      ) : isConnected ? (
                        <CheckCircle2 className="text-green-400" size={20} />
                      ) : (
                        <ChevronRight className="text-gray-500" size={20} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Not Installed Wallets */}
          {notInstalledWallets.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-3 px-2">
                其他钱包 • Other Wallets
              </p>
              <div className="space-y-2">
                {notInstalledWallets.slice(0, 5).map((w) => {
                  const info = WALLET_INFO[w.adapter.name] || {
                    name: w.adapter.name,
                    icon: '💎',
                    color: 'from-gray-600 to-gray-800',
                    installUrl: '#',
                    description: 'Solana Wallet'
                  };

                  return (
                    <a
                      key={w.adapter.name}
                      href={info.installUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-800/50 bg-gray-900/30 hover:bg-gray-800/30 transition-all opacity-60 hover:opacity-100"
                    >
                      {/* Wallet Icon */}
                      <div className={`w-12 h-12 bg-gradient-to-br ${info.color} rounded-xl flex items-center justify-center text-2xl opacity-50`}>
                        {w.adapter.icon ? (
                          <img src={w.adapter.icon} alt={w.adapter.name} className="w-8 h-8 rounded-lg" />
                        ) : (
                          info.icon
                        )}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 text-left">
                        <p className="text-gray-300 font-semibold">{info.name}</p>
                        <p className="text-gray-600 text-sm">点击安装 • Click to install</p>
                      </div>

                      <ExternalLink className="text-gray-600" size={16} />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State - Only show if truly no wallets after detection */}
          {wallets.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🔗</div>
              <p className="text-gray-400">正在检测钱包...</p>
              <p className="text-gray-500 text-sm mt-1">Detecting wallets...</p>
              <div className="mt-4 space-y-3">
                <p className="text-gray-600 text-xs">如果长时间未检测到，请尝试：</p>
                <ul className="text-gray-500 text-xs space-y-1">
                  <li>• 刷新页面</li>
                  <li>• 确保钱包扩展已启用</li>
                  <li>• 检查钱包是否支持当前网站</li>
                </ul>
              </div>
              <a 
                href="https://phantom.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-green-400 hover:text-green-300"
              >
                安装 Phantom 钱包 <ExternalLink size={14} />
              </a>
            </div>
          )}

          {/* Show all wallets if no installed ones detected */}
          {installedWallets.length === 0 && wallets.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-900/50 rounded-lg">
              <p className="text-yellow-400 text-xs">
                ⚠️ 未检测到已安装的钱包。请确保你的钱包扩展已启用并刷新页面。
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-black/50">
          <p className="text-xs text-gray-500 text-center">
            支持所有兼容 Solana Wallet Standard 的钱包
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletConnectModal;
