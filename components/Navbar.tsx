import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Wallet, Menu, Bell, LogOut, Copy, Check, ExternalLink, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WalletConnectModal } from './WalletConnectModal';

interface NavbarProps {
  // Legacy props for compatibility - now handled internally via hooks
  onConnect?: () => void;
  isConnected?: boolean;
  walletAddress?: string;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { publicKey, connected, disconnect, wallet } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const shortAddress = publicKey 
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : '';

  const handleCopyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowDropdown(false);
  };

  const openExplorer = () => {
    if (publicKey) {
      window.open(`https://explorer.solana.com/address/${publicKey.toBase58()}?cluster=devnet`, '_blank');
    }
  };

  return (
    <>
      <nav className="w-full h-16 border-b border-gray-800 bg-black/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-4 md:px-8">
        {/* Logo Area */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="text-white">OpenBuild</span>
            <span className="bg-green-400 text-black text-xs px-1.5 py-0.5 rounded font-bold">BETA</span>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <a href="#" className="text-white hover:text-green-400 transition-colors">Learn</a>
          <a href="#" className="hover:text-white transition-colors">Challenges</a>
          <Link
            to="/nft-checker"
            className="flex items-center gap-1.5 hover:text-green-400 transition-colors"
          >
            <Search size={14} />
            NFT 检测
          </Link>
          <a href="#" className="hover:text-white transition-colors">SkillHub</a>
          <a href="#" className="hover:text-white transition-colors">Community</a>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button className="text-gray-400 hover:text-white transition-colors">
            <Bell size={20} />
          </button>
          
          {connected && publicKey ? (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-full px-4 py-1.5 cursor-pointer hover:border-green-500/50 transition-all"
              >
                {/* Wallet Icon */}
                {wallet?.adapter.icon && (
                  <img src={wallet.adapter.icon} alt="" className="w-5 h-5 rounded" />
                )}
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-sm font-mono text-gray-200">{shortAddress}</span>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowDropdown(false)} 
                  />
                  <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                    {/* Wallet Info */}
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

                    {/* Actions */}
                    <div className="p-2">
                      <button
                        onClick={handleCopyAddress}
                        className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                        <span>{copied ? '已复制!' : '复制地址'}</span>
                      </button>
                      
                      <button
                        onClick={openExplorer}
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
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              <Wallet size={16} />
              Connect
            </button>
          )}
          
          <button className="md:hidden text-gray-400">
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Wallet Connect Modal */}
      <WalletConnectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;
