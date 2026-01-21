import React from 'react';
import { Wallet, Menu, Bell } from 'lucide-react';

interface NavbarProps {
  onConnect: () => void;
  isConnected: boolean;
  walletAddress?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onConnect, isConnected, walletAddress }) => {
  return (
    <nav className="w-full h-16 border-b border-openbuild-border bg-black/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-4 md:px-8">
      {/* Logo Area */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <span className="text-white">OpenBuild</span>
          <span className="bg-openbuild-green text-black text-xs px-1.5 py-0.5 rounded font-bold">BETA</span>
        </div>
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
        <a href="#" className="text-white hover:text-openbuild-green transition-colors">Learn</a>
        <a href="#" className="hover:text-white transition-colors">Challenges</a>
        <a href="#" className="hover:text-white transition-colors">Bounties</a>
        <a href="#" className="hover:text-white transition-colors">SkillHub</a>
        <a href="#" className="hover:text-white transition-colors">Community</a>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-white transition-colors">
          <Bell size={20} />
        </button>
        
        {isConnected ? (
          <div className="flex items-center gap-2 bg-openbuild-card border border-openbuild-border rounded-full px-4 py-1.5 cursor-pointer hover:border-openbuild-green/50 transition-all">
            <div className="w-2 h-2 rounded-full bg-openbuild-green animate-pulse"></div>
            <span className="text-sm font-mono text-gray-200">{walletAddress}</span>
          </div>
        ) : (
          <button 
            onClick={onConnect}
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
  );
};