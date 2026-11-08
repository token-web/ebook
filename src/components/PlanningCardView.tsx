import React, { useRef, useState } from 'react';
import {
  Copy,
  Check,
  Download,
  Maximize2,
  Printer,
  Sparkles,
  BookOpen,
  User,
  Target,
  Quote,
  ListOrdered,
  FileText,
  Edit3,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Info
} from 'lucide-react';
import { BookPlanning, FontSizeMode } from '../types/card';
import { toPng } from 'html-to-image';

interface PlanningCardViewProps {
  planning: BookPlanning;
  fontSizeMode: FontSizeMode;
  onOpenPresentation: () => void;
  onChange?: (updated: Partial<BookPlanning>) => void;
  onCopySuccess?: (msg: string) => void;
}

export const PlanningCardView: React.FC<PlanningCardViewProps> = ({
  planning,
  fontSizeMode,
  onOpenPresentation,
  onChange,
  onCopySuccess,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDirectEditing, setIsDirectEditing] = useState(false);
  const [showCopyBanner, setShowCopyBanner] = useState(false);

  // Dynamic font sizing for card contents
  const titleClass =
    fontSizeMode === 'xlarge'
      ? 'text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight font-book'
      : fontSizeMode === 'large'
      ? 'text-xl sm:text-2xl font-extrabold text-stone-900 leading-tight font-book'
      : 'text-lg sm:text-xl font-extrabold text-stone-900 leading-tight font-book';

  const sectionHeadingClass =
    fontSizeMode === 'xlarge'
      ? 'text-base sm:text-lg font-bold text-amber-950 flex items-center gap-2'
      : fontSizeMode === 'large'
      ? 'text-sm sm:text-base font-bold text-amber-950 flex items-center gap-2'
      : 'text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-2';

  const textBodyClass =
    fontSizeMode === 'xlarge'
      ? 'text-base sm:text-lg text-stone-800 leading-relaxed'
      : fontSizeMode === 'large'
      ? 'text-sm sm:text-base text-stone-800 leading-relaxed'
      : 'text-xs sm:text-sm text-stone-800 leading-relaxed';

  const cardInputClass =
    'w-full rounded-xl border-2 border-amber-400 bg-amber-50/40 px-3 py-2 text-stone-900 font-medium focus:border-amber-600 focus:bg-white focus:outline-none transition-all shadow-xs';

  const cardTextareaClass =
    'w-full rounded-xl border-2 border-amber-400 bg-amber-50/40 px-3 py-2 text-stone-900 font-medium focus:border-amber-600 focus:bg-white focus:outline-none transition-all shadow-xs leading-relaxed resize-y';

  // Format clean text optimized for pasting into Google Docs
  const generateGoogleDocsText = () => {
    const author = planning.authorName?.trim() || '예비 작가';
    const title = planning.title?.trim() || '(가제 미입력)';
    const topic = planning.topic?.trim() || '(관심 주제 미입력)';
    const experience = planning.experience?.trim() || '(나의 경험 미입력)';
    const targetReader = planning.targetReader?.trim() || '(예상 독자 미입력)';
    const coreMessage = planning.coreMessage?.trim() || '(핵심 메시지 미입력)';
    
    const chaptersText =
      planning.tableOfContents && planning.tableOfContents.length > 0
        ? planning.tableOfContents
            .map((chapter, idx) => {
              const cleanTitle = chapter.replace(/^\d+장[.\s]*/, '');
              return `${idx + 1}장. ${cleanTitle}`;
            })
            .join('\n')
        : '(목차 없음)';

    return `=======================================================
[나만의 전자책 기획 카드]
=======================================================

■ 작가 닉네임/필명: ${author}
■ 기획 작성일: ${new Date().toLocaleDateString('ko-KR')}

-------------------------------------------------------
1. 가제 (임시 제목)
-------------------------------------------------------
${title}

-------------------------------------------------------
2. 주제 및 나의 경험
-------------------------------------------------------
- 관심 주제: ${topic}
- 나의 실제 경험: ${experience}

-------------------------------------------------------
3. 예상 독자 (누구를 위한 책인가)
-------------------------------------------------------
${targetReader}

-------------------------------------------------------
4. 핵심 메시지 (전하고 싶은 한마디)
-------------------------------------------------------
"${coreMessage}"

-------------------------------------------------------
5. 목차 초안 (장별 흐름 구성)
-------------------------------------------------------
${chaptersText}

=======================================================
※ 본문 원고는 별도의 Google 문서(Docs) 등에서 직접 작성하시면 됩니다.
=======================================================`;
  };

  // Safe copy to clipboard with double-click guard
  const handleCopyText = async () => {
    if (copied) return;
    const textToCopy = generateGoogleDocsText();
    let success = false;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        success = true;
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = textToCopy;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        success = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch (e) {
        console.error('Fallback copy failed:', e);
      }
    }

    if (success) {
      setCopied(true);
      setShowCopyBanner(true);
      if (onCopySuccess) {
        onCopySuccess('Google 문서에 붙여넣기 좋은 형태로 복사되었습니다! 🎉');
      }
      setTimeout(() => setCopied(false), 2500);
      setTimeout(() => setShowCopyBanner(false), 4000);
    }
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current || isExporting) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,
        backgroundColor: '#faf7f2',
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      const safeTitle = (planning.title || '전자책기획카드').replace(/[^a-zA-Z0-9가-힣]/g, '_');
      link.download = `${safeTitle}_기획카드.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Chapter editing helpers on the card
  const handleChapterChange = (index: number, value: string) => {
    if (!onChange) return;
    const updated = [...planning.tableOfContents];
    updated[index] = value;
    onChange({ tableOfContents: updated });
  };

  const handleChapterMoveUp = (index: number) => {
    if (!onChange || index === 0) return;
    const updated = [...planning.tableOfContents];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChange({ tableOfContents: updated });
  };

  const handleChapterMoveDown = (index: number) => {
    if (!onChange || index >= planning.tableOfContents.length - 1) return;
    const updated = [...planning.tableOfContents];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChange({ tableOfContents: updated });
  };

  const handleChapterRemove = (index: number) => {
    if (!onChange || planning.tableOfContents.length <= 1) return;
    const updated = planning.tableOfContents.filter((_, i) => i !== index);
    onChange({ tableOfContents: updated });
  };

  const handleChapterAdd = () => {
    if (!onChange) return;
    const nextIdx = planning.tableOfContents.length + 1;
    onChange({
      tableOfContents: [...planning.tableOfContents, `${nextIdx}장. 새로운 장 제목`],
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar for the Card */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-stone-900 text-stone-100 p-3 sm:p-3.5 rounded-2xl shadow-md no-print">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-sm sm:text-base text-amber-200">
            실시간 기획 카드
          </span>
          <span className="text-[11px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full border border-stone-700 hidden sm:inline">
            자동 저장
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          {/* Toggle Direct Card Edit Mode */}
          {onChange && (
            <button
              type="button"
              onClick={() => setIsDirectEditing(!isDirectEditing)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all border ${
                isDirectEditing
                  ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md ring-2 ring-amber-400/50'
                  : 'bg-stone-800 hover:bg-stone-700 text-amber-200 border-amber-600/40'
              }`}
              title="카드에서 각 항목과 목차를 직접 수정하기"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-300" />
              <span>{isDirectEditing ? '수정 완료' : '카드 직접 수정'}</span>
            </button>
          )}

          {/* Fullscreen Presentation Mode */}
          <button
            type="button"
            onClick={onOpenPresentation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 transition-all border border-stone-700"
            title="전체화면 발표 모드로 크게 보기"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">발표 모드</span>
          </button>

          {/* Copy Formatted Text for Google Docs */}
          <button
            type="button"
            onClick={handleCopyText}
            disabled={copied}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 hover:from-amber-500 hover:to-amber-400'
            }`}
            title="Google 문서에 바로 붙여넣을 수 있는 형태로 복사"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-950" />
                <span>내용 복사 (Google 문서용)</span>
              </>
            )}
          </button>

          {/* Download Image */}
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-300 transition-all disabled:opacity-50"
            title="기획 카드를 이미지(PNG)로 저장"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isExporting ? '저장 중' : '이미지'}</span>
          </button>

          {/* Print */}
          <button
            type="button"
            onClick={handlePrint}
            className="p-1.5 rounded-xl text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-300 transition-all"
            title="인쇄 또는 PDF 저장"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Copy Success Banner */}
      {showCopyBanner && (
        <div className="bg-emerald-50 border-2 border-emerald-400 text-emerald-950 rounded-2xl p-3.5 sm:p-4 shadow-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs sm:text-sm font-semibold">
              <span className="font-bold text-emerald-800">복사 성공!</span> Google 문서(Docs)에 붙여넣기(Ctrl+V / Cmd+V) 하시면 깔끔하게 정돈된 기획서가 완성됩니다.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowCopyBanner(false)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-1"
          >
            닫기
          </button>
        </div>
      )}

      {/* Direct Edit Active Notification Banner */}
      {isDirectEditing && (
        <div className="bg-amber-100/90 border-2 border-amber-400 text-amber-950 rounded-2xl p-3 px-4 text-xs sm:text-sm flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-amber-800 shrink-0" />
            <span>
              <strong>직접 수정 모드:</strong> 카드의 각 항목과 목차를 화면에서 바로 수정하고 있습니다. 입력 내용은 실시간으로 자동 저장됩니다.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsDirectEditing(false)}
            className="px-3 py-1 bg-amber-800 text-white rounded-lg font-bold text-xs shrink-0 hover:bg-amber-700 transition-colors"
          >
            수정 완료
          </button>
        </div>
      )}

      {/* The Actual Physical-like Planning Card */}
      <div
        ref={cardRef}
        className={`planning-card-print bg-[#fdfbf7] rounded-3xl border-2 ${
          isDirectEditing ? 'border-amber-400 ring-2 ring-amber-300/40' : 'border-stone-300/90'
        } shadow-xl overflow-hidden transition-all duration-200 relative text-stone-900`}
      >
        {/* Decorative Top Spine Bookmark Header */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-stone-900 text-amber-50 px-6 py-4 flex items-center justify-between border-b border-amber-950">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm tracking-wider font-book uppercase text-amber-200">
              나만의 전자책 기획 카드
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-amber-200/90 font-medium">
            <User className="w-3.5 h-3.5 text-amber-300" />
            {isDirectEditing && onChange ? (
              <input
                type="text"
                value={planning.authorName}
                onChange={(e) => onChange({ authorName: e.target.value })}
                placeholder="작가 필명/닉네임"
                className="bg-amber-950/80 border border-amber-500 rounded px-2 py-0.5 text-amber-100 text-xs w-28 focus:outline-none"
              />
            ) : (
              <span>작가: {planning.authorName || '예비 작가'}</span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* 1. 가제 (Working Title) */}
          <div className="border-b-2 border-stone-200 pb-5">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-xs">
                항목 1 · 가제 (임시 제목)
              </span>
              {!isDirectEditing && onChange && (
                <button
                  type="button"
                  onClick={() => setIsDirectEditing(true)}
                  className="text-stone-400 hover:text-amber-800 text-[11px] flex items-center gap-1 font-medium transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>수정</span>
                </button>
              )}
            </div>

            {isDirectEditing && onChange ? (
              <input
                type="text"
                value={planning.title}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="책의 임시 제목(가제)을 입력하세요"
                className={`${cardInputClass} text-lg font-bold font-book`}
              />
            ) : (
              <h3 className={titleClass}>
                {planning.title ? (
                  `“${planning.title}”`
                ) : (
                  <span className="text-stone-400 italic font-normal">
                    (가제를 입력해주세요)
                  </span>
                )}
              </h3>
            )}
          </div>

          {/* 2. 주제 (Topic + Experience) */}
          <div className="bg-white/90 rounded-2xl p-5 border border-stone-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className={sectionHeadingClass}>
                <FileText className="w-4 h-4 text-amber-700" />
                <span>항목 2 · 주제 및 나의 경험</span>
              </div>
              {!isDirectEditing && onChange && (
                <button
                  type="button"
                  onClick={() => setIsDirectEditing(true)}
                  className="text-stone-400 hover:text-amber-800 text-[11px] flex items-center gap-1 font-medium transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>수정</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-amber-900 block mb-1">
                  [관심 주제]
                </span>
                {isDirectEditing && onChange ? (
                  <textarea
                    rows={2}
                    value={planning.topic}
                    onChange={(e) => onChange({ topic: e.target.value })}
                    placeholder="관심 주제를 입력하세요"
                    className={cardTextareaClass}
                  />
                ) : (
                  <p className={textBodyClass}>
                    {planning.topic || (
                      <span className="text-stone-400 italic">
                        (관심 주제를 입력해주세요)
                      </span>
                    )}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-stone-100">
                <span className="text-xs font-bold text-stone-700 block mb-1">
                  [나의 실제 경험]
                </span>
                {isDirectEditing && onChange ? (
                  <textarea
                    rows={2}
                    value={planning.experience}
                    onChange={(e) => onChange({ experience: e.target.value })}
                    placeholder="나만의 실제 경험을 입력하세요"
                    className={cardTextareaClass}
                  />
                ) : (
                  <p className={textBodyClass}>
                    {planning.experience || (
                      <span className="text-stone-400 italic">
                        (나만의 실제 경험과 사연을 입력해주세요)
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 3. 예상 독자 (Target Reader) */}
          <div className="bg-white/90 rounded-2xl p-5 border border-stone-200/90 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className={sectionHeadingClass}>
                <Target className="w-4 h-4 text-amber-700" />
                <span>항목 3 · 예상 독자 (누구를 위한 책인가)</span>
              </div>
              {!isDirectEditing && onChange && (
                <button
                  type="button"
                  onClick={() => setIsDirectEditing(true)}
                  className="text-stone-400 hover:text-amber-800 text-[11px] flex items-center gap-1 font-medium transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>수정</span>
                </button>
              )}
            </div>

            {isDirectEditing && onChange ? (
              <textarea
                rows={2}
                value={planning.targetReader}
                onChange={(e) => onChange({ targetReader: e.target.value })}
                placeholder="이 책을 꼭 읽어야 할 독자를 입력하세요"
                className={cardTextareaClass}
              />
            ) : (
              <p className={textBodyClass}>
                {planning.targetReader || (
                  <span className="text-stone-400 italic">
                    (이 책을 꼭 읽어야 할 독자를 입력해주세요)
                  </span>
                )}
              </p>
            )}
          </div>

          {/* 4. 핵심 메시지 (Core Message) */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl p-5 sm:p-6 border-2 border-amber-200/90 shadow-sm space-y-2 relative">
            <div className="flex items-center justify-between">
              <div className={sectionHeadingClass}>
                <Quote className="w-4 h-4 text-amber-700" />
                <span>항목 4 · 핵심 메시지 (전하고 싶은 한마디)</span>
              </div>
              {!isDirectEditing && onChange && (
                <button
                  type="button"
                  onClick={() => setIsDirectEditing(true)}
                  className="text-stone-400 hover:text-amber-800 text-[11px] flex items-center gap-1 font-medium transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>수정</span>
                </button>
              )}
            </div>

            {isDirectEditing && onChange ? (
              <textarea
                rows={2}
                value={planning.coreMessage}
                onChange={(e) => onChange({ coreMessage: e.target.value })}
                placeholder="독자에게 남기고 싶은 핵심 메시지를 입력하세요"
                className={`${cardTextareaClass} font-book italic font-semibold text-amber-950`}
              />
            ) : (
              <blockquote className={`${textBodyClass} font-book italic font-semibold text-amber-950`}>
                {planning.coreMessage ? (
                  `“${planning.coreMessage}”`
                ) : (
                  <span className="text-stone-400 italic font-normal font-sans">
                    (독자에게 남기고 싶은 핵심 메시지를 입력해주세요)
                  </span>
                )}
              </blockquote>
            )}
          </div>

          {/* 5. 목차 초안 (Table of Contents Draft) */}
          <div className="bg-white/90 rounded-2xl p-5 border border-stone-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className={sectionHeadingClass}>
                <ListOrdered className="w-4 h-4 text-amber-700" />
                <span>항목 5 · 목차 초안 (장별 흐름 구성)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500 font-medium">
                  총 {planning.tableOfContents.length}개 장
                </span>
                {!isDirectEditing && onChange && (
                  <button
                    type="button"
                    onClick={() => setIsDirectEditing(true)}
                    className="text-stone-400 hover:text-amber-800 text-[11px] flex items-center gap-1 font-medium transition-colors ml-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>수정</span>
                  </button>
                )}
              </div>
            </div>

            {/* If In Direct Edit Mode: show reordering and inline editing */}
            {isDirectEditing && onChange ? (
              <div className="space-y-2 pt-1">
                {planning.tableOfContents.map((chapter, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 bg-amber-50/50 p-1.5 rounded-xl border border-amber-200/90"
                  >
                    <span className="shrink-0 w-6 text-center font-bold text-amber-800 text-xs">
                      #{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={chapter}
                      onChange={(e) => handleChapterChange(idx, e.target.value)}
                      placeholder={`${idx + 1}장 제목 입력`}
                      className="flex-1 rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-600"
                    />
                    {/* Move Up */}
                    <button
                      type="button"
                      onClick={() => handleChapterMoveUp(idx)}
                      disabled={idx === 0}
                      className="p-1.5 text-stone-500 hover:text-amber-900 disabled:opacity-20 rounded-md hover:bg-amber-100 transition-colors"
                      title="위로 순서 변경"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    {/* Move Down */}
                    <button
                      type="button"
                      onClick={() => handleChapterMoveDown(idx)}
                      disabled={idx === planning.tableOfContents.length - 1}
                      className="p-1.5 text-stone-500 hover:text-amber-900 disabled:opacity-20 rounded-md hover:bg-amber-100 transition-colors"
                      title="아래로 순서 변경"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleChapterRemove(idx)}
                      disabled={planning.tableOfContents.length <= 1}
                      className="p-1.5 text-stone-400 hover:text-red-600 disabled:opacity-20 rounded-md hover:bg-red-50 transition-colors"
                      title="이 장 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleChapterAdd}
                  className="w-full mt-2 py-2 px-3 border border-dashed border-amber-400 bg-amber-50/40 hover:bg-amber-100/60 rounded-xl text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>목차(장) 추가하기</span>
                </button>
              </div>
            ) : (
              <ol className="space-y-2 pt-1">
                {planning.tableOfContents.map((chapter, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-stone-50 transition-colors"
                  >
                    <span className="shrink-0 w-6 h-6 rounded-lg bg-amber-700 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <span className={`${textBodyClass} font-medium text-stone-800`}>
                      {chapter || <span className="text-stone-300 italic">제목 미입력</span>}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        {/* Writing notice at bottom of card */}
        <div className="mx-6 sm:mx-8 mb-4 p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>원고 작성 안내:</strong> 수강생 본문 원고는 별도의 <strong>Google 문서(Docs)</strong> 등에서 직접 작성하시면 됩니다.
          </span>
        </div>

        {/* Card Footer Stamp */}
        <div className="px-6 py-4 bg-stone-100/90 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>성인 예비 작가를 위한 전자책 기획 카드</span>
          </div>
          <div className="font-mono text-[11px]">
            기획 작성일: {new Date().toLocaleDateString('ko-KR')}
          </div>
        </div>
      </div>
    </div>
  );
};
