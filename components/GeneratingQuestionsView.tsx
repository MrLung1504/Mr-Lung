
import React from 'react';

export const GeneratingQuestionsView: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-8 bg-slate-50 rounded-2xl">
    <div className="relative w-48 h-48">
      {/* Central icon */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <svg
          className="w-28 h-28"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: "drop-shadow(0 5px 15px rgba(99, 102, 241, 0.4))" }}
        >
          <defs>
            <linearGradient id="ai-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
            <linearGradient id="ai-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c7d2fe" />
              <stop offset="100%" stopColor="#a5b4fc" />
            </linearGradient>
          </defs>

          {/* Outer brain shape with pulsing effect */}
          <path
            d="M100 20 C60 20 30 50 30 90 C30 130 60 160 100 180 C140 160 170 130 170 90 C170 50 140 20 100 20 Z"
            stroke="url(#ai-gradient-1)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-brain-pulse"
          />

          {/* Internal circuits/pathways with flowing effect */}
          <path
            d="M60 60 Q70 40 100 40 T140 60"
            stroke="url(#ai-gradient-2)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="40 40"
            className="animate-circuit-path-1"
          />
          <path
            d="M60 140 Q70 160 100 160 T140 140"
            stroke="url(#ai-gradient-2)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="40 40"
            className="animate-circuit-path-2"
          />
          <path
            d="M50 90 C70 80 130 80 150 90"
            stroke="url(#ai-gradient-2)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="60 60"
            className="animate-circuit-path-3"
          />
          <path
            d="M50 110 C70 120 130 120 150 110"
            stroke="url(#ai-gradient-2)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="60 60"
            className="animate-circuit-path-4"
          />

          {/* Small pulsing dot for "focus" */}
          <circle
            cx="100"
            cy="90"
            r="8"
            fill="#818cf8"
            className="animate-dot-pulse"
          />
        </svg>
      </div>
    </div>
    <h3 className="text-xl font-bold text-slate-700 mt-12">Đợi thầy Lung tạo câu hỏi...</h3>
    <p className="mt-2 text-slate-500 max-w-md">
      Đang rèn giũa từng câu chữ để tạo ra sản phẩm tốt nhất.
    </p>
    <style>{`
      @keyframes brain-pulse {
        0%, 100% {
          stroke-width: 5;
          opacity: 0.8;
        }
        50% {
          stroke-width: 6;
          opacity: 1;
        }
      }
      .animate-brain-pulse {
        animation: brain-pulse 4s ease-in-out infinite alternate;
      }

      @keyframes circuit-flow {
        0% { stroke-dashoffset: 0; }
        100% { stroke-dashoffset: -120; } /* Larger offset to ensure continuous flow */
      }
      .animate-circuit-path-1 {
        animation: circuit-flow 2.5s linear infinite;
      }
      .animate-circuit-path-2 {
        animation: circuit-flow 3s linear infinite;
        animation-delay: 0.5s; /* Staggered */
      }
      .animate-circuit-path-3 {
        animation: circuit-flow 3.5s linear infinite;
        animation-delay: 1s; /* Staggered */
      }
      .animate-circuit-path-4 {
        animation: circuit-flow 2s linear infinite;
        animation-delay: 1.5s; /* Staggered */
      }

      @keyframes dot-pulse {
        0%, 100% {
          transform: scale(0.8);
          opacity: 0.7;
        }
        50% {
          transform: scale(1.1);
          opacity: 1;
        }
      }
      .animate-dot-pulse {
        animation: dot-pulse 2s ease-in-out infinite alternate;
        transform-origin: center; /* Ensure scaling is from center */
      }
    `}</style>
  </div>
);
