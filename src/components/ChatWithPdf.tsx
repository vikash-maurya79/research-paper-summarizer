import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  HelpCircle,
  X,
  FileText,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatWithPdfProps {
  paperId: string;
  paperTitle: string;
  rawText: string;
  pdfBase64?: string;
  chatHistory: ChatMessage[];
  onAddMessage: (msg: ChatMessage) => void;
  onClose?: () => void;
}

const SUGGESTED_QUESTIONS = [
  'What are the core technical baselines compared against?',
  'Explain the main mathematical equation or formula.',
  'What specific datasets and compute hardware were used?',
  'What are the most critical unaddressed edge cases?',
];

export const ChatWithPdf: React.FC<ChatWithPdfProps> = ({
  paperId,
  paperTitle,
  rawText,
  pdfBase64,
  chatHistory,
  onAddMessage,
  onClose,
}) => {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (queryText?: string) => {
    const questionToSend = queryText || input.trim();
    if (!questionToSend || isSending) return;

    setInput('');
    setError(null);

    const userMsg: ChatMessage = {
      role: 'user',
      content: questionToSend,
      timestamp: new Date().toISOString(),
    };
    onAddMessage(userMsg);
    setIsSending(true);

    try {
      const response = await fetch(`/api/papers/${paperId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionToSend,
          pdfBase64,
          rawText,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer from research assistant');
      }

      const data = await response.json();
      const botMsg: ChatMessage = {
        role: 'model',
        content: data.answer || 'No response generated.',
        timestamp: new Date().toISOString(),
      };
      onAddMessage(botMsg);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error communicating with assistant');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-[#EAF3FF] border border-[#2563EB]/25 rounded-2xl p-4 sm:p-5 flex flex-col h-full shadow-xs">
      {/* Header with pill styling */}
      <div className="flex items-center justify-between pb-3 border-b border-[#2563EB]/15 mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-xs">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-sm text-[#171517]">Chat with Paper / PDF</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#2563EB] border border-[#2563EB]/20">
                Ground Truth
              </span>
            </div>
            <p className="text-xs text-[#645E5D] truncate max-w-sm">
              Answering queries strictly based on: {paperTitle || 'Current paper'}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#645E5D] hover:text-[#171517] hover:bg-white/60 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[220px] max-h-[380px]">
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#2563EB] mb-2 shadow-xs border border-[#2563EB]/20">
              <Lightbulb className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-[#171517]">Ask anything about this research</p>
            <p className="text-[11px] text-[#645E5D] max-w-xs mt-1">
              Verify formulas, clarify datasets, or inquire about methodology details directly from the text.
            </p>

            {/* Quick Suggestions */}
            <div className="mt-3 flex flex-wrap justify-center gap-1.5 max-w-md">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="px-2.5 py-1 text-left rounded-lg bg-white hover:bg-[#dbeafe] text-[#2563EB] border border-[#2563EB]/20 text-[11px] font-medium transition"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          chatHistory.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start space-x-2 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'model' && (
                <div className="w-6 h-6 rounded-md bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 text-xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#2563EB] text-white shadow-xs rounded-tr-none'
                    : 'bg-white text-[#171517] border border-[#D9D9D9] shadow-xs rounded-tl-none font-sans'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>

              {msg.role === 'user' && (
                <div className="w-6 h-6 rounded-md bg-[#F16727] text-white flex items-center justify-center shrink-0 mt-0.5 text-xs">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))
        )}

        {isSending && (
          <div className="flex items-center space-x-2 text-xs text-[#2563EB] bg-white/70 p-2.5 rounded-xl border border-[#2563EB]/20 w-fit">
            <div className="w-3.5 h-3.5 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
            <span className="font-semibold">Reviewing paper contents...</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 p-2 rounded-lg bg-red-100 border border-red-300 text-red-700 text-xs flex items-center space-x-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input row */}
      <div className="mt-3 pt-2.5 border-t border-[#2563EB]/15 flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question about this paper..."
          className="flex-1 bg-white border border-[#D9D9D9] focus:border-[#2563EB] rounded-xl px-3.5 py-2 text-xs text-[#171517] placeholder-[#9FA1A5] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
        />

        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isSending}
          className={`p-2 rounded-xl text-white transition shadow-xs ${
            !input.trim() || isSending
              ? 'bg-[#9FA1A5] cursor-not-allowed'
              : 'bg-[#2563EB] hover:bg-blue-700 active:scale-95'
          }`}
          title="Send query"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
