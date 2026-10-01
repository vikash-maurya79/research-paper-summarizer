import React, { useState } from 'react';
import { X, GitCompare, Target, Cpu, BarChart3, AlertTriangle, Lightbulb } from 'lucide-react';
import { AnalysisRecord, StructuredAnalysis } from '../types';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRecord: AnalysisRecord;
  records: AnalysisRecord[];
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  currentRecord,
  records,
}) => {
  const currentId = currentRecord._id || currentRecord.id;
  const otherRecords = records.filter((r) => (r._id || r.id) !== currentId);
  const [selectedOtherId, setSelectedOtherId] = useState<string>(
    otherRecords.length > 0 ? (otherRecords[0]._id || otherRecords[0].id) : ''
  );

  if (!isOpen) return null;

  const compareTarget = otherRecords.find((r) => (r._id || r.id) === selectedOtherId);

  const sections: {
    key: keyof Omit<StructuredAnalysis, 'title' | 'hasExplicitLimitations'>;
    label: string;
    icon: any;
    color: string;
  }[] = [
    { key: 'objective', label: '🎯 Objective', icon: Target, color: 'text-[#F16727]' },
    { key: 'methodology', label: '⚙️ Methodology', icon: Cpu, color: 'text-[#2563EB]' },
    { key: 'findings', label: '📊 Findings', icon: BarChart3, color: 'text-emerald-600' },
    { key: 'limitations', label: '⚠️️ Limitations', icon: AlertTriangle, color: 'text-amber-600' },
    { key: 'keyTakeaways', label: '💡 Key Takeaways', icon: Lightbulb, color: 'text-purple-600' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs p-4 sm:p-6 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white border border-[#D9D9D9] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#D9D9D9] flex items-center justify-between bg-[#FAFBFA]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-subtle-gradient text-[#F16727] flex items-center justify-center border border-[#F16727]/30">
              <GitCompare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#171517]">Cross-Paper Structural Comparison</h2>
              <p className="text-xs text-[#645E5D]">
                Compare objectives, methodologies, empirical findings, and limitations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#645E5D] hover:text-[#171517] hover:bg-[#F4F4F3] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paper Selector Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#D9D9D9] bg-[#FAFBFA] p-3.5 border-b border-[#D9D9D9]">
          <div className="px-3 py-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#F16727]">
              Active Paper (Paper A)
            </span>
            <h3 className="font-bold text-sm text-[#171517] truncate mt-0.5">
              {currentRecord.paperTitle || 'Current Paper'}
            </h3>
            <span className="text-xs text-[#645E5D]">{currentRecord.stats.wordCount} words</span>
          </div>

          <div className="px-3 py-1 mt-2 md:mt-0 flex flex-col justify-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#2563EB]">
              Comparison Baseline (Paper B)
            </span>
            {otherRecords.length > 0 ? (
              <select
                value={selectedOtherId}
                onChange={(e) => setSelectedOtherId(e.target.value)}
                className="mt-1 bg-white border border-[#D9D9D9] rounded-lg px-2.5 py-1 text-xs text-[#171517] focus:outline-none focus:border-[#2563EB] font-medium"
              >
                {otherRecords.map((r) => (
                  <option key={r._id || r.id} value={r._id || r.id}>
                    {r.paperTitle || 'Untitled Record'} ({r.stats.wordCount} words)
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-[#645E5D] italic mt-1">
                Analyze another paper or sample to compare side-by-side.
              </p>
            )}
          </div>
        </div>

        {/* Comparison Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#FAFBFA]">
          {compareTarget ? (
            sections.map((sec) => (
              <div key={sec.key} className="bg-white border border-[#D9D9D9] rounded-xl p-4 shadow-2xs">
                <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-[#D9D9D9]">
                  <sec.icon className={`w-4 h-4 ${sec.color}`} />
                  <h4 className="font-extrabold text-sm text-[#171517]">{sec.label}</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Paper A items */}
                  <div className="bg-[#FAFBFA] p-3 rounded-lg border border-[#F16727]/30">
                    <span className="text-[10px] font-bold text-[#F16727] uppercase tracking-wide block mb-2">
                      Paper A
                    </span>
                    <ul className="space-y-1.5 text-xs text-[#171517]">
                      {currentRecord.structured[sec.key].length > 0 ? (
                        currentRecord.structured[sec.key].map((item, idx) => (
                          <li key={idx} className="flex items-start space-x-1.5">
                            <span className="text-[#F16727] font-bold shrink-0">•</span>
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-[#9FA1A5] italic">None</li>
                      )}
                    </ul>
                  </div>

                  {/* Paper B items */}
                  <div className="bg-[#FAFBFA] p-3 rounded-lg border border-[#2563EB]/30">
                    <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wide block mb-2">
                      Paper B
                    </span>
                    <ul className="space-y-1.5 text-xs text-[#171517]">
                      {compareTarget.structured[sec.key].length > 0 ? (
                        compareTarget.structured[sec.key].map((item, idx) => (
                          <li key={idx} className="flex items-start space-x-1.5">
                            <span className="text-[#2563EB] font-bold shrink-0">•</span>
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-[#9FA1A5] italic">None</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-[#645E5D] text-sm">
              Please analyze at least two papers to compare them side-by-side.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
