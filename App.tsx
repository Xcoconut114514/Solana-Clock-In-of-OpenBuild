/**
 * Solana Clock-In DApp
 * --------------------
 * Main application component with wallet and staking pool providers.
 *
 * Features:
 * - Multi-wallet support (Phantom, OKX, Bitget, Coinbase, etc.)
 * - Real staking pool functionality
 * - Co-signed check-in transactions via backend Oracle
 * - Blueshift NFT task checker
 */

import React, { useState } from 'react';
import { WalletContextProvider } from './contexts/WalletContext';
import { StakePoolProvider } from './contexts/StakePoolContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CheckInCard } from './components/CheckInCard';
import { InfoSidebar } from './components/InfoSidebar';
import { NFTChecker } from './pages/NFTChecker';

export type PageType = 'home' | 'nft-checker';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  if (currentPage === 'nft-checker') {
    return <NFTChecker onBack={() => setCurrentPage('home')} />;
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-green-400 selection:text-black">
      <Navbar onNavigate={setCurrentPage} />

      <main className="pb-20">
        <Hero />

        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Column: Main Action (Check-in Machine) */}
            <div className="lg:col-span-8">
              <CheckInCard />

              {/* Course Description / Tabs */}
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
              <div className="sticky top-24 space-y-6">
                <InfoSidebar />

                {/* NFT Checker Entry Card */}
                <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-5">
                  <h3 className="text-base font-bold text-white mb-1.5 flex items-center gap-2">
                    <span className="text-lg">🏆</span> 任务徽章查询
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                    查看你的 Blueshift 任务完成 NFT 徽章，完成 Task 1-4 即为达标
                  </p>
                  <button
                    onClick={() => setCurrentPage('nft-checker')}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
                  >
                    开始查询
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 mt-12 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center text-gray-600 text-sm">
          <p>&copy; 2026 OpenBuild & Solana Foundation. All rights reserved.</p>
          <p className="mt-2 text-gray-700">
            Powered by Solana | Backend Oracle for secure check-in verification
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <WalletContextProvider network="devnet">
      <StakePoolProvider>
        <AppContent />
      </StakePoolProvider>
    </WalletContextProvider>
  );
}

export default App;
