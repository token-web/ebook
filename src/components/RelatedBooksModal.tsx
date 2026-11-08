import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  BookOpen,
  ExternalLink,
  Calendar,
  User,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Info,
  Loader2
} from 'lucide-react';
import { BookPlanning, BookSearchData, FontSizeMode } from '../types/card';

interface RelatedBooksModalProps {
  planning: BookPlanning;
  isOpen: boolean;
  onClose: () => void;
  onContinueToAICoach?: (customPrompt?: string) => void;
  fontSizeMode: FontSizeMode;
}

export const RelatedBooksModal: React.FC<RelatedBooksModalProps> = ({
  planning,
  isOpen,
  onClose,
  onContinueToAICoach,
  fontSizeMode,
}) => {
  const [searchTopic, setSearchTopic] = useState(planning.topic || planning.title || '일상 실용 글쓰기');
  const [isLoading, setIsLoading] = useState(false);
  const [searchData, setSearchData] = useState<BookSearchData | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Sync initial topic when modal opens
  useEffect(() => {
    if (isOpen) {
      const defaultQuery = planning.topic || planning.title || '직장인 일상 글쓰기 에세이';
      setSearchTopic(defaultQuery);
      if (!searchData) {
        handleSearch(defaultQuery);
      }
    }
  }, [isOpen]);

  const handleSearch = async (overrideQuery?: string) => {
    const queryToUse = (overrideQuery || searchTopic).trim();
    if (!queryToUse) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch('/api/search-books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: queryToUse,
          field: planning.topic,
          experience: planning.experience,
          targetReader: planning.targetReader,
          coreMessage: planning.coreMessage,
        }),
      });

      if (!res.ok) {
        throw new Error(`서버 응답 오류 (${res.status})`);
      }

      const data: BookSearchData = await res.json();
      setSearchData(data);
    } catch (err: any) {
      console.error('Failed to search books:', err);
      const today = new Date();
      const fallbackDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
      setSearchData({
        success: false,
        query: queryToUse,
        inquiryDate: fallbackDate,
        books: [],
        errorMessage: '검색 연결에 실패했습니다. 검색 없이도 나만의 고유한 경험으로 목차 대화를 계속하실 수 있습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleTransferToAICoach = () => {
    onClose();
    if (onContinueToAICoach) {
      if (searchData && searchData.books.length > 0) {
        const bookTitles = searchData.books.map((b) => `《${b.title}》`).join(', ');
        const prompt = `최근 국내 서점에서 살펴본 관련 도서(${bookTitles})의 '독자에게 말을 거는 방식'과 '장 전개 방식' 아이디어를 참고하여, 남의 책을 흉내내지 않고 제 고유한 경험을 살린 새로운 3~5장 목차를 만들고 싶어요.`;
        onContinueToAICoach(prompt);
      } else {
        onContinueToAICoach();
      }
    }
  };

  const handleSkipSearch = () => {
    onClose();
    if (onContinueToAICoach) {
      onContinueToAICoach();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-hidden animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#fdfbf7] rounded-3xl shadow-2xl flex flex-col h-[90vh] max-h-[850px] border-2 border-stone-300 overflow-hidden text-stone-900">
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 px-5 sm:px-6 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-book text-white">
                  관련 책 살펴보기
                </h2>
                <span className="text-[11px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                  실시간 Google 검색 연결
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-300">
                국내 서점에서 확인된 실제 도서의 소통 방식과 장 전개 방식을 살펴봅니다
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Inquiry Date Bar */}
        <div className="p-4 sm:p-5 bg-white border-b border-stone-200 shrink-0 space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchTopic}
                onChange={(e) => setSearchTopic(e.target.value)}
                placeholder="검색할 주제나 분야를 입력하세요 (예: 직장인 번아웃 글쓰기, 시니어 일상 등)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-amber-600 focus:outline-none bg-stone-50 focus:bg-white transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !searchTopic.trim()}
              className="px-4 sm:px-5 py-2.5 bg-amber-700 hover:bg-amber-600 disabled:bg-stone-300 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow flex items-center gap-1.5 shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>조회 중...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>실시간 조회</span>
                </>
              )}
            </button>
          </form>

          {/* Verification & Rules Compliance Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60">
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-amber-800" />
              <span>
                조회 기준일: <strong>{searchData?.inquiryDate || new Date().toISOString().slice(0, 10).replace(/-/g, '.')}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-500">
              <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>
                출처 확인 도서만 표시 · 미확인 순위(베스트셀러 등) 미표기 · 본문/목차 무단 복사 금지
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#faf7f2]">
          {isLoading && (
            <div className="py-16 text-center space-y-4">
              <div className="inline-flex p-4 rounded-full bg-amber-100 text-amber-800 animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-800">
                  국내 서점의 확인 가능한 도서를 실시간 검색 중입니다
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Google 검색 연결을 통해 실제 출간된 책과 구성 아이디어를 분석하고 있습니다...
                </p>
              </div>
            </div>
          )}

          {!isLoading && hasSearched && searchData && (
            <>
              {/* If books found */}
              {searchData.books.length > 0 ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>확인된 최근 출간 도서 ({searchData.books.length}권)</span>
                    </h3>
                    <span className="text-xs text-stone-500">
                      실시간 검색 확인 완료
                    </span>
                  </div>

                  {/* Book Cards */}
                  <div className="space-y-4">
                    {searchData.books.map((book, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm space-y-3 hover:border-amber-300 transition-colors"
                      >
                        {/* Title and Author Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="w-5 h-5 rounded-md bg-stone-800 text-amber-300 text-xs font-bold flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <h4 className="font-bold text-base sm:text-lg text-stone-900 leading-snug">
                                《{book.title}》
                              </h4>
                              {book.publisher && (
                                <span className="text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-medium">
                                  {book.publisher}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-stone-600 pl-7">
                              <span className="flex items-center gap-1 font-medium">
                                <User className="w-3.5 h-3.5 text-stone-400" />
                                저자: {book.author}
                              </span>
                              <span>·</span>
                              <span className="flex items-center gap-1 text-stone-400">
                                <Calendar className="w-3.5 h-3.5" />
                                조회일: {book.inquiryDate}
                              </span>
                            </div>
                          </div>

                          {/* Source Link */}
                          {book.sourceUrl && (
                            <a
                              href={book.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors"
                              title="서점 또는 도서 출처 링크 열기"
                            >
                              <span>출처 보기</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>

                        {/* Insights on Style & Chapter Structure */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm">
                          {book.toneInsight && (
                            <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/80 space-y-1">
                              <span className="font-bold text-stone-800 block text-xs flex items-center gap-1">
                                💬 독자에게 말을 거는 방식
                              </span>
                              <p className="text-stone-700 leading-relaxed">
                                {book.toneInsight}
                              </p>
                            </div>
                          )}

                          {book.structureInsight && (
                            <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/80 space-y-1">
                              <span className="font-bold text-stone-800 block text-xs flex items-center gap-1">
                                📐 장 전개 방식
                              </span>
                              <p className="text-stone-700 leading-relaxed">
                                {book.structureInsight}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* General Structuring Insights & Advice */}
                  {searchData.generalInsights && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-2xl p-5 border-2 border-amber-300 space-y-4">
                      <div className="flex items-center gap-2 text-amber-950 font-bold text-sm sm:text-base">
                        <Sparkles className="w-4 h-4 text-amber-700" />
                        <span>출판 기획 관점의 일반적 구성 아이디어</span>
                      </div>

                      <div className="space-y-3 text-xs sm:text-sm text-stone-800">
                        {searchData.generalInsights.toneSummary && (
                          <div>
                            <span className="font-bold text-amber-900 block mb-0.5">
                              🗣️ 독자와 소통하는 문체 (톤앤매너) 요약:
                            </span>
                            <p className="leading-relaxed bg-white/70 p-2.5 rounded-xl border border-amber-200/60">
                              {searchData.generalInsights.toneSummary}
                            </p>
                          </div>
                        )}

                        {searchData.generalInsights.structureSummary && (
                          <div>
                            <span className="font-bold text-amber-900 block mb-0.5">
                              📑 3~5개 장 전개 뼈대 요약:
                            </span>
                            <p className="leading-relaxed bg-white/70 p-2.5 rounded-xl border border-amber-200/60">
                              {searchData.generalInsights.structureSummary}
                            </p>
                          </div>
                        )}

                        {searchData.generalInsights.adviceForAuthor && (
                          <div>
                            <span className="font-bold text-amber-900 block mb-0.5">
                              💡 작가님만의 고유한 목차를 만들기 위한 조언:
                            </span>
                            <p className="leading-relaxed bg-amber-100/70 p-2.5 rounded-xl border border-amber-300/80 font-medium text-amber-950">
                              {searchData.generalInsights.adviceForAuthor}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* No books found or failed connection */
                <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200/80 text-center space-y-4 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-6 h-6 text-amber-700" />
                  </div>
                  <div className="space-y-2 max-w-lg mx-auto">
                    <h3 className="text-base sm:text-lg font-bold text-stone-900">
                      확인 가능한 책을 찾지 못했거나 연결이 원활하지 않습니다
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                      {searchData.errorMessage ||
                        '검색 결과가 없어도 괜찮습니다. 전자책 기획에서 가장 중요한 것은 남의 책이 아닌 작가님 본인의 생생한 경험입니다.'}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleSearch('일상 에세이 글쓰기 노하우')}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>기본 글쓰기 키워드로 다시 조회</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSkipSearch}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold shadow transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>검색 없이 나만의 목차 대화 계속하기</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-white border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleSkipSearch}
            className="w-full sm:w-auto text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 px-4 py-2.5 rounded-xl hover:bg-stone-100 transition-colors text-center"
          >
            검색 결과 닫고 계속 작성하기
          </button>

          <button
            type="button"
            onClick={handleTransferToAICoach}
            className="w-full sm:w-auto px-6 py-3 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>이 아이디어를 참고해 AI와 목차 대화하기</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
