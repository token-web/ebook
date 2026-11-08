import React from 'react';
import { X, BookOpen, User, Target, Quote, ListOrdered, FileText } from 'lucide-react';
import { BookPlanning } from '../types/card';

interface PresentationModalProps {
  planning: BookPlanning;
  onClose: () => void;
}

export const PresentationModal: React.FC<PresentationModalProps> = ({
  planning,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#fdfbf7] text-stone-900 rounded-3xl shadow-2xl overflow-hidden border-4 border-amber-500/60 my-auto">
        {/* Top Control Bar */}
        <div className="bg-stone-900 text-stone-100 px-6 py-4 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
            <span className="font-bold text-base sm:text-lg text-amber-300">
              기획 카드 발표 모드
            </span>
            <span className="hidden sm:inline-block text-xs bg-stone-800 text-stone-400 px-2 py-0.5 rounded">
              ESC 키 또는 닫기 버튼으로 종료
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <X className="w-4 h-4" />
            <span>닫기</span>
          </button>
        </div>

        {/* Card Header for Presentation */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-stone-900 text-amber-50 px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-950">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-300 font-bold block">
                나만의 전자책 기획 카드
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-book text-white">
                {planning.authorName || '예비 작가'}의 기획 발표
              </h2>
            </div>
          </div>
          <div className="text-sm text-amber-200/90 bg-amber-950/60 px-4 py-1.5 rounded-xl border border-amber-700/60">
            성인 작가 기획 워크숍
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-8 sm:p-10 space-y-8 max-h-[75vh] overflow-y-auto">
          {/* 가제 */}
          <div className="border-b-2 border-stone-200 pb-6 text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs uppercase mb-3">
              가제 (임시 제목)
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 font-book leading-tight">
              “{planning.title || '(가제 미입력)'}”
            </h1>
          </div>

          {/* 2단 그리드: 주제 & 예상 독자 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 주제 & 경험 */}
            <div className="bg-white rounded-2xl p-6 border-2 border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-lg">
                <FileText className="w-5 h-5 text-amber-700" />
                <span>주제 및 나의 경험</span>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-bold text-amber-800 block">
                    [관심 주제]
                  </span>
                  <p className="text-lg text-stone-800 leading-relaxed font-medium">
                    {planning.topic || '(미입력)'}
                  </p>
                </div>
                <div className="pt-2 border-t border-stone-100">
                  <span className="text-xs font-bold text-stone-600 block">
                    [나의 실제 경험]
                  </span>
                  <p className="text-base text-stone-700 leading-relaxed">
                    {planning.experience || '(미입력)'}
                  </p>
                </div>
              </div>
            </div>

            {/* 예상 독자 */}
            <div className="bg-white rounded-2xl p-6 border-2 border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-lg">
                <Target className="w-5 h-5 text-amber-700" />
                <span>예상 독자</span>
              </div>
              <p className="text-lg text-stone-800 leading-relaxed font-medium">
                {planning.targetReader || '(미입력)'}
              </p>
            </div>
          </div>

          {/* 핵심 메시지 */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 sm:p-8 border-2 border-amber-300 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-lg">
              <Quote className="w-5 h-5 text-amber-700" />
              <span>독자에게 전하고 싶은 핵심 메시지</span>
            </div>
            <p className="text-xl sm:text-2xl font-book italic font-bold text-amber-950 leading-relaxed">
              “{planning.coreMessage || '(미입력)'}”
            </p>
          </div>

          {/* 목차 초안 */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-lg">
                <ListOrdered className="w-5 h-5 text-amber-700" />
                <span>목차 초안</span>
              </div>
              <span className="text-sm font-semibold text-stone-500">
                총 {planning.tableOfContents.length}개 장
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {planning.tableOfContents.map((ch, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/80"
                >
                  <span className="w-8 h-8 rounded-lg bg-amber-800 text-white font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-lg font-medium text-stone-900">
                    {ch}
                  </span>
                </div>
              ))}
            </div>

            {/* Google Docs writing notice */}
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-sm flex items-center gap-2">
              <span className="font-bold">원고 작성 안내:</span>
              <span>수강생 본문 원고는 별도의 Google 문서(Docs) 등에서 직접 작성하시면 됩니다.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-100 px-8 py-4 border-t border-stone-200 flex items-center justify-between text-sm text-stone-600">
          <span>작성자: {planning.authorName || '예비 작가'}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow transition-colors"
          >
            발표 모드 나가기
          </button>
        </div>
      </div>
    </div>
  );
};
