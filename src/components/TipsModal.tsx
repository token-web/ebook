import React from 'react';
import { X, Lightbulb, CheckCircle2, BookOpen } from 'lucide-react';
import { WRITING_TIPS } from '../constants/presets';

interface TipsModalProps {
  onClose: () => void;
}

export const TipsModal: React.FC<TipsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 my-auto">
        {/* Header */}
        <div className="bg-amber-900 text-amber-50 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-book text-white">
                처음 쓰는 작가를 위한 기획 꿀팁
              </h2>
              <p className="text-xs sm:text-sm text-amber-200">
                처음 기획할 때 막막함을 덜어주는 핵심 가이드
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl hover:bg-amber-800 text-amber-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {WRITING_TIPS.map((tip, idx) => (
            <div key={idx} className="bg-amber-50/50 rounded-2xl p-5 border border-amber-200/70 space-y-3">
              <h3 className="font-bold text-amber-950 text-base sm:text-lg flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span>{tip.title}</span>
              </h3>
              <ul className="space-y-2 text-stone-700 text-sm sm:text-base">
                {tip.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Encouragement box */}
          <div className="bg-stone-100 rounded-2xl p-5 border border-stone-300 text-center space-y-2">
            <p className="font-bold text-stone-900 text-base sm:text-lg font-book">
              “완벽한 글은 없습니다. 완성된 기획만 있을 뿐입니다.”
            </p>
            <p className="text-xs sm:text-sm text-stone-600">
              완벽한 문장 대신, 내 안의 진솔한 이야기를 꺼내는 데 집중해보세요!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-amber-800 hover:bg-amber-700 text-white font-bold rounded-xl shadow transition-colors text-sm"
          >
            확인하고 계속 작성하기
          </button>
        </div>
      </div>
    </div>
  );
};
