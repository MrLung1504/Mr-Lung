import React, { useState, useCallback, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { Question, CombinedFileContent, QuestionCounts } from './types';
import { generateQuestions } from './services/geminiService';
import { FileUpload } from './components/FileUpload';
import { QuestionList } from './components/QuestionList';
import { QuestionConfig } from './components/QuestionConfig';
import { COGNITIVE_LEVELS } from './constants';
import { GeneratingQuestionsView } from './components/GeneratingQuestionsView';
import { Spinner } from './components/Spinner';

const initialCognitiveCounts = COGNITIVE_LEVELS.reduce((acc, level) => {
  acc[level.key] = 0;
  return acc;
}, {} as { [key: string]: number });


const App: React.FC = () => {
  const [fileContent, setFileContent] = useState<CombinedFileContent | null>(null);
  const [questionCounts, setQuestionCounts] = useState<QuestionCounts>({
    multipleChoice: { ...initialCognitiveCounts, biet: 5 },
    trueFalse: 5,
    essay: { ...initialCognitiveCounts },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);

  const totalQuestions = useMemo(() => {
    const mcTotal = Object.values(questionCounts.multipleChoice).reduce((sum: number, count: number) => sum + count, 0);
    const essayTotal = Object.values(questionCounts.essay).reduce((sum: number, count: number) => sum + count, 0);
    return mcTotal + questionCounts.trueFalse + essayTotal;
  }, [questionCounts]);


  const handleGenerateClick = useCallback(async () => {
    if (!fileContent || (fileContent.text.trim() === '' && fileContent.images.length === 0)) {
      setError('Vui lòng tải lên tài liệu hoặc dán văn bản.');
      return;
    }

    if (totalQuestions <= 0) {
      setError('Vui lòng nhập số lượng câu hỏi lớn hơn 0.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedQuestions([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const questions = await generateQuestions(
        ai,
        fileContent,
        questionCounts
      );
      setGeneratedQuestions(questions);
    } catch (e) {
      console.error(e);
      setError('Đã xảy ra lỗi khi tạo câu hỏi. Vui lòng kiểm tra API key, định dạng tệp và thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [fileContent, questionCounts, totalQuestions]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            AI Tạo Câu Hỏi Tin Học
          </h1>
          <p className="text-lg text-slate-600 mt-2">
            Tạo câu hỏi từ tài liệu của bạn một cách nhanh chóng
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Input Panel */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-8 space-y-8 lg:self-start xl:sticky lg:top-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <span className="bg-blue-600 text-white rounded-full h-8 w-8 text-sm font-bold flex items-center justify-center mr-3">1</span>
                    Cung cấp nội dung
                  </h2>
                  <FileUpload onFileChange={setFileContent} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <span className="bg-blue-600 text-white rounded-full h-8 w-8 text-sm font-bold flex items-center justify-center mr-3">2</span>
                    Tùy chọn câu hỏi
                  </h2>
                  <QuestionConfig counts={questionCounts} setCounts={setQuestionCounts} />
                </div>
              </div>
              <div>
                <button
                  onClick={handleGenerateClick}
                  disabled={isLoading || !fileContent || totalQuestions === 0}
                  className="w-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold py-4 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed flex items-center justify-center text-lg shadow-md hover:shadow-lg disabled:shadow-none"
                >
                  {isLoading ? (
                    <>
                      <Spinner />
                      <span className="ml-3">Đang tạo câu hỏi...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-bolt mr-3"></i>
                      <span>Tạo {totalQuestions > 0 ? totalQuestions : ''} câu hỏi</span>
                    </>
                  )}
                </button>
                {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
              </div>
            </div>

            {/* Right Column: Output Panel */}
            <div className="bg-slate-50 rounded-2xl shadow-inner border border-slate-200/80 flex flex-col">
                <div className="p-6 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl z-10 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center">
                        <i className="fas fa-clipboard-list mr-3 text-slate-500"></i>
                        Kết quả
                    </h2>
                </div>
                <div className="flex-grow p-6 overflow-y-auto ios-scrollbar">
                    {isLoading && !generatedQuestions.length ? (
                      <GeneratingQuestionsView />
                    ) : generatedQuestions.length > 0 ? (
                      <QuestionList questions={generatedQuestions} />
                    ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                        <i className="fas fa-lightbulb text-5xl mb-4 text-slate-400"></i>
                        <p className="font-medium">Câu hỏi của bạn sẽ xuất hiện ở đây</p>
                        <p className="text-sm">Bắt đầu bằng cách cung cấp nội dung và cấu hình câu hỏi.</p>
                    </div>
                    )}
                </div>
            </div>
        </main>

        <footer className="text-center mt-12 text-slate-500 text-sm">
          <p>Phát triển với Gemini API</p>
        </footer>
      </div>
    </div>
  );
};

export default App;