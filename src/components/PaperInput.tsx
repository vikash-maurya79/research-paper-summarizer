import React, { useRef, useState } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  Trash2,
  FileCheck,
  BookMarked,
  ArrowRight,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { SAMPLE_PAPERS, SamplePaper } from '../data/samplePapers';

interface PaperInputProps {
  text: string;
  onChangeText: (value: string) => void;
  pdfFile: { name: string; size: number; base64: string } | null;
  onSelectPdf: (file: { name: string; size: number; base64: string } | null) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  onClear: () => void;
}

export const PaperInput: React.FC<PaperInputProps> = ({
  text,
  onChangeText,
  pdfFile,
  onSelectPdf,
  onAnalyze,
  isLoading,
  onClear,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = text.length;
  const estimatedReadingTime = Math.ceil(wordCount / 220);

  const handleFileUpload = (file: File) => {
    if (!file) return;

    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64 = result.split(',')[1];
        onSelectPdf({
          name: file.name,
          size: file.size,
          base64,
        });
        setSelectedSampleId(null);
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onChangeText(content);
        onSelectPdf(null);
        setSelectedSampleId(null);
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sample: SamplePaper) => {
    setSelectedSampleId(sample.id);
    onSelectPdf(null);
    onChangeText(sample.text);
  };

  const hasContent = text.trim().length > 0 || pdfFile !== null;

  return (
    <div className="bg-white border border-[#D9D9D9] rounded-2xl p-5 shadow-xs flex flex-col h-full">
      {/* Top Bar with Sample Presets */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#645E5D] flex items-center space-x-1.5">
            <BookMarked className="w-3.5 h-3.5 text-[#F16727]" />
            <span>Preset Research Papers</span>
          </label>
          <span className="text-[11px] text-[#9FA1A5]">1-Click Seminal Samples</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_PAPERS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all text-left flex items-center space-x-1.5 ${
                selectedSampleId === sample.id
                  ? 'bg-orange-subtle-gradient text-[#F16727] border-[#F16727] shadow-xs'
                  : 'bg-[#F4F4F3] hover:bg-[#eaeaea] text-[#171517] border-[#D9D9D9]'
              }`}
            >
              <span>{sample.title.split(':')[0]}</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-white text-[#645E5D] border border-[#D9D9D9]">
                {sample.year}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Upload Dropzone: Requested Very Light Gray #F4F4F3 with Border Gray #D9D9D9 */}
      {pdfFile ? (
        <div className="mb-3 p-3.5 rounded-xl bg-[#EAF3FF] border border-[#2563EB]/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB]">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#171517] truncate max-w-xs">{pdfFile.name}</p>
              <p className="text-xs text-[#2563EB] font-medium">
                PDF Document ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB) attached
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectPdf(null)}
            className="p-1.5 text-[#645E5D] hover:text-red-500 hover:bg-red-50 rounded-lg transition"
            title="Remove file"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`mb-3 border-2 border-dashed rounded-xl p-3.5 text-center transition-all ${
            dragOver
              ? 'border-[#F16727] bg-[#F16727]/5'
              : 'border-[#D9D9D9] hover:border-[#F16727] bg-[#F4F4F3]'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            accept=".pdf,.txt,.md"
            className="hidden"
          />
          <div className="flex items-center justify-center space-x-2 text-xs text-[#645E5D]">
            <Upload className="w-4 h-4 text-[#F16727]" />
            <span>Drag & drop research paper (.pdf, .txt, .md) or</span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[#2563EB] hover:underline font-bold"
            >
              browse
            </button>
          </div>
        </div>
      )}

      {/* Main Textarea */}
      <div className="relative flex-1 flex flex-col min-h-[300px]">
        <div className="flex items-center justify-between pb-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#645E5D] flex items-center space-x-1.5">
            <FileText className="w-3.5 h-3.5 text-[#F16727]" />
            <span>Paper Text / Abstract / Section</span>
          </label>
          {hasContent && (
            <button
              onClick={onClear}
              className="text-[11px] text-[#645E5D] hover:text-red-600 transition flex items-center space-x-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        <textarea
          value={text}
          onChange={(e) => {
            onChangeText(e.target.value);
            if (selectedSampleId) setSelectedSampleId(null);
          }}
          placeholder="Paste research paper abstract, methodology, results, or full text here... (e.g. arXiv preprint, conference paper, experimental study)"
          className="flex-1 w-full bg-[#FAFBFA] border border-[#D9D9D9] rounded-xl p-3.5 text-sm text-[#171517] placeholder-[#9FA1A5] focus:outline-none focus:ring-2 focus:ring-[#F16727]/30 focus:border-[#F16727] resize-none font-mono leading-relaxed transition"
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              if (hasContent && !isLoading) {
                onAnalyze();
              }
            }
          }}
        />

        {/* Footer statistics & action */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-[#D9D9D9]">
          <div className="flex items-center space-x-3 text-xs text-[#645E5D]">
            <span>
              <strong className="text-[#171517] font-semibold">{wordCount}</strong> words
            </span>
            <span>•</span>
            <span>
              <strong className="text-[#171517] font-semibold">{charCount}</strong> chars
            </span>
            {wordCount > 50 && (
              <>
                <span>•</span>
                <span>~{estimatedReadingTime} min read</span>
              </>
            )}
          </div>

          {/* Action button in Orange #F16727 or Disabled #9FA1A5 */}
          <button
            onClick={onAnalyze}
            disabled={!hasContent || isLoading}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2 transition-all shadow-md ${
              !hasContent || isLoading
                ? 'bg-[#9FA1A5] text-white cursor-not-allowed'
                : 'bg-orange-gradient hover:opacity-95 text-white shadow-[#F16727]/30 active:scale-[0.98]'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Extracting Components...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>Analyze Paper</span>
                <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-black/15 text-white">
                  ⌘↵
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
