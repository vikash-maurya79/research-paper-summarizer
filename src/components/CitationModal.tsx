import React, { useState } from 'react';
import { X, Quote, Copy, Check } from 'lucide-react';

interface CitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  paperTitle: string;
  sourceText: string;
}

export const CitationModal: React.FC<CitationModalProps> = ({
  isOpen,
  onClose,
  paperTitle,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const cleanKey = (paperTitle || 'paper')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 16);

  const bibtexContent = `@article{${cleanKey || 'researchpaper'}${new Date().getFullYear()},
  title     = {${paperTitle || 'Research Paper'}},
  author    = {Author, et al.},
  journal   = {Preprint / Academic Proceedings},
  year      = {${new Date().getFullYear()}},
  note      = {Extracted and analyzed via ScholarExtract}
}`;

  const apaCitation = `Author, A. (${new Date().getFullYear()}). ${paperTitle || 'Research Paper'}. Academic Proceedings.`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs p-4 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white border border-[#D9D9D9] rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#D9D9D9] flex items-center justify-between bg-[#FAFBFA]">
          <div className="flex items-center space-x-2">
            <Quote className="w-5 h-5 text-[#F16727]" />
            <h3 className="text-base font-extrabold text-[#171517]">Paper Citation</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#645E5D] hover:text-[#171517] hover:bg-[#F4F4F3] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 bg-[#FAFBFA]">
          <div>
            <label className="text-xs font-bold uppercase text-[#645E5D] block mb-1.5">
              APA Format
            </label>
            <div className="bg-white p-3 rounded-lg border border-[#D9D9D9] text-xs text-[#171517] flex items-center justify-between">
              <span className="font-serif italic">{apaCitation}</span>
              <button
                onClick={() => handleCopy(apaCitation)}
                className="ml-2 text-[#2563EB] hover:underline p-1"
                title="Copy APA"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase text-[#645E5D]">
                BibTeX Citation
              </label>
              <button
                onClick={() => handleCopy(bibtexContent)}
                className="text-xs text-[#F16727] hover:underline font-bold flex items-center space-x-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy BibTeX'}</span>
              </button>
            </div>
            <pre className="bg-white p-3.5 rounded-lg border border-[#D9D9D9] font-mono text-xs text-[#171517] overflow-x-auto leading-relaxed">
              {bibtexContent}
            </pre>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-[#D9D9D9] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#F4F4F3] hover:bg-[#eaeaea] text-[#171517] border border-[#D9D9D9] transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
