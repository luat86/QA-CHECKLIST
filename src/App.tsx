import React, { useState, useEffect, useRef, memo } from 'react';
import { 
  Send, Bot, User, Loader2, Globe, Menu, X, Plus, Trash2, 
  AlertCircle, Paperclip, FileText, Check, ChevronRight, 
  Image as ImageIcon, FileType, Search, BookOpen, Printer, 
  Download, LayoutPanelLeft, Settings, Info, Camera
} from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { GoogleGenAI } from '@google/genai';
import { QRCodeSVG } from 'qrcode.react';

// --- Configuration ---
const MODEL_NAME = "gemini-3-flash-preview";

const CONSTRUCTION_DATA = {
  materials: ["Bê tông", "Cốt thép", "Xi măng", "Cát", "Đá", "Gạch", "Vữa", "Gạch ốp lát", "Sơn", "Kính", "Ống nhựa"],
  tasks: ["Trắc đạc", "Đào đất", "Cốt thép", "Ván khuôn", "Đổ bê tông", "Xây tường", "Trát tường", "Lát nền", "Sơn bả", "Điện nước"]
};

const generateId = () => Math.random().toString(36).substring(2, 11);
const formatDate = (ts: number) => new Date(ts).toLocaleDateString('vi-VN');

// --- A4 Components ---
const A4Page = memo(({ content, title, pageRef, docId }: { content: string, title: string, pageRef: any, docId: string }) => {
  return (
    <div ref={pageRef} className="a4-container mx-auto bg-white shadow-xl border border-gray-300 relative mb-4 animate-in fade-in duration-200 origin-top overflow-hidden">
      {/* Header gọn nhẹ */}
      <div className="p-[10mm] pb-0">
        <div className="flex justify-between items-end border-b-2 border-black pb-1 mb-3">
          <div className="flex items-center gap-2">
            <div className="font-black text-xl tracking-tighter border-2 border-black px-1 leading-none">QC</div>
            <div className="leading-none">
              <h1 className="text-[10px] font-bold uppercase">Hệ thống quản lý chất lượng</h1>
              <p className="text-[7px] text-gray-500 uppercase tracking-tighter">ISO 9001:2015 Standard Document</p>
            </div>
          </div>
          <div className="flex items-end gap-3 text-[8px] font-mono text-right leading-tight">
            <div className="flex flex-col justify-end">
              <p>REF: QAQC-{docId.substring(0, 6).toUpperCase()}</p>
              <p>DATE: {formatDate(Date.now())}</p>
            </div>
            <div className="p-0.5 border border-black bg-white">
              <QRCodeSVG value={`QAQC-DOC-${docId}`} size={32} level="L" />
            </div>
          </div>
        </div>

        {/* Nội dung chính */}
        <article className="text-black font-serif text-[10pt] leading-tight">
          <h2 className="text-sm font-bold text-center uppercase mb-3 tracking-normal border-b border-gray-100 pb-1">
            {title}
          </h2>
          <div className="content-area">
             <FormattedContent content={content} />
          </div>
        </article>
      </div>

      {/* Footer nhỏ gọn */}
      <div className="absolute bottom-0 left-0 right-0 p-[10mm] pt-0">
        <div className="border-t border-gray-200 pt-1 flex justify-between text-[7px] text-gray-400 font-sans uppercase">
          <span>Tài liệu kỹ thuật / Lưu hành nội bộ</span>
          <span>Trang 1/1</span>
        </div>
      </div>
    </div>
  );
});

const FormattedContent = ({ content }: { content: string }) => {
  const clean = (text: string) => text.replace(/[*_#]/g, '').trim();
  const lines = content.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.startsWith('|')) {
      const tableRows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableRows.push(lines[i].trim());
        i++;
      }
      if (tableRows.length > 2) {
        const headers = tableRows[0].split('|').filter(c => c.trim() !== '').map(clean);
        const dataRows = tableRows.slice(2).map(row => 
          row.split('|').filter(c => c.trim() !== '').map(clean)
        );
        elements.push(
          <div key={`table-${i}`} className="my-2 border border-black overflow-hidden">
            <table className="w-full border-collapse text-[9pt]">
              <thead>
                <tr className="bg-gray-100">
                  {headers.map((h, idx) => (
                    <th key={idx} className="p-1 text-left font-bold border border-black uppercase text-[8pt] tracking-tighter">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-1 border border-black align-top leading-[1.1] font-sans">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(<h3 key={i} className="text-[10pt] font-bold mt-3 mb-1 uppercase bg-gray-50 px-1 border-l-2 border-black">{clean(line)}</h3>);
    } else if (line.startsWith('### ')) {
      elements.push(<h4 key={i} className="text-[9.5pt] font-bold mt-2 mb-0.5 italic underline">{clean(line)}</h4>);
    } else if (line.startsWith('- [ ]') || line.startsWith('- [x]')) {
      const checked = line.includes('[x]');
      elements.push(
        <div key={i} className="flex items-start gap-1.5 my-0.5 pl-1">
          <div className={`mt-0.5 w-2.5 h-2.5 rounded-sm border border-black flex-shrink-0 flex items-center justify-center ${checked ? 'bg-black text-white' : ''}`}>
            {checked && <Check size={8} strokeWidth={4} />}
          </div>
          <span className="text-[9.5pt] font-sans leading-none">{clean(line.replace(/- \[[ xX]\] /, ''))}</span>
        </div>
      );
    } else if (line.startsWith('* ') || line.startsWith('- ')) {
      elements.push(
        <div key={i} className="flex items-start gap-1.5 my-0 pl-2">
          <div className="mt-1.5 w-1 h-1 bg-black rounded-full flex-shrink-0" />
          <span className="text-[9.5pt] font-sans leading-tight">{clean(line.replace(/^[\*\-]\s/, ''))}</span>
        </div>
      );
    } else if (line.length > 0) {
      elements.push(<p key={i} className="text-[9.5pt] mb-1.5 text-justify leading-[1.2] font-sans">{clean(line)}</p>);
    }
    i++;
  }
  return elements;
};

export default function App() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCatalogOpen, setIsCatalogOpen] = useState(true);
  
  // Refs cho việc xuất ảnh
  const pageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const saved = localStorage.getItem('qc_final_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      if (parsed.length > 0) setCurrentId(parsed[0].id);
    } else { handleNewSession(); }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) localStorage.setItem('qc_final_v1', JSON.stringify(sessions));
  }, [sessions]);

  const handleNewSession = () => {
    const id = generateId();
    const newSession = { id, title: 'HỒ SƠ MỚI', messages: [], updatedAt: Date.now() };
    setSessions(prev => [newSession, ...prev]);
    setCurrentId(id);
  };

  const exportImage = async (msgId: string) => {
    const element = pageRefs.current[msgId];
    if (!element) return;

    try {
      setIsLoading(true);
      const dataUrl = await htmlToImage.toPng(element, { quality: 1, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `QC-Report-${msgId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export error", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSend = async (msg?: string) => {
    const text = msg || input;
    if (!text.trim() || isLoading) return;

    const userMsg = { id: generateId(), role: 'user', content: text };
    const session = sessions.find(s => s.id === currentId);
    if (!session) return;
    
    const updatedMessages = [...session.messages, userMsg];

    setInput('');
    setIsLoading(true);
    setSessions(prev => prev.map(s => s.id === currentId ? { ...s, messages: updatedMessages, title: session.messages.length === 0 ? text.toUpperCase() : s.title } : s));

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: updatedMessages.map(m => ({
          role: m.role === 'model' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: "Bạn là kỹ sư QA/QC chuyên nghiệp. Lập hồ sơ kỹ thuật cô đọng nhất. Chỉ xuất bảng và checklist. KHÔNG chào hỏi."
        }
      });

      const botText = response.text || "Lỗi.";
      const botMsg = { id: generateId(), role: 'model', content: botText };
      setSessions(prev => prev.map(s => s.id === currentId ? { ...s, messages: [...updatedMessages, botMsg] } : s));
    } catch (err) { 
      console.error(err); 
      const botMsg = { id: generateId(), role: 'model', content: "Đã xảy ra lỗi khi tạo hồ sơ." };
      setSessions(prev => prev.map(s => s.id === currentId ? { ...s, messages: [...updatedMessages, botMsg] } : s));
    } finally { 
      setIsLoading(false); 
    }
  };

  const currentSession = sessions.find(s => s.id === currentId);

  return (
    <div className="flex h-screen bg-slate-200 text-slate-900 font-sans overflow-hidden">
      
      {/* Sidebar Lịch sử - Ẩn khi in */}
      <aside className={`no-print w-60 bg-white border-r border-slate-300 transition-all ${isSidebarOpen ? 'ml-0' : '-ml-60'}`}>
        <div className="h-full flex flex-col p-3">
          <button onClick={handleNewSession} className="w-full mb-4 flex items-center justify-center gap-2 p-2 bg-slate-900 text-white rounded font-bold text-xs uppercase tracking-tighter shadow-md">
            <Plus size={14} /> Tạo hồ sơ mới
          </button>
          <div className="flex-1 overflow-y-auto space-y-1">
            {sessions.map(s => (
              <button key={s.id} onClick={() => setCurrentId(s.id)} className={`w-full text-left p-2 rounded text-[10px] font-bold border transition-all ${s.id === currentId ? 'bg-indigo-600 text-white border-indigo-600' : 'text-slate-500 border-transparent hover:bg-slate-50'}`}>
                <div className="truncate uppercase">{s.title}</div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Vùng Canvas A4 */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="no-print h-12 bg-white/90 border-b flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><LayoutPanelLeft size={18} /></button>
            <h2 className="text-[10px] font-black uppercase text-slate-400">{currentSession?.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1 px-3 py-1 bg-slate-900 text-white rounded text-[10px] font-bold hover:bg-black transition-all">
              <Printer size={12} /> IN (PDF)
            </button>
            <button onClick={() => setIsCatalogOpen(!isCatalogOpen)} className={`p-1.5 rounded transition-all ${isCatalogOpen ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500'}`}>
              <BookOpen size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-300/50 print:p-0 print:bg-white">
          <div className="max-w-[210mm] mx-auto pb-32 print:pb-0">
            {currentSession?.messages.map((m: any, idx: number) => (
              m.role === 'model' ? (
                <div key={m.id} className="relative group">
                  <A4Page 
                    pageRef={(el: HTMLDivElement | null) => { pageRefs.current[m.id] = el; }}
                    content={m.content} 
                    title={currentSession.title} 
                    docId={m.id}
                  />
                  {/* Floating Action Menu cho từng trang */}
                  <div className="no-print absolute top-2 right-[-50px] flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => exportImage(m.id)}
                      className="p-2 bg-white border border-slate-300 rounded-full shadow-lg hover:bg-indigo-50 text-indigo-600"
                      title="Xuất ảnh PNG"
                    >
                      <Camera size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <div key={m.id} className="no-print flex justify-end mb-4 pr-4">
                   <div className="bg-white border border-slate-300 text-slate-800 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter">
                    {m.content}
                  </div>
                </div>
              )
            ))}
            {isLoading && (
               <div className="no-print a4-container mx-auto bg-white/50 h-64 flex flex-col items-center justify-center border border-dashed border-slate-400">
                 <Loader2 className="animate-spin text-slate-500 mb-2" size={24} />
                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.5em]">Đang xử lý hồ sơ...</span>
               </div>
            )}
          </div>
        </div>

        {/* Ô nhập liệu - Ẩn khi in */}
        <div className="no-print absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-lg px-4">
          <div className="bg-white border-2 border-slate-900 rounded-lg p-1 flex items-center shadow-2xl">
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Yêu cầu lập checklist..." 
              className="flex-1 border-none focus:ring-0 text-xs font-bold px-3 py-2 outline-none"
            />
            <button onClick={() => handleSend()} className="bg-slate-900 text-white p-2 rounded hover:bg-black">
              <Send size={16} />
            </button>
          </div>
        </div>
      </main>

      {/* Sidebar Thư viện - Ẩn khi in */}
      <aside className={`no-print w-60 bg-white border-l border-slate-300 transition-all ${isCatalogOpen ? 'mr-0' : '-mr-60'}`}>
        <div className="h-full flex flex-col p-4 overflow-y-auto space-y-4">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-1">Thư viện QC</h3>
           <div className="space-y-4">
              <div>
                <p className="text-[9px] font-black text-indigo-600 uppercase mb-2">Vật liệu</p>
                <div className="grid grid-cols-1 gap-1">
                  {CONSTRUCTION_DATA.materials.map(m => (
                    <button key={m} onClick={() => handleSend(`Lập checklist kiểm tra vật liệu ${m}`)} className="text-left px-2 py-1.5 rounded border border-slate-100 hover:bg-indigo-50 text-[9pt] font-medium text-slate-600 truncate transition-all uppercase">
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[9px] font-black text-emerald-600 uppercase mb-2">Công tác thi công</p>
                <div className="grid grid-cols-1 gap-1">
                  {CONSTRUCTION_DATA.tasks.map(t => (
                    <button key={t} onClick={() => handleSend(`Lập quy trình nghiệm thu công tác ${t}`)} className="text-left px-2 py-1.5 rounded border border-slate-100 hover:bg-emerald-50 text-[9pt] font-medium text-slate-600 truncate transition-all uppercase">
                      {t}
                    </button>
                  ))}
                </div>
              </div>
           </div>
        </div>
      </aside>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        
        .a4-container {
          width: 210mm;
          min-height: 297mm;
          padding: 0;
          font-family: 'Times New Roman', Times, serif;
          box-sizing: border-box;
          background: white;
        }

        .a4-container * { font-family: inherit; }
        .font-sans { font-family: 'Inter', sans-serif !important; }
        .font-mono { font-family: monospace !important; }

        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          .no-print {
            display: none !important;
          }
          .a4-container {
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            width: 210mm;
            height: 297mm;
            page-break-after: always;
          }
          main {
            background: white !important;
            padding: 0 !important;
          }
          .flex-1 {
            overflow: visible !important;
          }
        }
      `}</style>
    </div>
  );
}
