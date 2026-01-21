import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CheckInCard } from './components/CheckInCard';
import { InfoSidebar } from './components/InfoSidebar';
import { UserState } from './types';

function App() {
  const [userState, setUserState] = useState<UserState>(UserState.DISCONNECTED);

  const mockStats = {
    totalPool: 155.5,
    participants: 1555,
    daysRemaining: 14
  };

  const handleConnect = () => {
    // Simulate connection
    setUserState(UserState.CONNECTED);
  };

  const handleStake = () => {
    // Simulate staking process
    setTimeout(() => {
      setUserState(UserState.STAKED);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-openbuild-green selection:text-black">
      <Navbar 
        onConnect={handleConnect} 
        isConnected={userState !== UserState.DISCONNECTED}
        walletAddress={userState !== UserState.DISCONNECTED ? "8x...3f2a" : undefined}
      />
      
      <main className="pb-20">
        <Hero />
        
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Main Action (Check-in Machine) */}
            <div className="lg:col-span-8">
              <CheckInCard 
                userState={userState} 
                onConnect={handleConnect}
                onStake={handleStake}
              />

              {/* Course Description / Tabs (From screenshot context) */}
              <div className="mt-12">
                <div className="flex items-center gap-8 border-b border-gray-800 mb-6">
                  <button className="pb-4 text-white font-semibold border-b-2 border-white">Introduction</button>
                  <button className="pb-4 text-gray-500 hover:text-gray-300 transition-colors">Chapters</button>
                  <button className="pb-4 text-gray-500 hover:text-gray-300 transition-colors">Speakers</button>
                </div>
                
                <div className="text-gray-400 space-y-4 leading-relaxed">
                  <p>
                    欢迎来到 2026 Solana 开发者训练营！Solana 开发者训练营由 Magic Block 赞助，Solar 和 Solana Foundation 共同举办。
                    本期 Season 1 专注于 <span className="text-white">区块链开发 101</span>。
                  </p>
                  <p>
                    Solana 基金会开发者及生态资深导师授课，每周 Office Hour 现场答疑。
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-400 mt-4">
                    <li><span className="text-gray-300">Season 1:</span> 区块链技术 101 (1月6日 - 2月6日)</li>
                    <li><span className="text-gray-300">Season 2:</span> 区块链项目实战 (3月5日 - 4月5日)</li>
                    <li><span className="text-gray-300">Season 3:</span> Solana 企业技术实践 (5月5日 - 6月5日)</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Right Column: Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-24">
                <InfoSidebar stats={mockStats} />
              </div>
            </div>
            
          </div>
        </div>
      </main>
      
      {/* Simple Footer */}
      <footer className="border-t border-gray-800 py-12 mt-12 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center text-gray-600 text-sm">
          <p>&copy; 2026 OpenBuild & Solana Foundation. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;