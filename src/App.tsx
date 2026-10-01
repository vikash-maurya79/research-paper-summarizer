import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PaperInput } from './components/PaperInput';
import { AnalysisViewer } from './components/AnalysisViewer';
import { ChatWithPdf } from './components/ChatWithPdf';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ComparisonModal } from './components/ComparisonModal';
import { CitationModal } from './components/CitationModal';
import { AnalysisRecord, ChatMessage } from './types';
import { SAMPLE_PAPERS } from './data/samplePapers';
import {
  AlertCircle,
  Sparkles,
  FileSearch,
  MessageSquare,
  Database,
  Layers,
} from 'lucide-react';

const STORAGE_KEY = 'scholar_extract_history_v2';

export default function App() {
  const [text, setText] = useState<string>(SAMPLE_PAPERS[0].text);
  const [pdfFile, setPdfFile] = useState<{ name: string; size: number; base64: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [currentRecord, setCurrentRecord] = useState<AnalysisRecord | null>(null);
  const [history, setHistory] = useState<AnalysisRecord[]>([]);

  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const [isCitationOpen, setIsCitationOpen] = useState<boolean>(false);
  const [showChatWithPdf, setShowChatWithPdf] = useState<boolean>(false);

  // Fetch papers from MERN backend (MongoDB) or localStorage fallback
  const fetchPapersFromBackend = async () => {
    try {
      const res = await fetch('/api/papers');
      if (res.ok) {
        const dbPapers = await res.json();
        if (Array.isArray(dbPapers) && dbPapers.length > 0) {
          setHistory(dbPapers);
          if (!currentRecord) {
            setCurrentRecord(dbPapers[0]);
          }
          return;
        }
      }
    } catch (e) {
      console.warn('Backend paper fetch failed, checking localStorage fallback:', e);
    }

    // Fallback to localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistory(parsed);
          if (!currentRecord) {
            setCurrentRecord(parsed[0]);
          }
        }
      }
    } catch (e) {
      console.error('Error loading fallback papers:', e);
    }
  };

  useEffect(() => {
    fetchPapersFromBackend();
  }, []);

  const handleAnalyze = async () => {
    if (!text.trim() && !pdfFile) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          pdfBase64: pdfFile?.base64,
          mimeType: 'application/pdf',
          fileName: pdfFile?.name,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${response.status}`);
      }

      const data = await response.json();

      const newRecord: AnalysisRecord = {
        id: data.id || `rec_${Date.now()}`,
        _id: data.id,
        paperTitle: data.paperTitle,
        rawText: text,
        markdown: data.markdown,
        structured: data.structured,
        stats: data.stats,
        createdAt: data.createdAt || Date.now(),
        fileName: pdfFile?.name,
        chatHistory: [],
        database: data.database,
      };

      setCurrentRecord(newRecord);

      // Update state & fallback storage
      const updatedHistory = [newRecord, ...history.filter((h) => (h._id || h.id) !== newRecord.id)];
      setHistory(updatedHistory);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory.slice(0, 30)));
      } catch (e) {
        // ignore storage quota error
      }
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setError(err.message || 'Failed to analyze paper. Please check connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setPdfFile(null);
    setError(null);
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      await fetch(`/api/papers/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Failed to delete on server:', e);
    }

    const updated = history.filter((r) => (r._id || r.id) !== id);
    setHistory(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}

    if ((currentRecord?._id || currentRecord?.id) === id) {
      setCurrentRecord(updated.length > 0 ? updated[0] : null);
    }
  };

  const handleClearAllHistory = () => {
    setHistory([]);
    setCurrentRecord(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  };

  const handleAddChatMessage = (msg: ChatMessage) => {
    if (!currentRecord) return;
    const updatedRecord = {
      ...currentRecord,
      chatHistory: [...(currentRecord.chatHistory || []), msg],
    };
    setCurrentRecord(updatedRecord);
    setHistory(history.map((h) => ((h._id || h.id) === (currentRecord._id || currentRecord.id) ? updatedRecord : h)));
  };

  return (
    <div className="min-h-screen bg-[#FAFBFA] text-[#171517] flex flex-col font-sans">
      {/* Navigation Header */}
      <Header
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenCompare={() => setIsCompareOpen(true)}
        hasCurrentAnalysis={currentRecord !== null}
        onOpenChat={() => setShowChatWithPdf(!showChatWithPdf)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        {/* Banner with 5 Structural Components Blueprint */}
        <div className="mb-6 p-4 rounded-2xl bg-white border border-[#D9D9D9] shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm text-[#171517]">
                  Academic Paper Structural Extraction & Analysis
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-subtle-gradient text-[#F16727] font-bold border border-[#F16727]/30">
                  MERN Architecture
                </span>
              </div>
              <p className="text-xs text-[#645E5D] mt-1">
                Zero-hallucination extraction: primary objective, methodology, findings, limitations (strictly <span className="font-mono text-[#F16727] font-semibold">"Not explicitly mentioned in the text."</span> if absent), and key takeaways.
              </p>
            </div>

            {/* 5 Component Badges */}
            <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
              <span className="px-2.5 py-1 rounded-lg bg-[#FAFBFA] text-[#F16727] border border-[#D9D9D9]">
                1. 🎯 Objective
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#FAFBFA] text-[#2563EB] border border-[#D9D9D9]">
                2. ⚙️ Methodology
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#FAFBFA] text-emerald-700 border border-[#D9D9D9]">
                3. 📊 Findings
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#FAFBFA] text-amber-700 border border-[#D9D9D9]">
                4. ⚠️ Limitations
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#FAFBFA] text-purple-700 border border-[#D9D9D9]">
                5. 💡 Key Takeaways
              </span>
            </div>
          </div>
        </div>

        {/* Error notification if any */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between shadow-2xs">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900 font-bold text-xs ml-4 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Collapsible Chat with PDF Section (Light Blue #EAF3FF) */}
        {showChatWithPdf && currentRecord && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
            <ChatWithPdf
              paperId={currentRecord._id || currentRecord.id}
              paperTitle={currentRecord.paperTitle}
              rawText={currentRecord.rawText}
              pdfBase64={pdfFile?.base64}
              chatHistory={currentRecord.chatHistory || []}
              onAddMessage={handleAddChatMessage}
              onClose={() => setShowChatWithPdf(false)}
            />
          </div>
        )}

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch">
          {/* Left Column: Paper Input & Upload */}
          <div className="lg:col-span-5 flex flex-col">
            <PaperInput
              text={text}
              onChangeText={setText}
              pdfFile={pdfFile}
              onSelectPdf={setPdfFile}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              onClear={handleClear}
            />
          </div>

          {/* Right Column: Analysis Viewer or Empty State */}
          <div className="lg:col-span-7 flex flex-col">
            {currentRecord ? (
              <AnalysisViewer
                markdown={currentRecord.markdown}
                structured={currentRecord.structured}
                stats={currentRecord.stats}
                sourceText={currentRecord.rawText}
                onOpenChatWithPdf={() => setShowChatWithPdf(true)}
              />
            ) : (
              <div className="bg-white border border-[#D9D9D9] rounded-2xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[400px] shadow-2xs">
                <div className="w-16 h-16 rounded-2xl bg-orange-subtle-gradient border border-[#F16727]/30 flex items-center justify-center mb-4">
                  <FileSearch className="w-8 h-8 text-[#F16727] stroke-[1.5]" />
                </div>
                <h3 className="text-base font-extrabold text-[#171517]">
                  Ready to Analyze Research Paper
                </h3>
                <p className="text-xs text-[#645E5D] max-w-sm mt-1.5 leading-relaxed">
                  Click <strong className="text-[#F16727]">"Analyze Paper"</strong> on the left to extract the 5 structural components: Objective, Methodology, Findings, Limitations, and Key Takeaways.
                </p>
                <div className="mt-5 flex items-center space-x-2">
                  <button
                    onClick={handleAnalyze}
                    className="px-4 py-2 rounded-xl bg-orange-gradient hover:opacity-95 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow-md shadow-[#F16727]/25"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span>Run Analysis Now</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        records={history}
        onSelectRecord={(rec) => {
          setCurrentRecord(rec);
          setText(rec.rawText);
        }}
        onDeleteRecord={handleDeleteRecord}
        onClearAll={handleClearAllHistory}
      />

      {/* Comparison Modal */}
      {currentRecord && (
        <ComparisonModal
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
          currentRecord={currentRecord}
          records={history}
        />
      )}

      {/* Citation Modal */}
      {currentRecord && (
        <CitationModal
          isOpen={isCitationOpen}
          onClose={() => setIsCitationOpen(false)}
          paperTitle={currentRecord.paperTitle}
          sourceText={currentRecord.rawText}
        />
      )}
    </div>
  );
}
