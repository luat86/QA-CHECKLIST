import React, { useState, useEffect, useRef, memo } from 'react';
import { 
  Send, Bot, User, Loader2, Globe, Menu, X, Plus, Trash2, 
  AlertCircle, Paperclip, FileText, Check, ChevronRight, 
  Image as ImageIcon, FileType, Search, BookOpen, Printer, 
  Download, LayoutPanelLeft, Settings, Info, Camera, Edit2, Stamp
} from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { QRCodeSVG } from 'qrcode.react';

// --- Configuration ---
const CONSTRUCTION_DATA = {
  materials: ["Bê tông", "Cốt thép", "Xi măng", "Cát", "Đá", "Gạch", "Vữa", "Gạch ốp lát", "Sơn", "Kính", "Ống nhựa"],
  tasks: ["Trắc đạc", "Đào đất", "Cốt thép", "Ván khuôn", "Đổ bê tông", "Xây tường", "Trát tường", "Lát nền", "Sơn bả", "Điện nước"]
};

const generateId = () => Math.random().toString(36).substring(2, 11);
const formatDate = (ts: number) => new Date(ts).toLocaleDateString('vi-VN');

// --- A4 Components ---
const A4Page = memo(({ content, title, pageRef, docId, stamp, projectName, projectCategory }: { content: string, title: string, pageRef: any, docId: string, stamp?: string, projectName: string, projectCategory: string }) => {
  const formTitle = title.includes('NGHIỆM THU') ? 'BIÊN BẢN NGHIỆM THU CÔNG TÁC' : 
                    title.includes('VẬT LIỆU') ? 'PHIẾU KIỂM TRA VẬT LIỆU ĐẦU VÀO' : 
                    'PHIẾU KIỂM TRA CHẤT LƯỢNG (CHECKLIST)';

  return (
    <div ref={pageRef} className="a4-container mx-auto bg-white shadow-xl border border-gray-300 relative mb-4 animate-in fade-in duration-200 origin-top bg-white">
      <table className="w-full h-full m-0 p-0 border-none bg-white">
        <thead className="table-header-group">
          <tr>
            <td className="p-[15mm] pb-0 border-none bg-white">
              {/* Khung tiêu đề ISO */}
              <table className="w-full border-collapse border-[1.5px] border-black mb-5 font-serif bg-white">
                <tbody>
                  <tr>
                    <td rowSpan={3} className="border-[1.5px] border-black w-[22%] text-center align-middle py-3 px-1">
                      <div className="flex flex-col items-center justify-center">
                        <div className="font-black text-3xl tracking-tighter leading-none mb-1">QC</div>
                        <div className="text-[8px] font-sans font-bold uppercase tracking-widest text-gray-800 leading-tight mb-2">ISO 9001:2015</div>
                        <QRCodeSVG value={`QAQC-DOC-${docId}`} size={30} level="L" />
                      </div>
                    </td>
                    <td rowSpan={3} className="border-[1.5px] border-black w-[53%] text-center align-middle p-3">
                      <h1 className="text-[15pt] font-bold uppercase leading-snug">{formTitle}</h1>
                    </td>
                    <td className="border-[1.5px] border-black w-[25%] p-1.5 px-2 text-[8pt] font-bold">
                      Mã số: QAQC-{docId.substring(0, 5).toUpperCase()}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-[1.5px] border-black p-1.5 px-2 text-[8pt]">
                      Lần ban hành: 01
                    </td>
                  </tr>
                  <tr>
                    <td className="border-[1.5px] border-black p-1.5 px-2 text-[8pt]">
                      Ngày BH: {formatDate(Date.now())}
                    </td>
                  </tr>
                </tbody>
              </table>

              <article className="text-black font-serif text-[10pt] leading-tight relative bg-white">
                <div className="mb-6">
                  {/* Bảng thông tin Dự Án */}
                  <table className="w-full text-[10pt] font-bold text-left mb-4 border-none">
                    <tbody>
                      <tr>
                        <td className="w-[15%] py-1.5 uppercase align-bottom border-none">DỰ ÁN:</td>
                        <td className="w-[85%] py-1.5 border-b-[1.5px] border-dotted border-slate-400 align-bottom uppercase">{projectName || <>&nbsp;</>}</td>
                      </tr>
                      <tr>
                        <td className="w-[15%] py-1.5 uppercase align-bottom border-none">HẠNG MỤC:</td>
                        <td className="w-[85%] py-1.5 border-b-[1.5px] border-dotted border-slate-400 align-bottom uppercase">{projectCategory || <>&nbsp;</>}</td>
                      </tr>
                      <tr>
                        <td className="w-[15%] py-1.5 uppercase align-bottom border-none">CÔNG TÁC:</td>
                        <td className="w-[85%] py-1.5 border-b-[1.5px] border-dotted border-slate-400 align-bottom uppercase">{title || <>&nbsp;</>}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </article>
            </td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-[15mm] border-none bg-white font-serif align-top relative">
              <article className="text-black font-serif text-[10pt] leading-tight relative bg-white">
                <div className="content-area">
                  <FormattedContent content={content} />
                </div>

                {/* Stamp Overlay */}
                {stamp && (
                  <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none select-none opacity-90">
                    <div className={`border-4 rounded-xl px-8 py-3 font-black text-2xl tracking-[0.25em] uppercase rotate-[-15deg] shadow-md flex flex-col items-center justify-center ${
                      stamp === 'APPROVED' 
                        ? 'border-emerald-600 text-emerald-600 bg-emerald-50/10' 
                        : 'border-blue-600 text-blue-600 bg-blue-50/10'
                    }`}>
                      <span>{stamp === 'APPROVED' ? 'ĐÃ PHÊ DUYỆT' : 'ĐÃ KIỂM TRA'}</span>
                      <span className="text-[8px] font-mono font-bold mt-0.5 tracking-wider opacity-90">
                        QA/QC DEPT • {formatDate(Date.now())}
                      </span>
                    </div>
                  </div>
                )}
              </article>
            </td>
          </tr>
        </tbody>
        <tfoot className="table-footer-group">
          <tr>
            <td className="p-[10mm] pt-2 border-none bg-white align-bottom">
              <div className="border-t border-gray-200 pt-1 flex justify-between text-[7px] text-gray-400 font-sans uppercase">
                <span>Tài liệu kỹ thuật / Lưu hành nội bộ</span>
                <span className="page-number">Tiêu chuẩn ISO 9001:2015 - </span>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
});

const FormattedContent = ({ content }: { content: string }) => {
  const clean = (text: string) => text.replace(/[*_#]/g, '').trim();
  const parseRow = (rowStr: string) => {
    const cols = rowStr.split('|');
    if (cols.length > 0 && cols[0].trim() === '') cols.shift();
    if (cols.length > 0 && cols[cols.length - 1].trim() === '') cols.pop();
    return cols.map(clean);
  };

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
      if (tableRows.length > 1) {
        const headers = parseRow(tableRows[0]);
        const hasSeparator = tableRows[1] && tableRows[1].replace(/[-|:\s]/g, '') === '';
        const dataStartIndex = hasSeparator ? 2 : 1;
        const dataRows = tableRows.slice(dataStartIndex).map(parseRow);
        
        elements.push(
          <div key={`table-${i}`} className="mt-4 mb-6 w-full">
            <table className="w-full border-collapse border border-black text-[9pt]">
              <thead>
                <tr className="bg-gray-100">
                  {headers.map((h, idx) => (
                    <th key={idx} className="p-1.5 text-left font-bold border border-black uppercase text-[8pt] tracking-tighter">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-1.5 border border-black align-top leading-[1.2] font-sans">
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
      elements.push(<h3 key={i} className="text-[10pt] font-bold mt-5 mb-2 uppercase bg-gray-50 px-1 border-l-2 border-black">{clean(line)}</h3>);
    } else if (line.startsWith('### ')) {
      elements.push(<h4 key={i} className="text-[9.5pt] font-bold mt-4 mb-1 italic underline">{clean(line)}</h4>);
    } else if (line.startsWith('- [ ]') || line.startsWith('- [x]')) {
      const checked = line.includes('[x]');
      elements.push(
        <div key={i} className="flex items-start gap-1.5 my-1 pl-1">
          <div className={`mt-0.5 w-2.5 h-2.5 rounded-sm border border-black flex-shrink-0 flex items-center justify-center ${checked ? 'bg-black text-white' : ''}`}>
            {checked && <Check size={8} strokeWidth={4} />}
          </div>
          <span className="text-[9.5pt] font-sans leading-none">{clean(line.replace(/- \[[ xX]\] /, ''))}</span>
        </div>
      );
    } else if (line.startsWith('* ') || line.startsWith('- ')) {
      elements.push(
        <div key={i} className="flex items-start gap-1.5 my-1 pl-2">
          <div className="mt-1.5 w-1 h-1 bg-black rounded-full flex-shrink-0" />
          <span className="text-[9.5pt] font-sans leading-tight">{clean(line.replace(/^[\*\-]\s/, ''))}</span>
        </div>
      );
    } else if (line.length > 0) {
      elements.push(<p key={i} className="text-[9.5pt] mb-3 text-justify leading-[1.4] font-sans">{clean(line)}</p>);
    }
    i++;
  }
  return elements;
};

export default function App() {
  const [sessions, setSessions] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('qc_final_v1');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [projectName, setProjectName] = useState<string>(() => {
    return localStorage.getItem('qc_project_name') || '';
  });
  const [projectCategory, setProjectCategory] = useState<string>(() => {
    return localStorage.getItem('qc_project_category') || '';
  });
  const [currentId, setCurrentId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('qc_final_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed[0].id;
      }
    } catch {}
    return null;
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCatalogOpen, setIsCatalogOpen] = useState(true);
  
  // --- Modals State ---
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'prompt' | 'confirm' | 'custom_delete' | 'project_form' | 'new_session';
    title: string;
    message?: string;
    defaultValue?: string;
    onConfirm?: (val?: string) => void;
    onAlt?: () => void;
  } | null>(null);
  const [modalInput, setModalInput] = useState('');
  const [projectForm, setProjectForm] = useState({ name: '', category: '' });

  const openPrompt = (title: string, defaultValue: string, onConfirm: (val: string) => void) => {
    setModalInput(defaultValue);
    setModalConfig({ isOpen: true, type: 'prompt', title, defaultValue, onConfirm });
  };

  const openConfirm = (title: string, message: string, onConfirm: () => void) => {
    setModalConfig({ isOpen: true, type: 'confirm', title, message, onConfirm });
  };

  // Refs cho việc xuất ảnh
  const pageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Cập nhật localStorage mỗi khi có thay đổi session
  useEffect(() => {
    localStorage.setItem('qc_final_v1', JSON.stringify(sessions));
  }, [sessions]);

  // Cập nhật localStorage mỗi khi đổi tên dự án
  useEffect(() => {
    localStorage.setItem('qc_project_name', projectName);
    localStorage.setItem('qc_project_category', projectCategory);
  }, [projectName, projectCategory]);

  const handleNewSession = () => {
    setProjectForm({ name: projectName, category: projectCategory });
    setModalConfig({ isOpen: true, type: 'new_session', title: 'Khởi Tạo Hồ Sơ Mới' });
  };

  const handleDeleteSession = (idToDel: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    openConfirm('Xóa hồ sơ', 'Bạn có chắc chắn muốn xóa hồ sơ này?', () => {
      setSessions(prev => {
        const next = prev.filter(s => s.id !== idToDel);
        setCurrentId(curr => curr === idToDel ? (next.length > 0 ? next[0].id : null) : curr);
        return next;
      });
    });
  };

  const handleDeleteOldSessions = () => {
    setModalConfig({
      isOpen: true,
      type: 'custom_delete',
      title: 'Dọn dẹp hồ sơ',
      message: 'Bạn có muốn xóa bớt các hồ sơ cũ không?\n\n- Chọn "Xóa tất cả" để dọn sạch danh sách.\n- Chọn "Chỉ xóa hồ sơ trống" để xóa các hồ sơ mặc định.',
      onConfirm: () => {
        setSessions([]);
        setCurrentId(null);
      },
      onAlt: () => {
        setSessions(prev => prev.filter(s => s.title !== 'HỒ SƠ MỚI' && s.messages.length > 0));
      }
    });
  };

  const handleEditProjectName = () => {
    const session = sessions.find(s => s.id === currentId);
    setProjectForm({ 
      name: session?.projectName !== undefined ? session.projectName : projectName, 
      category: session?.projectCategory !== undefined ? session.projectCategory : projectCategory 
    });
    setModalConfig({ isOpen: true, type: 'project_form', title: 'Thông tin Dự án & Hạng mục' });
  };

  const toggleStamp = (msgId: string, stampType: string) => {
    if (!currentSession) return;
    setSessions(prev => prev.map(s => {
      if (s.id !== currentSession.id) return s;
      const currentStamps = s.stamps || {};
      const newStamps = { ...currentStamps };
      if (newStamps[msgId] === stampType) {
        delete newStamps[msgId];
      } else {
        newStamps[msgId] = stampType;
      }
      return { ...s, stamps: newStamps };
    }));
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

  const handleExportCSV = (content: string, docId: string) => {
    const lines = content.split('\n');
    let csvContent = '\uFEFF'; // BOM cho UTF-8 Excel
    let hasTable = false;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('|')) {
        hasTable = true;
        let cols = trimmedLine.split('|');
        if (cols[0].trim() === '') cols.shift();
        if (cols.length > 0 && cols[cols.length - 1].trim() === '') cols.pop();
        
        // Bỏ qua dòng phân cách Markdown kiểu |---|---|
        if (cols.every(col => col.replace(/-/g, '').trim() === '')) {
          continue;
        }

        const csvCols = cols.map(col => {
          let text = col.replace(/[*_#]/g, '').trim();
          text = text.replace(/"/g, '""'); // Escape double quotes
          return `"${text}"`;
        });
        
        csvContent += csvCols.join(',') + '\n';
      }
    }

    if (!hasTable) {
      alert('Không tìm thấy bảng thông số nào trong tài liệu này để xuất CSV.');
      return;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Spec_Data_${docId}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEditTitle = () => {
    if (!currentId) return;
    const session = sessions.find(s => s.id === currentId);
    if (!session) return;
    
    openPrompt('Nhập tiêu đề mới cho hồ sơ:', session.title, (newTitle) => {
      if (newTitle.trim()) {
        setSessions(prev => prev.map(s => s.id === currentId ? { ...s, title: newTitle.trim().toUpperCase() } : s));
      }
    });
  };

  const handleSend = async (msg?: string, customTitle?: string) => {
    const text = msg || input;
    if (!text.trim() || isLoading) return;

    let targetId = currentId;
    let targetSession = sessions.find(s => s.id === targetId);

    let defaultTitle = customTitle || text.toUpperCase();
    if (!customTitle) {
      defaultTitle = defaultTitle.replace(/^LẬP CHECKLIST KIỂM TRA VẬT LIỆU\s+/i, 'KIỂM TRA ');
      defaultTitle = defaultTitle.replace(/^LẬP QUY TRÌNH NGHIỆM THU CÔNG TÁC\s+/i, 'KIỂM TRA ');
      defaultTitle = defaultTitle.replace(/^LẬP CHECKLIST\s+/i, 'KIỂM TRA ');
      defaultTitle = defaultTitle.replace(/^YÊU CẦU LẬP CHECKLIST\s+/i, 'KIỂM TRA ');
    }

    if (!targetSession) {
      const id = generateId();
      const newSession = { id, title: defaultTitle, messages: [], updatedAt: Date.now() };
      setSessions(prev => [newSession, ...prev]);
      setCurrentId(id);
      targetId = id;
      targetSession = newSession;
    }

    const userMsg = { id: generateId(), role: 'user', content: text };
    const updatedMessages = [...targetSession.messages, userMsg];

    setInput('');
    setIsLoading(true);

    const isNewTitle = targetSession.title === 'HỒ SƠ MỚI';
    const finalTitle = isNewTitle ? defaultTitle : targetSession.title;

    setSessions(prev => prev.map(s => s.id === targetId ? { 
      ...s, 
      messages: updatedMessages, 
      title: finalTitle, 
      updatedAt: Date.now() 
    } : s));

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages, title: finalTitle })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || "Lỗi server");
      }

      const botText = data.text || "Lỗi.";
      const botMsg = { id: generateId(), role: 'model', content: botText };
      setSessions(prev => prev.map(s => s.id === targetId ? { ...s, messages: [...updatedMessages, botMsg], updatedAt: Date.now() } : s));
    } catch (err: any) { 
      console.error(err); 
      
      let errorMsg = err.message || "Đã xảy ra lỗi khi tạo hồ sơ. Vui lòng thử lại sau.";
      if (errorMsg.includes('429') || errorMsg.includes('Quota exceeded')) {
        errorMsg = "Đã vượt quá giới hạn lượt sử dụng AI miễn phí (Rate Limit). Vui lòng đợi 1 phút và thử lại.";
      }
      
      const botMsg = { id: generateId(), role: 'model', content: errorMsg };
      setSessions(prev => prev.map(s => s.id === targetId ? { ...s, messages: [...updatedMessages, botMsg], updatedAt: Date.now() } : s));
    } finally { 
      setIsLoading(false); 
    }
  };

  const currentSession = sessions.find(s => s.id === currentId);
  const displayProjectName = currentSession?.projectName !== undefined ? currentSession.projectName : projectName;
  const displayProjectCategory = currentSession?.projectCategory !== undefined ? currentSession.projectCategory : projectCategory;

  return (
    <div className="flex h-screen bg-slate-200 text-slate-900 font-sans overflow-hidden">
      
      {/* Sidebar Lịch sử - Ẩn khi in */}
      <aside className={`no-print w-60 bg-white border-r border-slate-300 transition-all ${isSidebarOpen ? 'ml-0' : '-ml-60'}`}>
        <div className="h-full flex flex-col p-3">
          {/* Thư mục dự án */}
          <div className="mb-3 p-2 bg-slate-100 rounded border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Thông tin dự án</span>
              <button 
                onClick={handleEditProjectName}
                className="text-indigo-600 hover:text-indigo-800 p-0.5"
                title="Sửa thông tin dự án"
              >
                <Edit2 size={12} />
              </button>
            </div>
            <div className="text-[10px] font-bold text-slate-800 truncate uppercase mb-0.5" title={displayProjectName}>
              🏢 {displayProjectName || '(Chưa có tên dự án)'}
            </div>
            <div className="text-[10px] text-slate-600 truncate uppercase" title={displayProjectCategory}>
              📍 {displayProjectCategory || '(Chưa có hạng mục)'}
            </div>
          </div>

          <div className="flex gap-1 mb-3">
            <button onClick={handleNewSession} className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-slate-900 text-white rounded font-bold text-[10px] uppercase tracking-tighter shadow-md hover:bg-black transition-all">
              <Plus size={12} /> Tạo hồ sơ
            </button>
            <button 
              onClick={handleDeleteOldSessions} 
              className="px-2.5 py-2 bg-red-50 text-red-600 border border-red-200 rounded font-bold text-[10px] uppercase hover:bg-red-100 transition-all flex items-center gap-1"
              title="Xóa hồ sơ cũ / Dọn dẹp"
            >
              <Trash2 size={12} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1">
            {sessions.map(s => (
              <div key={s.id} onClick={() => setCurrentId(s.id)} className={`w-full group cursor-pointer flex items-center justify-between p-2 rounded text-[10px] font-bold border transition-all ${s.id === currentId ? 'bg-indigo-600 text-white border-indigo-600' : 'text-slate-500 border-transparent hover:bg-slate-50'}`}>
                <div className="truncate uppercase outline-none flex-1 pr-2">{s.title}</div>
                <button 
                  onClick={(e) => handleDeleteSession(s.id, e)} 
                  className={`p-1.5 rounded flex-shrink-0 transition-colors ${s.id === currentId ? 'hover:bg-indigo-700 text-white' : 'hover:bg-red-100 text-red-500'}`}
                  title="Xóa hồ sơ"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Vùng Canvas A4 */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="no-print h-12 bg-white/90 border-b flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><LayoutPanelLeft size={18} /></button>
            <div className="flex items-center gap-2 group cursor-pointer" onClick={handleEditTitle} title="Bấm để sửa tiêu đề">
              <h2 className="text-[10px] font-black uppercase text-slate-400">{currentSession ? currentSession.title : 'Chưa có hồ sơ'}</h2>
              {currentSession && <Edit2 size={12} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} disabled={!currentSession} className="flex items-center gap-1 px-3 py-1 bg-slate-900 text-white rounded text-[10px] font-bold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <Printer size={12} /> IN (PDF)
            </button>
            <button onClick={() => setIsCatalogOpen(!isCatalogOpen)} className={`p-1.5 rounded transition-all ${isCatalogOpen ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500'}`}>
              <BookOpen size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-300/50 print:p-0 print:bg-white flex flex-col">
          {!currentSession ? (
            <div className="flex-1 flex flex-col items-center justify-center h-full">
              <div className="text-center text-slate-400">
                <FileText size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-500">Chưa có hồ sơ nào</p>
                <button onClick={handleNewSession} className="px-5 py-2 bg-indigo-600 text-white rounded font-bold text-xs uppercase tracking-wider shadow-md hover:bg-indigo-700 transition-all flex items-center gap-2 mx-auto">
                  <Plus size={14} /> Tạo mới ngay
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-[210mm] mx-auto pb-32 print:pb-0 w-full">
              {currentSession?.messages.map((m: any, idx: number) => (
                m.role === 'model' ? (
                  <div key={m.id} className="relative group">
                    <A4Page 
                      pageRef={(el: HTMLDivElement | null) => { pageRefs.current[m.id] = el; }}
                      content={m.content} 
                      title={currentSession.title} 
                      docId={m.id}
                      stamp={currentSession.stamps?.[m.id]}
                      projectName={displayProjectName}
                      projectCategory={displayProjectCategory}
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
                      <button 
                        onClick={() => handleExportCSV(m.content, m.id)}
                        className="p-2 bg-white border border-slate-300 rounded-full shadow-lg hover:bg-orange-50 text-orange-600"
                        title="Tải bảng Spec về máy (CSV/Excel)"
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        onClick={() => toggleStamp(m.id, 'CHECKED')}
                        className={`p-2 border rounded-full shadow-lg transition-all ${currentSession.stamps?.[m.id] === 'CHECKED' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-300 hover:bg-blue-50 text-blue-600'}`}
                        title="Đóng dấu: ĐÃ KIỂM TRA"
                      >
                        <Check size={18} />
                      </button>
                      <button 
                        onClick={() => toggleStamp(m.id, 'APPROVED')}
                        className={`p-2 border rounded-full shadow-lg transition-all ${currentSession.stamps?.[m.id] === 'APPROVED' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-slate-300 hover:bg-emerald-50 text-emerald-600'}`}
                        title="Đóng dấu: ĐÃ PHÊ DUYỆT"
                      >
                        <Stamp size={18} />
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
          )}
        </div>

        {/* Ô nhập liệu - Ẩn khi in */}
        {currentSession && (
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
        )}
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
                    <button key={m} onClick={() => handleSend(`Lập checklist kiểm tra vật liệu ${m}`, `KIỂM TRA ${m}`)} className="text-left px-2 py-1.5 rounded border border-slate-100 hover:bg-indigo-50 text-[9pt] font-medium text-slate-600 truncate transition-all uppercase">
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[9px] font-black text-emerald-600 uppercase mb-2">Công tác thi công</p>
                <div className="grid grid-cols-1 gap-1">
                  {CONSTRUCTION_DATA.tasks.map(t => (
                    <button key={t} onClick={() => handleSend(`Lập quy trình nghiệm thu công tác ${t}`, `KIỂM TRA ${t}`)} className="text-left px-2 py-1.5 rounded border border-slate-100 hover:bg-emerald-50 text-[9pt] font-medium text-slate-600 truncate transition-all uppercase">
                      {t}
                    </button>
                  ))}
                </div>
              </div>
           </div>
        </div>
      </aside>

      {/* Custom Modal Render */}
      {modalConfig?.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl p-5 w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-bold text-lg text-slate-800 mb-2">{modalConfig.title}</h3>
            {modalConfig.message && <p className="text-slate-600 text-sm mb-4 whitespace-pre-wrap leading-relaxed">{modalConfig.message}</p>}
            
            {modalConfig.type === 'prompt' && (
              <input 
                autoFocus
                type="text" 
                className="w-full border-2 border-indigo-100 rounded-lg p-2.5 mb-5 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                value={modalInput}
                onChange={e => setModalInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && modalConfig.onConfirm) {
                    modalConfig.onConfirm(modalInput);
                    setModalConfig(null);
                  }
                }}
              />
            )}

            {(modalConfig.type === 'project_form' || modalConfig.type === 'new_session') && (
              <div className="flex flex-col gap-3 mb-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tên Dự Án</label>
                  <input 
                    autoFocus
                    type="text" 
                    className="w-full border-2 border-indigo-100 rounded-lg p-2.5 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all uppercase"
                    value={projectForm.name}
                    onChange={e => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hạng Mục</label>
                  <input 
                    type="text" 
                    className="w-full border-2 border-indigo-100 rounded-lg p-2.5 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all uppercase"
                    value={projectForm.category}
                    onChange={e => setProjectForm(prev => ({ ...prev, category: e.target.value }))}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button 
                onClick={() => setModalConfig(null)}
                className="px-4 py-2.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Hủy
              </button>
              
              {modalConfig.type === 'custom_delete' && (
                <button 
                  onClick={() => {
                    if (modalConfig.onAlt) modalConfig.onAlt();
                    setModalConfig(null);
                  }}
                  className="px-4 py-2.5 rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Chỉ xóa hồ sơ trống
                </button>
              )}

              <button 
                onClick={() => {
                  if (modalConfig.type === 'new_session') {
                    const finalProjName = projectForm.name.trim().toUpperCase();
                    const finalProjCat = projectForm.category.trim().toUpperCase();
                    const id = generateId();
                    const newSession = { 
                      id, 
                      title: 'HỒ SƠ MỚI', 
                      projectName: finalProjName,
                      projectCategory: finalProjCat,
                      messages: [], 
                      updatedAt: Date.now() 
                    };
                    setSessions(prev => [newSession, ...prev]);
                    setCurrentId(id);
                    setProjectName(finalProjName); // Lưu làm default cho lần sau
                    setProjectCategory(finalProjCat);
                    setModalConfig(null);
                  } else if (modalConfig.type === 'project_form') {
                    const finalProjName = projectForm.name.trim().toUpperCase();
                    const finalProjCat = projectForm.category.trim().toUpperCase();
                    
                    if (currentId) {
                      setSessions(prev => prev.map(s => s.id === currentId ? { ...s, projectName: finalProjName, projectCategory: finalProjCat } : s));
                    }
                    
                    setProjectName(finalProjName);
                    setProjectCategory(finalProjCat);
                    setModalConfig(null);
                  } else if (modalConfig.onConfirm) {
                    modalConfig.onConfirm(modalInput);
                    setModalConfig(null);
                  }
                }}
                className={`px-4 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors text-white ${modalConfig.type === 'prompt' || modalConfig.type === 'project_form' || modalConfig.type === 'new_session' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200' : 'bg-red-600 hover:bg-red-700 shadow-md shadow-red-200'}`}
              >
                {modalConfig.type === 'prompt' || modalConfig.type === 'project_form' ? 'Lưu Thông Tin' : modalConfig.type === 'new_session' ? 'Tạo Hồ Sơ' : 'Xóa tất cả'}
              </button>
            </div>
          </div>
        </div>
      )}

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
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            counter-reset: page-num;
          }
          .no-print {
            display: none !important;
          }
          .a4-container {
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            width: 210mm !important;
            min-height: 297mm;
            height: auto !important;
            page-break-after: always;
            background: white;
            counter-increment: page-num;
          }
          .page-number::after {
            content: "Trang " counter(page-num);
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
          tfoot {
            display: table-footer-group;
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
