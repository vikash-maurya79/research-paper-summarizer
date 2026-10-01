import React from 'react';
import { BookOpen, ShieldCheck, History, GitCompare, MessageSquare, Database } from 'lucide-react';

interface HeaderProps {
  historyCount: number;
  onOpenHistory: () => void;
  onOpenCompare: () => void;
  hasCurrentAnalysis: boolean;
  onOpenChat: () => void;
  isDbConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  historyCount,
  onOpenHistory,
  onOpenCompare,
  hasCurrentAnalysis,
  onOpenChat,
}) => {
  return (
    <header className="border-b border-[#D9D9D9] bg-[#FAFBFA]/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Stack */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-orange-gradient p-0.5 shadow-md shadow-[#F16727]/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#FAFBFA] rounded-[10px] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#F16727]" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl text-[#171517] tracking-tight">
                Scholar<span className="text-[#F16727]">Extract</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-full bg-orange-subtle-gradient text-[#F16727] border border-[#F16727]/30">
                MERN Stack
              </span>
            </div>
            <p className="text-xs text-[#645E5D] hidden sm:block">
              5-Component Structural Research Extraction & Analysis
            </p>
          </div>
        </div>

        {/* Action Controls & Badges */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Chat with PDF pill requested by user: Light Blue #EAF3FF and Blue #2563EB */}
          {hasCurrentAnalysis && (
            <button
              onClick={onOpenChat}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#EAF3FF] hover:bg-[#dbeafe] text-[#2563EB] border border-[#2563EB]/25 text-xs font-semibold transition shadow-xs"
              title="Interactive Q&A with Paper"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Chat with PDF</span>
            </button>
          )}

          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#FAFBFA] border border-[#D9D9D9] text-[#645E5D] text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-medium">Zero-Hallucination Grounding</span>
          </div>

          {hasCurrentAnalysis && (
            <button
              onClick={onOpenCompare}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-[#F4F4F3] text-[#171517] border border-[#D9D9D9] transition"
              title="Compare with another paper or baseline"
            >
              <GitCompare className="w-3.5 h-3.5 text-[#F16727]" />
              <span className="hidden sm:inline">Compare</span>
            </button>
          )}

          <button
            onClick={onOpenHistory}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-[#F4F4F3] text-[#171517] border border-[#D9D9D9] transition relative"
            title="MongoDB Saved Papers History"
          >
            <History className="w-3.5 h-3.5 text-[#645E5D]" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-[#F16727] text-white font-bold">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
