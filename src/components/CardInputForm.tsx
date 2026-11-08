import React from 'react';
import {
  Plus,
  Trash2,
  HelpCircle,
  BookMarked,
  User,
  Sparkles,
  AlertCircle,
  BookOpen,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { BookPlanning, FontSizeMode } from '../types/card';

interface CardInputFormProps {
  planning: BookPlanning;
  onChange: (updated: Partial<BookPlanning>) => void;
  fontSizeMode: FontSizeMode;
  onOpenTips: () => void;
  onOpenAICoach: () => void;
  onOpenRelatedBooks?: () => void;
}

export const CardInputForm: React.FC<CardInputFormProps> = ({
  planning,
  onChange,
  fontSizeMode,
  onOpenTips,
  onOpenAICoach,
  onOpenRelatedBooks,
}) => {
  // Font scale helpers for adult readers
  const labelClass =
    fontSizeMode === 'xlarge'
      ? 'text-xl font-bold text-stone-900'
      : fontSizeMode === 'large'
      ? 'text-lg font-bold text-stone-900'
      : 'text-base font-bold text-stone-900';

  const subGuideClass =
    fontSizeMode === 'xlarge'
      ? 'text-base text-stone-600 mt-1 leading-relaxed'
      : fontSizeMode === 'large'
      ? 'text-sm text-stone-600 mt-1 leading-relaxed'
      : 'text-xs text-stone-500 mt-0.5 leading-relaxed';

  const inputClass =
    fontSizeMode === 'xlarge'
      ? 'w-full rounded-2xl border-2 border-stone-300 bg-white px-4 py-3.5 text-lg text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:bg-amber-50/20 focus:outline-none transition-all shadow-sm'
      : fontSizeMode === 'large'
      ? 'w-full rounded-2xl border-2 border-stone-300 bg-white px-4 py-3 text-base text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:bg-amber-50/20 focus:outline-none transition-all shadow-sm'
      : 'w-full rounded-xl border-2 border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:bg-amber-50/20 focus:outline-none transition-all shadow-sm';

  const textareaClass =
    fontSizeMode === 'xlarge'
      ? 'w-full rounded-2xl border-2 border-stone-300 bg-white px-4 py-3 text-lg text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:bg-amber-50/20 focus:outline-none transition-all shadow-sm leading-relaxed resize-y'
      : fontSizeMode === 'large'
      ? 'w-full rounded-2xl border-2 border-stone-300 bg-white px-4 py-3 text-base text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:bg-amber-50/20 focus:outline-none transition-all shadow-sm leading-relaxed resize-y'
      : 'w-full rounded-xl border-2 border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:bg-amber-50/20 focus:outline-none transition-all shadow-sm leading-relaxed resize-y';

  // Handle Table of Contents changes
  const handleChapterChange = (index: number, value: string) => {
    const updated = [...planning.tableOfContents];
    updated[index] = value;
    onChange({ tableOfContents: updated });
  };

  const handleAddChapter = () => {
    const nextIndex = planning.tableOfContents.length + 1;
    onChange({
      tableOfContents: [...planning.tableOfContents, `${nextIndex}장. 새로운 장 제목`],
    });
  };

  const handleRemoveChapter = (index: number) => {
    if (planning.tableOfContents.length <= 1) {
      return;
    }
    const updated = planning.tableOfContents.filter((_, i) => i !== index);
    onChange({ tableOfContents: updated });
  };

  const handleMoveChapterUp = (index: number) => {
    if (index === 0) return;
    const updated = [...planning.tableOfContents];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChange({ tableOfContents: updated });
  };

  const handleMoveChapterDown = (index: number) => {
    if (index >= planning.tableOfContents.length - 1) return;
    const updated = [...planning.tableOfContents];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChange({ tableOfContents: updated });
  };

  return (
    <div className="space-y-6">
      {/* Introduction Banner for Adult Beginners */}
      <div className="bg-amber-100/70 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 font-bold shadow-sm">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-stone-900 text-base sm:text-lg">
              기획 워크시트 입력
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm mt-0.5">
              질문에 따라 편안하게 적어보세요. 입력한 내용은 오른쪽 카드에 즉시 반영됩니다.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenTips}
          className="text-amber-800 hover:text-amber-950 bg-amber-200/80 hover:bg-amber-300/80 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors flex items-center gap-1"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>작성 요령</span>
        </button>
      </div>

      {/* Author Name (Quick input) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm">
        <label className="flex items-center gap-2 mb-1">
          <User className="w-4 h-4 text-amber-700" />
          <span className="text-sm sm:text-base font-bold text-stone-800">
            작가 닉네임 / 필명 (선택)
          </span>
        </label>
        <p className="text-xs text-stone-500 mb-2">
          계정 가입이나 실명·연락처 입력 없이 편안한 필명이나 닉네임을 적어주세요.
        </p>
        <input
          type="text"
          value={planning.authorName}
          onChange={(e) => onChange({ authorName: e.target.value })}
          placeholder="예) 예비 작가 산들바람"
          className={inputClass}
          maxLength={30}
        />
      </div>

      {/* Question 1: 가제 (Working Title) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-stone-200 hover:border-amber-400/80 transition-colors shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
              1
            </span>
            <label className={labelClass}>
              책 표지에 들어갈 임시 제목(가제)을 지어볼까요?
            </label>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
            가제
          </span>
        </div>
        <p className={subGuideClass}>
          완벽하지 않아도 괜찮습니다. 떠오르는 직관적인 문장이나 호기심을 끄는 문장을 적어보세요.
        </p>
        <div className="pt-1">
          <input
            type="text"
            value={planning.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="예) 서른다섯, 나를 지키는 주말 글쓰기"
            className={inputClass}
          />
        </div>
      </div>

      {/* Question 2: 관심 주제 (Topic) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-stone-200 hover:border-amber-400/80 transition-colors shadow-sm space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
              2
            </span>
            <label className={labelClass}>
              어떤 주제에 대해 이야기하고 싶으신가요?
            </label>
          </div>
          <div className="flex items-center gap-2">
            {onOpenRelatedBooks && (
              <button
                type="button"
                onClick={onOpenRelatedBooks}
                className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold transition-colors flex items-center gap-1"
                title="이 주제와 관련된 최근 국내 서점 도서 실시간 조회"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                <span>관련 책 살펴보기</span>
              </button>
            )}
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
              관심 주제
            </span>
          </div>
        </div>
        <p className={subGuideClass}>
          나의 일, 취미, 치유, 재테크, 삶의 철학 등 다루고 싶은 구체적인 분야를 적어주세요.
        </p>
        <div className="pt-1">
          <textarea
            rows={2}
            value={planning.topic}
            onChange={(e) => onChange({ topic: e.target.value })}
            placeholder="예) 직장인을 위한 치유와 힐링의 일상 글쓰기"
            className={textareaClass}
          />
        </div>
      </div>

      {/* Question 3: 자신의 경험 (Experience) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-stone-200 hover:border-amber-400/80 transition-colors shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
              3
            </span>
            <label className={labelClass}>
              이 주제와 관련된 나의 실제 경험이나 사연은 무엇인가요?
            </label>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
            나의 경험
          </span>
        </div>
        <p className={subGuideClass}>
          내가 직접 겪은 실패, 극복, 깨달음의 순간이 이 책만의 가장 독창적인 무기가 됩니다.
        </p>
        <div className="pt-1">
          <textarea
            rows={3}
            value={planning.experience}
            onChange={(e) => onChange({ experience: e.target.value })}
            placeholder="예) 10년 차 번아웃을 겪던 시절, 주말 아침마다 쓴 솔직한 일기로 마음의 평온과 자존감을 되찾음"
            className={textareaClass}
          />
        </div>
      </div>

      {/* Question 4: 예상 독자 (Target Reader) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-stone-200 hover:border-amber-400/80 transition-colors shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
              4
            </span>
            <label className={labelClass}>
              이 책이 가장 절실하게 필요한 사람은 누구인가요?
            </label>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
            예상 독자
          </span>
        </div>
        <p className={subGuideClass}>
          '모두'가 아닌, 3년 전의 나 자신이나 친한 친구처럼 얼굴이 떠오르는 한 사람을 적어보세요.
        </p>
        <div className="pt-1">
          <textarea
            rows={2}
            value={planning.targetReader}
            onChange={(e) => onChange({ targetReader: e.target.value })}
            placeholder="예) 매일 반복되는 일상에 지쳐 나만의 시간과 자존감을 되찾고 싶은 3040 직장인"
            className={textareaClass}
          />
        </div>
      </div>

      {/* Question 5: 전하고 싶은 메시지 (Core Message) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-stone-200 hover:border-amber-400/80 transition-colors shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
              5
            </span>
            <label className={labelClass}>
              책을 덮었을 때 독자의 마음에 꼭 남기고 싶은 한마디는?
            </label>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
            핵심 메시지
          </span>
        </div>
        <p className={subGuideClass}>
          독자가 이 책을 다 읽고 난 후 갖게 될 마음의 위로, 깨달음, 또는 행동의 변화를 적어보세요.
        </p>
        <div className="pt-1">
          <textarea
            rows={3}
            value={planning.coreMessage}
            onChange={(e) => onChange({ coreMessage: e.target.value })}
            placeholder="예) 거창한 작가가 아니어도 괜찮습니다. 주말 단 1시간의 글쓰기가 흔들리는 일상을 단단하게 붙잡아 줍니다."
            className={textareaClass}
          />
        </div>
      </div>

      {/* Question 6: 목차 초안 (Table of Contents) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-stone-200 hover:border-amber-400/80 transition-colors shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
              6
            </span>
            <label className={labelClass}>
              책의 흐름을 3~5개 장으로 나누어 적어보세요
            </label>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
            목차 초안
          </span>
        </div>
        <p className={subGuideClass}>
          처음 시작부터 마무리까지 자연스럽게 연결되도록 장 제목을 구성해보세요.
        </p>

        {/* AI TOC Assistant Banner / Button */}
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/80 rounded-2xl p-4 border-2 border-amber-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900 text-sm sm:text-base">
                  AI와 목차 만들기
                </span>
                <span className="text-[11px] bg-amber-600 text-white font-bold px-2 py-0.5 rounded-full">
                  1:1 맞춤 대화
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                질문에 답하며 내 경험이 담긴 3~5개 장 목차 뼈대를 쉽게 완성해보세요
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            {onOpenRelatedBooks && (
              <button
                type="button"
                onClick={onOpenRelatedBooks}
                className="w-full sm:w-auto px-3.5 py-2.5 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0"
                title="국내 서점 최근 도서 실시간 조회"
              >
                <BookOpen className="w-4 h-4 text-amber-800" />
                <span>관련 책 살펴보기</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenAICoach}
              className="w-full sm:w-auto px-4 py-2.5 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow hover:shadow-md flex items-center justify-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>AI와 대화 시작하기</span>
            </button>
          </div>
        </div>

        {/* Clear Notice: No body text in this planning step */}
        <div className="flex items-center gap-2 p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-amber-900 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            이번 수업은 <strong>책의 뼈대를 잡는 기획 단계</strong>입니다. 본문이나 원고 작성 칸 없이 목차 제목만 편하게 작성하세요.
          </span>
        </div>

        {/* Chapters List */}
        <div className="space-y-2.5 pt-2">
          {planning.tableOfContents.map((chapter, index) => (
            <div key={index} className="flex items-center gap-1.5 sm:gap-2 bg-stone-50/70 p-2 rounded-2xl border border-stone-200">
              <span className="shrink-0 w-7 sm:w-8 text-center font-bold text-amber-800 text-xs sm:text-sm">
                #{index + 1}
              </span>
              <input
                type="text"
                value={chapter}
                onChange={(e) => handleChapterChange(index, e.target.value)}
                placeholder={`${index + 1}장의 제목을 입력하세요`}
                className={`${inputClass} !py-2.5`}
              />
              {/* Move Up */}
              <button
                type="button"
                onClick={() => handleMoveChapterUp(index)}
                disabled={index === 0}
                className="p-2 sm:p-2.5 text-stone-500 hover:text-amber-800 hover:bg-amber-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-stone-500 rounded-xl transition-colors shrink-0"
                title="위로 순서 변경"
                aria-label={`${index + 1}장을 위로 이동`}
              >
                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              {/* Move Down */}
              <button
                type="button"
                onClick={() => handleMoveChapterDown(index)}
                disabled={index === planning.tableOfContents.length - 1}
                className="p-2 sm:p-2.5 text-stone-500 hover:text-amber-800 hover:bg-amber-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-stone-500 rounded-xl transition-colors shrink-0"
                title="아래로 순서 변경"
                aria-label={`${index + 1}장을 아래로 이동`}
              >
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              {/* Delete */}
              <button
                type="button"
                onClick={() => handleRemoveChapter(index)}
                disabled={planning.tableOfContents.length <= 1}
                className="p-2 sm:p-2.5 text-stone-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-stone-400 rounded-xl transition-colors shrink-0"
                title="이 장 삭제"
                aria-label={`${index + 1}장 삭제`}
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Chapter Button */}
        <button
          type="button"
          onClick={handleAddChapter}
          className="w-full mt-2 py-3 px-4 border-2 border-dashed border-stone-300 hover:border-amber-600 hover:bg-amber-50/30 rounded-xl text-stone-700 hover:text-amber-900 font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all min-h-[44px]"
        >
          <Plus className="w-5 h-5" />
          <span>새로운 장(목차) 추가하기</span>
        </button>

        {/* Google Docs writing notice */}
        <div className="mt-3 p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 text-amber-900 text-xs sm:text-sm flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-800 shrink-0" />
          <span>
            <strong>원고 작성 안내:</strong> 수강생 본문 원고는 기획 완료 후 별도의 <strong>Google 문서(Docs)</strong> 등에서 직접 작성하시면 됩니다.
          </span>
        </div>
      </div>
    </div>
  );
};
