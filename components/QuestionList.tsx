
import React, { useState } from 'react';
import type { Question } from '../types';
import { COGNITIVE_LEVELS, LEVEL_COLORS } from '../constants';

interface QuestionListProps {
  questions: Question[];
}

const levelInfoMap = COGNITIVE_LEVELS.reduce((acc, level) => {
    acc[level.code] = level;
    return acc;
}, {} as { [key: string]: typeof COGNITIVE_LEVELS[0] });


const getFullText = (questions: Question[], withAnswers: boolean): string => {
  return questions.map(q => {
    let questionBlock = '';

    if (withAnswers) {
      // For the "with answers" file, add all the metadata.
      let header = `Câu ${q.id} (${q.competency}`;
      // For D2 questions, don't add the overall cognitive level, as it's specified in each sub-statement.
      if (q.questionType !== 'D2') {
        header += `, ${q.cognitiveLevel}`;
      }
      header += ')\n';
      questionBlock += header;
      questionBlock += `Giải thích năng lực: ${q.competencyExplanation}\n\n`;
      questionBlock += `${q.questionText}\n`;
    } else {
      // For the "questions only" file, keep it simple.
      questionBlock += `Câu ${q.id}: ${q.questionText}\n`;
    }

    if (q.questionType === 'D1' || q.questionType === 'D2') {
        q.options.forEach(opt => {
          questionBlock += `${opt}\n`;
        });
    }

    if (withAnswers) {
      questionBlock += '\n'; // Add a newline before the answer for better separation.
      if (q.questionType === 'D1') {
        questionBlock += `Đáp án: ${q.answer}\n`;
      } else if (q.questionType === 'D2') {
        try {
          const d2Answers = JSON.parse(q.answer);
          let answerLines = 'Đáp án:\n';
          Object.entries(d2Answers).forEach(([key, value]) => {
            answerLines += `  ${key}: ${value}\n`;
          });
          questionBlock += answerLines;
        } catch(e) {
          questionBlock += `Đáp án: ${q.answer}\n`;
        }
      } else if (q.questionType === 'D3') {
        questionBlock += `Gợi ý trả lời:\n${q.answer}\n`;
      }
    }
    return questionBlock.trim();
  }).join('\n\n');
};

const D2Answer = ({ answerString }: { answerString: string }) => {
  try {
    const answers = JSON.parse(answerString) as Record<string, 'Đúng' | 'Sai'>;
    return (
      <div className="mt-4 p-4 bg-slate-50/70 border border-slate-200 rounded-lg">
        <h4 className="font-semibold text-slate-700 text-sm mb-3">Bảng đáp án:</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {Object.entries(answers).map(([key, value]) => (
            <div key={key} className="flex items-center text-sm">
              <span className="font-semibold mr-2">{key}.</span>
              <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${value === 'Đúng' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (e) {
    console.error("Failed to parse D2 answer", e);
    return (
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm font-semibold text-red-700">Lỗi định dạng đáp án.</p>
      </div>
    );
  }
};

export const QuestionList: React.FC<QuestionListProps> = ({ questions }) => {
  const [copied, setCopied] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  const handleCopy = () => {
    const textToCopy = getFullText(questions, true);
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = (withAnswers: boolean) => {
    const text = getFullText(questions, withAnswers);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = withAnswers ? 'de-thi-co-dap-an.txt' : 'de-thi-khong-dap-an.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadOpen(false);
  };

  return (
    <div className="space-y-6">
       <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .question-card-enter {
          opacity: 0;
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
      <div className="flex space-x-3">
        <button 
            onClick={handleCopy}
            className="w-full bg-white border border-slate-300 text-slate-700 font-semibold py-2.5 px-4 rounded-xl hover:bg-slate-100 hover:border-slate-400 transition-all duration-300 flex items-center justify-center text-sm shadow-sm"
          >
            <i className={`fas ${copied ? 'fa-check text-green-500' : 'fa-copy'} mr-2 transition-all`}></i>
            {copied ? 'Đã sao chép!' : 'Sao chép tất cả'}
        </button>
        <div className="relative w-full">
          <button 
              onClick={() => setDownloadOpen(!downloadOpen)}
              className="w-full bg-white border border-slate-300 text-slate-700 font-semibold py-2.5 px-4 rounded-xl hover:bg-slate-100 hover:border-slate-400 transition-all duration-300 flex items-center justify-center text-sm shadow-sm"
          >
              <i className="fas fa-download mr-2"></i>
              Tải về
              <i className={`fas fa-chevron-down transition-transform duration-200 ml-auto ${downloadOpen ? 'rotate-180' : ''}`}></i>
          </button>
          {downloadOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-full rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); handleDownload(false); }}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        role="menuitem"
                      >
                        <i className="fas fa-file-alt w-4 mr-2"></i>Tải câu hỏi
                      </a>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); handleDownload(true); }}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        role="menuitem"
                      >
                        <i className="fas fa-key w-4 mr-2"></i>Tải đáp án & giải thích
                      </a>
                  </div>
              </div>
          )}
        </div>
      </div>

      {questions.map((q, index) => {
        const levelInfo = levelInfoMap[q.cognitiveLevel];
        const colorClasses = levelInfo ? LEVEL_COLORS[levelInfo.color] : { bg: 'bg-gray-100', text: 'text-gray-800' };

        return (
          <div 
            key={q.id} 
            className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/80 transition-all duration-300 hover:shadow-lg hover:border-slate-300 question-card-enter"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <p className="text-lg font-bold text-slate-800">
                Câu {q.id}
              </p>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <span className="text-xs font-semibold bg-sky-100 text-sky-800 px-2.5 py-1 rounded-full">{q.competency}</span>
                 {q.questionType !== 'D2' && (
                  <span className={`text-xs font-semibold ${colorClasses.bg} ${colorClasses.text} px-2.5 py-1 rounded-full`}>{q.cognitiveLevel}</span>
                 )}
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500 italic border-l-2 border-slate-300 pl-4">
              {q.competencyExplanation}
            </p>
            <p className="mt-4 text-base text-slate-800 leading-relaxed">{q.questionText}</p>
            
            {q.questionType !== 'D3' && q.options && (
              <div className={`mt-4 space-y-2 text-sm ${q.questionType === 'D2' ? 'list-decimal list-inside pl-1' : ''}`}>
                {q.options.map((option, index) => (
                  <div key={index} className={`p-3 rounded-lg transition-colors duration-200 ${q.questionType === 'D1' && option.startsWith(q.answer as string) 
                    ? 'bg-green-50 text-green-900 ring-1 ring-green-200 font-semibold' 
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200/70'}`
                  }>
                    {q.questionType === 'D1' && option.startsWith(q.answer as string) ? <i className="fas fa-check-circle mr-2 text-green-600"></i> : null}
                    {option}
                  </div>
                ))}
              </div>
            )}

            {q.questionType === 'D2' && <D2Answer answerString={q.answer} />}

            {q.questionType === 'D3' && (
              <div className="mt-4 p-4 bg-indigo-50 border-l-4 border-indigo-400 rounded-r-lg">
                <h4 className="font-semibold text-sm text-indigo-800 flex items-center"><i className="fas fa-lightbulb mr-2"></i>Gợi ý trả lời</h4>
                <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{q.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
