import React from 'react';
import type { QuestionCounts } from '../types';
import { COGNITIVE_LEVELS, LEVEL_COLORS } from '../constants';

interface QuestionConfigProps {
  counts: QuestionCounts;
  setCounts: React.Dispatch<React.SetStateAction<QuestionCounts>>;
}

const StepperInput: React.FC<{
  id: string;
  label: React.ReactNode;
  value: number;
  onChange: (value: number) => void;
  levelColor?: string;
}> = ({ id, label, value, onChange, levelColor }) => {
  const handleIncrement = () => onChange(value + 1);
  const handleDecrement = () => onChange(Math.max(0, value - 1));
  const colorClasses = levelColor ? LEVEL_COLORS[levelColor] : null;

  return (
    <div className={`flex items-center justify-between bg-slate-100 p-3 rounded-lg transition-colors duration-300 ${colorClasses ? `border-l-4 ${colorClasses.border} bg-white` : ''}`}>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button 
          onClick={handleDecrement}
          className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors flex items-center justify-center font-bold"
          aria-label="Giảm"
        >
          -
        </button>
        <input
          id={id}
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
          min="0"
          className="w-12 text-center rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white"
        />
        <button 
          onClick={handleIncrement}
          className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors flex items-center justify-center font-bold"
          aria-label="Tăng"
        >
          +
        </button>
      </div>
    </div>
  );
};


export const QuestionConfig: React.FC<QuestionConfigProps> = ({ counts, setCounts }) => {

  const handleMcCountChange = (levelKey: string, value: number) => {
    setCounts((prev: QuestionCounts) => ({
      ...prev,
      multipleChoice: { ...prev.multipleChoice, [levelKey]: value },
    }));
  };

  const handleTfCountChange = (value: number) => {
    setCounts((prev: QuestionCounts) => ({ ...prev, trueFalse: value }));
  };

  const handleEssayCountChange = (levelKey: string, value: number) => {
    setCounts((prev: QuestionCounts) => ({
      ...prev,
      essay: { ...prev.essay, [levelKey]: value },
    }));
  };

  const SectionHeader: React.FC<{ icon: string; title: string; }> = ({ icon, title }) => (
    <h3 className="text-md font-bold text-slate-700 flex items-center mt-4 mb-2">
        <i className={`fas ${icon} mr-3 text-slate-500`}></i>
        {title}
    </h3>
  );

  return (
    <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-2">
      <div>
        <SectionHeader icon="fa-list-check" title="Trắc nghiệm (D1)" />
        <div className="space-y-2">
            {COGNITIVE_LEVELS.map(level => (
                <StepperInput
                    key={level.key}
                    id={`mc-${level.key}`}
                    label={<>Số câu <span className={`font-bold ${LEVEL_COLORS[level.color]?.text}`}>{level.code}</span></>}
                    value={counts.multipleChoice[level.key]}
                    onChange={(value) => handleMcCountChange(level.key, value)}
                    levelColor={level.color}
                />
            ))}
        </div>
      </div>

      <hr className="border-slate-200 my-4"/>
      
      <div>
        <SectionHeader icon="fa-check-double" title="Đúng/Sai (D2)" />
        <div className="space-y-2">
            <p className="text-xs text-slate-500 px-1">Mỗi câu Đúng/Sai là một câu hỏi phức hợp, chứa các mệnh đề ở nhiều cấp độ nhận thức khác nhau.</p>
            <StepperInput
                id="tf-count"
                label={<span className="font-semibold">Tổng số câu</span>}
                value={counts.trueFalse}
                onChange={handleTfCountChange}
            />
        </div>
      </div>

      <hr className="border-slate-200 my-4"/>

      <div>
        <SectionHeader icon="fa-pen-ruler" title="Tự luận (D3)" />
        <div className="space-y-2">
            {COGNITIVE_LEVELS.map(level => (
                <StepperInput
                key={level.key}
                id={`essay-${level.key}`}
                label={<>Số câu <span className={`font-bold ${LEVEL_COLORS[level.color]?.text}`}>{level.code}</span></>}
                value={counts.essay[level.key]}
                onChange={(value) => handleEssayCountChange(level.key, value)}
                levelColor={level.color}
                />
            ))}
        </div>
      </div>
    </div>
  );
};
