import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import mongoose from 'mongoose';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '35mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// ==========================================
// MERN STACK: Mongoose Schema & Database Layer
// ==========================================
interface IChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

interface IStructuredAnalysis {
  objective: string[];
  methodology: string[];
  findings: string[];
  limitations: string[];
  keyTakeaways: string[];
  hasExplicitLimitations: boolean;
  title?: string;
}

interface IAnalysisStats {
  wordCount: number;
  charCount: number;
  sectionsExtracted: number;
  hasExplicitLimitations: boolean;
}

interface IPaper {
  id?: string;
  _id?: string;
  paperTitle: string;
  rawText: string;
  markdown: string;
  structured: IStructuredAnalysis;
  stats: IAnalysisStats;
  fileName?: string;
  chatHistory: IChatMessage[];
  createdAt: Date;
}

const paperSchema = new mongoose.Schema({
  paperTitle: { type: String, required: true },
  rawText: { type: String, default: '' },
  markdown: { type: String, required: true },
  structured: {
    objective: [String],
    methodology: [String],
    findings: [String],
    limitations: [String],
    keyTakeaways: [String],
    hasExplicitLimitations: { type: Boolean, default: true },
    title: String,
  },
  stats: {
    wordCount: Number,
    charCount: Number,
    sectionsExtracted: { type: Number, default: 5 },
    hasExplicitLimitations: Boolean,
  },
  fileName: String,
  chatHistory: [
    {
      role: { type: String, enum: ['user', 'model'] },
      content: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

// In-Memory Fallback store if external MongoDB is not connected
class MemoryDB {
  private papers: Map<string, IPaper> = new Map();

  async create(data: Partial<IPaper>): Promise<IPaper> {
    const id = (new mongoose.Types.ObjectId()).toString();
    const doc: IPaper = {
      _id: id,
      id,
      paperTitle: data.paperTitle || 'Untitled Paper',
      rawText: data.rawText || '',
      markdown: data.markdown || '',
      structured: data.structured || {
        objective: [],
        methodology: [],
        findings: [],
        limitations: [],
        keyTakeaways: [],
        hasExplicitLimitations: true,
      },
      stats: data.stats || { wordCount: 0, charCount: 0, sectionsExtracted: 5, hasExplicitLimitations: true },
      fileName: data.fileName,
      chatHistory: data.chatHistory || [],
      createdAt: new Date(),
    };
    this.papers.set(id, doc);
    return doc;
  }

  async find(): Promise<IPaper[]> {
    return Array.from(this.papers.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async findById(id: string): Promise<IPaper | null> {
    return this.papers.get(id) || null;
  }

  async findByIdAndUpdate(id: string, update: Partial<IPaper>): Promise<IPaper | null> {
    const doc = this.papers.get(id);
    if (!doc) return null;
    const updated = { ...doc, ...update };
    this.papers.set(id, updated);
    return updated;
  }

  async findByIdAndDelete(id: string): Promise<boolean> {
    return this.papers.delete(id);
  }
}

const memoryDb = new MemoryDB();
let PaperModel: any = null;
let isMongoConnected = false;

// Attempt MongoDB Connection if MONGODB_URI exists
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('Connected successfully to MongoDB Atlas');
      PaperModel = mongoose.model('Paper', paperSchema);
      isMongoConnected = true;
    })
    .catch((err) => {
      console.warn('MongoDB connection failed, using in-memory store:', err.message);
    });
}

function parseSectionsFromMarkdown(markdown: string): IStructuredAnalysis {
  const result: IStructuredAnalysis = {
    objective: [],
    methodology: [],
    findings: [],
    limitations: [],
    keyTakeaways: [],
    hasExplicitLimitations: true,
  };

  const lines = markdown.split('\n');
  let currentSection: keyof Omit<IStructuredAnalysis, 'title' | 'hasExplicitLimitations'> | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      result.title = trimmed.replace('# ', '').trim();
      continue;
    }

    if (trimmed.includes('Objective')) {
      currentSection = 'objective';
      continue;
    } else if (trimmed.includes('Methodology')) {
      currentSection = 'methodology';
      continue;
    } else if (trimmed.includes('Findings')) {
      currentSection = 'findings';
      continue;
    } else if (trimmed.includes('Limitations')) {
      currentSection = 'limitations';
      continue;
    } else if (trimmed.includes('Key Takeaways')) {
      currentSection = 'keyTakeaways';
      continue;
    } else if (trimmed.startsWith('## ')) {
      currentSection = null;
      continue;
    }

    if (currentSection && trimmed.length > 0) {
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const item = trimmed.substring(2).trim();
        if (item) {
          result[currentSection].push(item);
        }
      } else if (!trimmed.startsWith('#')) {
        result[currentSection].push(trimmed);
      }
    }
  }

  const limStr = result.limitations.join(' ').toLowerCase();
  if (limStr.includes('not explicitly mentioned in the text') || result.limitations.length === 0) {
    result.hasExplicitLimitations = false;
  }

  return result;
}

const SYSTEM_INSTRUCTION = `You are an expert academic paper analyzer. Your task is to extract structural components from research text accurately and concisely.

Analyze the provided research text and extract the following 5 components:
1. Objective
2. Methodology
3. Findings
4. Limitations
5. Key Takeaways

Formatting Constraints:
- Use clean Markdown with headers.
- Do NOT invent or infer facts not present in the input text.
- If a section (such as Limitations) is absent in the text, write: "Not explicitly mentioned in the text."
- Keep descriptions clear, objective, and dense with key technical details.

Output Template:

# Research Paper Analysis

## 🎯 Objective
- [State the primary research goal, hypothesis, or problem being solved]

## ⚙️ Methodology
- [List the core techniques, models, datasets, or experimental setups used]

## 📊 Findings
- [List the primary empirical results, metrics, or key discoveries]

## ⚠️️ Limitations
- [List constraints, missing evaluations, or edge cases]

## 💡 Key Takeaways
- [List 2-3 main takeaways and practical implications]`;

async function generateContentWithRetry(params: any, retries = 2): Promise<any> {
  const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          ...params,
          model,
        });
        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} attempt ${attempt + 1} failed:`, err?.message || err);
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
        }
      }
    }
  }

  throw lastError || new Error('Service temporarily unavailable. Please retry.');
}

// ==========================================
// REST API ROUTES
// ==========================================

// 1. Analyze Paper & Persist to Database (MongoDB/Memory)
app.post('/api/analyze', async (req, res) => {
  try {
    const { text, pdfBase64, mimeType, fileName } = req.body;

    if (!text && !pdfBase64) {
      return res.status(400).json({ error: 'Please provide research paper text or an uploaded document.' });
    }

    const contents: any[] = [];

    if (pdfBase64) {
      contents.push({
        inlineData: {
          mimeType: mimeType || 'application/pdf',
          data: pdfBase64,
        },
      });
      if (text && text.trim().length > 0) {
        contents.push({
          text: `Additional research context / excerpt:\n${text}\n\nPlease analyze this research paper according to instructions.`,
        });
      } else {
        contents.push({
          text: 'Please analyze this research paper according to the instructions and extract the 5 structural components.',
        });
      }
    } else {
      contents.push({
        text: `Here is the research paper text to analyze:\n\n"""\n${text}\n"""\n\nPlease extract the 5 structural components strictly adhering to the formatting constraints and output template.`,
      });
    }

    const response = await generateContentWithRetry({
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1,
      },
    });

    const markdownOutput = response.text || '';
    const structured = parseSectionsFromMarkdown(markdownOutput);

    const wordCount = text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
    const charCount = text ? text.length : 0;

    let paperTitle = fileName ? fileName.replace(/\.[^/.]+$/, '') : structured.title || 'Research Paper';
    if (!fileName && text) {
      const firstLine = text.trim().split('\n')[0].replace(/^[#*-]\s*/, '').trim();
      if (firstLine.length > 5 && firstLine.length < 90) {
        paperTitle = firstLine;
      }
    }

    const paperData = {
      paperTitle,
      rawText: text || '',
      markdown: markdownOutput,
      structured,
      stats: {
        wordCount,
        charCount,
        sectionsExtracted: 5,
        hasExplicitLimitations: structured.hasExplicitLimitations,
      },
      fileName,
      chatHistory: [],
    };

    // Save to Mongoose or Memory DB
    let savedPaper: any;
    if (isMongoConnected && PaperModel) {
      savedPaper = await PaperModel.create(paperData);
    } else {
      savedPaper = await memoryDb.create(paperData);
    }

    return res.json({
      id: savedPaper._id || savedPaper.id,
      paperTitle: savedPaper.paperTitle,
      markdown: markdownOutput,
      structured,
      stats: paperData.stats,
      createdAt: savedPaper.createdAt,
      database: isMongoConnected ? 'mongodb' : 'in-memory',
    });
  } catch (error: any) {
    console.error('Error during paper analysis:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred during paper analysis. Please try again.',
    });
  }
});

// 2. Chat with PDF / Research Paper
app.post('/api/papers/:id/chat', async (req, res) => {
  try {
    const { id } = req.params;
    const { question, pdfBase64, rawText } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    // Retrieve paper from DB
    let paper: any = null;
    if (isMongoConnected && PaperModel) {
      paper = await PaperModel.findById(id);
    } else {
      paper = await memoryDb.findById(id);
    }

    const contextText = paper ? paper.rawText : rawText || '';
    const paperMarkdown = paper ? paper.markdown : '';

    const contents: any[] = [];

    if (pdfBase64) {
      contents.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: pdfBase64,
        },
      });
    }

    contents.push({
      text: `You are an expert academic research assistant. The user is asking a question about this research paper.
Paper Context:
"""
${contextText.slice(0, 10000)}
"""

Structural Analysis Already Extracted:
"""
${paperMarkdown}
"""

User Question:
"${question}"

Answer concisely, accurately, and objectively based strictly on the paper contents. If not mentioned in the paper, explicitly state that it is not covered.`,
    });

    const response = await generateContentWithRetry({
      contents,
      config: {
        temperature: 0.2,
      },
    });

    const answer = response.text || 'Unable to generate an answer at this time.';

    // Append to chat history
    if (paper) {
      const updatedChat = [
        ...(paper.chatHistory || []),
        { role: 'user', content: question, timestamp: new Date() },
        { role: 'model', content: answer, timestamp: new Date() },
      ];

      if (isMongoConnected && PaperModel) {
        await PaperModel.findByIdAndUpdate(id, { chatHistory: updatedChat });
      } else {
        await memoryDb.findByIdAndUpdate(id, { chatHistory: updatedChat });
      }
    }

    return res.json({ answer });
  } catch (error: any) {
    console.error('Error in paper chat:', error);
    return res.status(500).json({ error: error.message || 'Failed to chat with paper' });
  }
});

// 3. List All Saved Papers (MERN endpoint)
app.get('/api/papers', async (_req, res) => {
  try {
    let papers: any[] = [];
    if (isMongoConnected && PaperModel) {
      papers = await PaperModel.find().sort({ createdAt: -1 });
    } else {
      papers = await memoryDb.find();
    }
    return res.json(papers);
  } catch (error: any) {
    console.error('Error fetching papers:', error);
    return res.status(500).json({ error: 'Failed to fetch papers' });
  }
});

// 4. Delete Paper by ID
app.delete('/api/papers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected && PaperModel) {
      await PaperModel.findByIdAndDelete(id);
    } else {
      await memoryDb.findByIdAndDelete(id);
    }
    return res.json({ success: true, message: 'Paper deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete paper' });
  }
});

// Start Express + Vite Server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`ScholarExtract MERN Server running on port ${PORT}`);
  });
}

startServer();
