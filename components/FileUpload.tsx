import React, { useState, useCallback } from 'react';
import type { CombinedFileContent, ImageContent } from '../types';

declare const mammoth: any;
declare const pdfjsLib: any;

interface FileUploadProps {
  onFileChange: (content: CombinedFileContent | null) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

const parseDocx = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

const parsePdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(' ');
    text += pageText + '\n';
  }
  return text;
};


export const FileUpload: React.FC<FileUploadProps> = ({ onFileChange }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFiles = useCallback(async (files: FileList) => {
    if (files.length === 0) return;

    setIsParsing(true);
    setFileNames(Array.from(files).map(f => f.name));
    onFileChange(null);
    setError(null);

    try {
      const filePromises = Array.from(files).map(async file => {
        if (file.type.startsWith('image/')) {
          const base64 = await fileToBase64(file);
          return { type: 'image', content: { mimeType: file.type, content: base64 } };
        } else if (file.type === 'application/pdf') {
          const text = await parsePdf(file);
          return { type: 'text', content: text };
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
          const text = await parseDocx(file);
          return { type: 'text', content: text };
        } else {
          throw new Error(`Loại tệp không được hỗ trợ: ${file.name}`);
        }
      });

      const results = await Promise.all(filePromises);

      const combinedText = results
        .filter(r => r.type === 'text')
        .map(r => r.content as string)
        .join('\n\n---\n\n');

      const images = results
        .filter(r => r.type === 'image')
        .map(r => r.content as ImageContent);
      
      onFileChange({ text: combinedText, images });

    } catch (err) {
      console.error("Lỗi khi xử lý tệp:", err);
      const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi khi xử lý tệp của bạn.";
      setError(errorMessage);
      onFileChange(null);
      setFileNames([]);
    } finally {
      setIsParsing(false);
    }
  }, [onFileChange]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-blue-500', 'bg-blue-50/50');
    if (event.dataTransfer.files) {
      processFiles(event.dataTransfer.files);
    }
  }, [processFiles]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => event.preventDefault(), []);
  const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => event.currentTarget.classList.add('border-blue-500', 'bg-blue-50/50'), []);
  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => event.currentTarget.classList.remove('border-blue-500', 'bg-blue-50/50'), []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      processFiles(event.target.files);
      event.target.value = '';
    }
  };
  
  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value;
    if (text.trim()) {
      onFileChange({ text, images: [] });
      setFileNames(['Nội dung văn bản']);
    } else {
      onFileChange(null);
      setFileNames([]);
    }
    setError(null);
  };
  
  const handleTabChange = (tab: 'upload' | 'paste') => {
    setActiveTab(tab);
    onFileChange(null);
    setFileNames([]);
    setError(null);
  }

  return (
    <div className="w-full">
      <div className="flex bg-slate-200/80 p-1 rounded-xl">
        <button onClick={() => handleTabChange('upload')} className={`w-1/2 rounded-lg py-2 text-sm font-semibold transition-all duration-300 ${activeTab === 'upload' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:bg-slate-300/50'}`}>Tải lên tệp</button>
        <button onClick={() => handleTabChange('paste')} className={`w-1/2 rounded-lg py-2 text-sm font-semibold transition-all duration-300 ${activeTab === 'paste' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:bg-slate-300/50'}`}>Dán văn bản</button>
      </div>
      <div className="pt-4">
        {activeTab === 'upload' && (
           <div 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center transition-colors bg-slate-50 hover:border-blue-500"
           >
             <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf,.docx" multiple/>
             <label htmlFor="file-upload" className="cursor-pointer">
               <div className="text-slate-500">
                 <i className="fas fa-cloud-upload-alt text-4xl mb-3 text-slate-400"></i>
                 <p className="font-semibold text-slate-700">Kéo và thả tệp vào đây</p>
                 <p className="text-xs text-slate-500 mt-1">hoặc</p>
                 <p className="text-blue-600 font-bold mt-1">Chọn từ thiết bị</p>
                 <p className="text-xs text-slate-400 mt-2">Hỗ trợ nhiều tệp: PDF, DOCX, Hình ảnh</p>
               </div>
             </label>
           </div>
        )}
        {activeTab === 'paste' && (
          <textarea 
            onChange={handleTextChange}
            placeholder="Dán nội dung từ tài liệu của bạn vào đây..."
            className="w-full h-40 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition"
          />
        )}
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {isParsing && (
          <div className="mt-3 flex items-center text-sm text-slate-600">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Đang xử lý {fileNames.length} tệp...</span>
          </div>
        )}
        {fileNames.length > 0 && !isParsing && (
          <div className="mt-3 text-sm text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800"><i className="fas fa-check-circle text-green-500 mr-2"></i>Đã tải lên {fileNames.length} tệp thành công:</p>
            <div className="max-h-24 overflow-y-auto bg-slate-100 p-2 rounded-lg border border-slate-200">
              {fileNames.map((name, index) => <p key={index} className="truncate text-xs"><i className="fas fa-file-alt mr-2 text-slate-400"></i>{name}</p>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};