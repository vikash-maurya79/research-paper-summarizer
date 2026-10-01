import React from 'react';
import { X, Clock, Trash2, ArrowRight, FileText, Database } from 'lucide-react';
import { AnalysisRecord } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  records: AnalysisRecord[];
  onSelectRecord: (record: AnalysisRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  records,
  onSelectRecord,
  onDeleteRecord,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#D9D9D9] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#D9D9D9] flex items-center justify-between bg-[#FAFBFA]">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-[#F16727]" />
              <h2 className="text-base font-extrabold text-[#171517]">MERN Paper Database</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#EAF3FF] text-[#2563EB] border border-[#2563EB]/20">
                {records.length}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {records.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-xs text-[#645E5D] hover:text-red-600 transition font-medium"
                  title="Clear all history"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-[#645E5D] hover:text-[#171517] hover:bg-[#F4F4F3] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFBFA]">
            {records.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-[#645E5D]">
                <FileText className="w-10 h-10 mb-2 text-[#9FA1A5] stroke-[1.5]" />
                <p className="text-sm font-bold text-[#171517]">No saved papers in database</p>
                <p className="text-xs mt-1 text-[#645E5D]">
                  Analyze any paper to store it persistently in MongoDB and inspect anytime.
                </p>
              </div>
            ) : (
              records.map((rec) => (
                <div
                  key={rec._id || rec.id}
                  className="group relative bg-white hover:border-[#F16727] border border-[#D9D9D9] rounded-xl p-3.5 transition-all shadow-2xs flex flex-col justify-between"
                >
                  <div
                    onClick={() => {
                      onSelectRecord(rec);
                      onClose();
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#645E5D] mb-1.5">
                      <span>{new Date(rec.createdAt).toLocaleDateString()}</span>
                      <span className="font-mono">{rec.stats.wordCount} words</span>
                    </div>

                    <h3 className="font-bold text-sm text-[#171517] line-clamp-1 group-hover:text-[#F16727] transition">
                      {rec.paperTitle || 'Untitled Research Analysis'}
                    </h3>

                    <p className="text-xs text-[#645E5D] line-clamp-2 mt-1.5 leading-relaxed">
                      {rec.structured?.objective?.[0] || rec.markdown?.slice(0, 120)}
                    </p>

                    <div className="mt-2.5 flex items-center space-x-2">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#F4F4F3] text-[#171517] font-semibold border border-[#D9D9D9]">
                        5 Components
                      </span>
                      {rec.structured?.hasExplicitLimitations ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                          Limitations present
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                          No limitations in text
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#D9D9D9] flex items-center justify-between">
                    <button
                      onClick={() => {
                        onSelectRecord(rec);
                        onClose();
                      }}
                      className="text-xs text-[#F16727] hover:underline font-bold flex items-center space-x-1"
                    >
                      <span>Load Analysis</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRecord(rec._id || rec.id);
                      }}
                      className="text-[#9FA1A5] hover:text-red-600 p-1 rounded transition"
                      title="Delete this record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
