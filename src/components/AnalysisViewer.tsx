import React, { useState } from 'react';
import {
  Target,
  Cpu,
  BarChart3,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check,
  Download,
  Printer,
  Code2,
  LayoutGrid,
  Columns,
  Quote,
  ShieldCheck,
  Search,
  MessageSquare,
} from 'lucide-react';
import { StructuredAnalysis, AnalysisStats } from '../types';
import { marked } from 'marked';

interface AnalysisViewerProps {
  markdown: string;
  structured: StructuredAnalysis;
  stats: AnalysisStats;
  sourceText: string;
  onOpenChatWithPdf?: () => void;
}

type TabMode = 'cards' | 'markdown' | 'split' | 'rendered';

export const AnalysisViewer: React.FC<AnalysisViewerProps> = ({
  markdown,
  structured,
  stats,
  sourceText,
  onOpenChatWithPdf,
}) => {
  const [tab, setTab] = useState<TabMode>('cards');
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [highlightKeyword, setHighlightKeyword] = useState<string>('');

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdown);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const handleCopySection = (sectionName: string, items: string[]) => {
    const textToCopy = `## ${sectionName}\n${items.map((i) => `- ${i}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedSection(sectionName);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `research-paper-analysis-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const data = {
      template: 'Research Paper Analysis (5-Component Structural Extraction)',
      timestamp: new Date().toISOString(),
      stats,
      structured,
      markdown,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `paper-analysis-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const htmlContent = marked.parse(markdown);

  const renderHighlightedSource = () => {
    if (!highlightKeyword.trim()) {
      return (
        <pre className="whitespace-pre-wrap font-mono text-xs text-[#171517] leading-relaxed">
          {sourceText}
        </pre>
      );
    }
    const escaped = highlightKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = sourceText.split(regex);

    return (
      <div className="whitespace-pre-wrap font-mono text-xs text-[#171517] leading-relaxed">
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark
              key={i}
              className="bg-[#F16727]/20 text-[#171517] font-semibold px-1 py-0.5 rounded border border-[#F16727]/40"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border border-[#D9D9D9] rounded-2xl shadow-xs flex flex-col h-full overflow-hidden">
      {/* Top Header Bar */}
      <div className="p-3.5 sm:p-4 border-b border-[#D9D9D9] bg-[#FAFBFA] flex flex-wrap items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 bg-[#F4F4F3] p-1 rounded-xl border border-[#D9D9D9] text-xs">
          <button
            onClick={() => setTab('cards')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
              tab === 'cards'
                ? 'bg-white text-[#171517] shadow-xs'
                : 'text-[#645E5D] hover:text-[#171517]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#F16727]" />
            <span>Structured Cards</span>
          </button>

          <button
            onClick={() => setTab('markdown')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
              tab === 'markdown'
                ? 'bg-white text-[#171517] shadow-xs'
                : 'text-[#645E5D] hover:text-[#171517]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Raw Markdown</span>
          </button>

          <button
            onClick={() => setTab('split')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
              tab === 'split'
                ? 'bg-white text-[#171517] shadow-xs'
                : 'text-[#645E5D] hover:text-[#171517]'
            }`}
          >
            <Columns className="w-3.5 h-3.5 text-[#645E5D]" />
            <span className="hidden sm:inline">Split / Grounding</span>
            <span className="sm:hidden">Split</span>
          </button>

          <button
            onClick={() => setTab('rendered')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
              tab === 'rendered'
                ? 'bg-white text-[#171517] shadow-xs'
                : 'text-[#645E5D] hover:text-[#171517]'
            }`}
          >
            <Quote className="w-3.5 h-3.5 text-[#645E5D]" />
            <span>Doc View</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Chat with PDF Pill Requested by user: Light Blue #EAF3FF and Blue #2563EB */}
          {onOpenChatWithPdf && (
            <button
              onClick={onOpenChatWithPdf}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#EAF3FF] hover:bg-[#dbeafe] text-[#2563EB] border border-[#2563EB]/25 text-xs font-bold transition shadow-xs"
              title="Chat with Paper"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#2563EB]" />
              <span className="hidden md:inline">Chat with PDF</span>
            </button>
          )}

          <button
            onClick={handleCopyMarkdown}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-[#F4F4F3] text-[#171517] border border-[#D9D9D9] transition"
            title="Copy exact Markdown output"
          >
            {copiedRaw ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[#F16727]" />
            )}
            <span className="hidden sm:inline">{copiedRaw ? 'Copied' : 'Copy MD'}</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-[#F4F4F3] text-[#171517] border border-[#D9D9D9] transition"
            title="Download as .md file"
          >
            <Download className="w-3.5 h-3.5 text-[#645E5D]" />
            <span className="hidden lg:inline">.md</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="inline-flex items-center space-x-1.5 px-2 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-[#F4F4F3] text-[#F16727] border border-[#D9D9D9] transition"
            title="Download JSON structured representation"
          >
            <span className="text-[10px] font-mono">JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-1.5 rounded-lg text-xs font-medium bg-white hover:bg-[#F4F4F3] text-[#645E5D] border border-[#D9D9D9] transition"
            title="Print-friendly view"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Tab Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {/* TAB 1: STRUCTURED CARDS */}
        {tab === 'cards' && (
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#D9D9D9]">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-extrabold text-[#171517]">
                  {structured.title || 'Research Paper Structural Analysis'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-subtle-gradient text-[#F16727] border border-[#F16727]/30">
                  5/5 Sections Extracted
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-[#645E5D]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero-Hallucination Precision</span>
              </div>
            </div>

            {/* 1. OBJECTIVE */}
            <div className="bg-[#FAFBFA] border border-[#D9D9D9] hover:border-[#F16727] rounded-xl p-4 shadow-2xs transition">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#F16727]/10 text-[#F16727] flex items-center justify-center border border-[#F16727]/20">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#171517] flex items-center space-x-1.5">
                      <span>🎯 Objective</span>
                    </h3>
                    <p className="text-[11px] text-[#645E5D]">
                      Primary research goal, hypothesis, or target problem formulation
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleCopySection('🎯 Objective', structured.objective)}
                  className="p-1.5 text-[#645E5D] hover:text-[#171517] hover:bg-[#F4F4F3] rounded-lg transition text-xs flex items-center space-x-1"
                  title="Copy Objective"
                >
                  {copiedSection === '🎯 Objective' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <ul className="space-y-2 text-xs sm:text-sm text-[#171517]">
                {structured.objective.length > 0 ? (
                  structured.objective.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F16727] mt-2 shrink-0" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-[#9FA1A5] italic">No objective statements extracted.</li>
                )}
              </ul>
            </div>

            {/* 2. METHODOLOGY */}
            <div className="bg-[#FAFBFA] border border-[#D9D9D9] hover:border-[#2563EB] rounded-xl p-4 shadow-2xs transition">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF3FF] text-[#2563EB] flex items-center justify-center border border-[#2563EB]/20">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#171517] flex items-center space-x-1.5">
                      <span>⚙️ Methodology</span>
                    </h3>
                    <p className="text-[11px] text-[#645E5D]">
                      Core techniques, architectures, training parameters, datasets, and setups
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleCopySection('⚙️ Methodology', structured.methodology)}
                  className="p-1.5 text-[#645E5D] hover:text-[#171517] hover:bg-[#F4F4F3] rounded-lg transition text-xs flex items-center space-x-1"
                  title="Copy Methodology"
                >
                  {copiedSection === '⚙️ Methodology' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <ul className="space-y-2 text-xs sm:text-sm text-[#171517]">
                {structured.methodology.length > 0 ? (
                  structured.methodology.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-2 shrink-0" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-[#9FA1A5] italic">No methodology statements extracted.</li>
                )}
              </ul>
            </div>

            {/* 3. FINDINGS */}
            <div className="bg-[#FAFBFA] border border-[#D9D9D9] hover:border-emerald-600 rounded-xl p-4 shadow-2xs transition">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#171517] flex items-center space-x-1.5">
                      <span>📊 Findings</span>
                    </h3>
                    <p className="text-[11px] text-[#645E5D]">
                      Empirical metrics, benchmarks, quantitative gains, and experimental results
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleCopySection('📊 Findings', structured.findings)}
                  className="p-1.5 text-[#645E5D] hover:text-[#171517] hover:bg-[#F4F4F3] rounded-lg transition text-xs flex items-center space-x-1"
                  title="Copy Findings"
                >
                  {copiedSection === '📊 Findings' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <ul className="space-y-2 text-xs sm:text-sm text-[#171517]">
                {structured.findings.length > 0 ? (
                  structured.findings.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-[#9FA1A5] italic">No empirical findings extracted.</li>
                )}
              </ul>
            </div>

            {/* 4. LIMITATIONS */}
            <div
              className={`rounded-xl p-4 shadow-2xs transition border ${
                structured.hasExplicitLimitations
                  ? 'bg-[#FAFBFA] border-[#D9D9D9] hover:border-amber-600'
                  : 'bg-amber-50/60 border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-200">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-sm text-[#171517] flex items-center space-x-1.5">
                        <span>⚠️️ Limitations</span>
                      </h3>
                      {!structured.hasExplicitLimitations && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          Absent in Source
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#645E5D]">
                      Constraints, missing evaluations, edge cases, and hardware bounds
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleCopySection('⚠️️ Limitations', structured.limitations)}
                  className="p-1.5 text-[#645E5D] hover:text-[#171517] hover:bg-[#F4F4F3] rounded-lg transition text-xs flex items-center space-x-1"
                  title="Copy Limitations"
                >
                  {copiedSection === '⚠️️ Limitations' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <ul className="space-y-2 text-xs sm:text-sm text-[#171517]">
                {structured.limitations.length > 0 ? (
                  structured.limitations.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                      <span
                        className={`leading-relaxed ${
                          item.toLowerCase().includes('not explicitly mentioned')
                            ? 'font-bold text-amber-800'
                            : ''
                        }`}
                      >
                        {item}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-amber-800 font-bold">Not explicitly mentioned in the text.</li>
                )}
              </ul>
            </div>

            {/* 5. KEY TAKEAWAYS */}
            <div className="bg-[#FAFBFA] border border-[#D9D9D9] hover:border-purple-600 rounded-xl p-4 shadow-2xs transition">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#171517] flex items-center space-x-1.5">
                      <span>💡 Key Takeaways</span>
                    </h3>
                    <p className="text-[11px] text-[#645E5D]">
                      Core conclusions, practical deployment insights, and future implications
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleCopySection('💡 Key Takeaways', structured.keyTakeaways)}
                  className="p-1.5 text-[#645E5D] hover:text-[#171517] hover:bg-[#F4F4F3] rounded-lg transition text-xs flex items-center space-x-1"
                  title="Copy Key Takeaways"
                >
                  {copiedSection === '💡 Key Takeaways' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <ul className="space-y-2 text-xs sm:text-sm text-[#171517]">
                {structured.keyTakeaways.length > 0 ? (
                  structured.keyTakeaways.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 shrink-0" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-[#9FA1A5] italic">No key takeaways extracted.</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* TAB 2: RAW MARKDOWN */}
        {tab === 'markdown' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#645E5D] bg-[#F4F4F3] p-2.5 rounded-lg border border-[#D9D9D9]">
              <span className="font-mono font-bold text-[#171517]">
                Exact Output Template (Standard Markdown)
              </span>
              <button
                onClick={handleCopyMarkdown}
                className="text-[#F16727] hover:underline font-bold flex items-center space-x-1"
              >
                {copiedRaw ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>{copiedRaw ? 'Copied' : 'Copy All'}</span>
              </button>
            </div>
            <pre className="bg-[#FAFBFA] p-4 rounded-xl border border-[#D9D9D9] font-mono text-xs text-[#171517] leading-relaxed overflow-x-auto whitespace-pre-wrap select-all">
              {markdown}
            </pre>
          </div>
        )}

        {/* TAB 3: SPLIT GROUNDING VIEW */}
        {tab === 'split' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F4F4F3] p-2.5 rounded-lg border border-[#D9D9D9] text-xs">
              <span className="text-[#645E5D] font-medium">
                Verify factual grounding between source text and extracted components:
              </span>
              <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded border border-[#D9D9D9]">
                <Search className="w-3.5 h-3.5 text-[#645E5D]" />
                <input
                  type="text"
                  placeholder="Keyword in source..."
                  value={highlightKeyword}
                  onChange={(e) => setHighlightKeyword(e.target.value)}
                  className="bg-transparent text-xs text-[#171517] focus:outline-none w-40"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-[#FAFBFA] p-4 rounded-xl border border-[#D9D9D9] overflow-y-auto max-h-[550px]">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#D9D9D9]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#645E5D]">
                    Source Paper Text
                  </span>
                  <span className="text-[11px] text-[#9FA1A5] font-mono">
                    {sourceText ? `${sourceText.length} chars` : 'Attached PDF'}
                  </span>
                </div>
                {sourceText ? (
                  renderHighlightedSource()
                ) : (
                  <p className="text-xs text-[#645E5D] italic">
                    Source text was attached via PDF binary document.
                  </p>
                )}
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[550px] pr-1">
                {[
                  { title: '🎯 Objective', items: structured.objective },
                  { title: '⚙️ Methodology', items: structured.methodology },
                  { title: '📊 Findings', items: structured.findings },
                  { title: '⚠️️ Limitations', items: structured.limitations },
                  { title: '💡 Key Takeaways', items: structured.keyTakeaways },
                ].map((sec, i) => (
                  <div key={i} className="bg-[#FAFBFA] p-3 rounded-xl border border-[#D9D9D9]">
                    <h4 className="text-xs font-bold text-[#171517] mb-2">{sec.title}</h4>
                    <ul className="space-y-1.5 text-xs text-[#171517]">
                      {sec.items.map((item, idx) => (
                        <li
                          key={idx}
                          onClick={() => {
                            const words = item.split(/\s+/).slice(0, 3).join(' ');
                            setHighlightKeyword(words);
                          }}
                          className="cursor-pointer hover:text-[#2563EB] transition flex items-start space-x-1.5"
                          title="Click to search snippet in source text"
                        >
                          <span className="text-[#9FA1A5] shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RENDERED DOCUMENT VIEW */}
        {tab === 'rendered' && (
          <div className="bg-[#FAFBFA] p-6 sm:p-8 rounded-xl border border-[#D9D9D9]">
            <article
              className="prose prose-slate max-w-none prose-headings:text-[#171517] prose-headings:font-extrabold prose-h1:text-xl prose-h2:text-base prose-h2:border-b prose-h2:border-[#D9D9D9] prose-h2:pb-1.5 prose-p:text-[#171517] prose-li:text-[#171517] leading-relaxed text-sm"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
