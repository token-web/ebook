import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Send,
  Check,
  RotateCcw,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { BookPlanning, ChatMessage, FontSizeMode } from '../types/card';

interface AITocCoachModalProps {
  planning: BookPlanning;
  isOpen: boolean;
  onClose: () => void;
  onApplyTOC: (chapters: string[]) => void;
  fontSizeMode: FontSizeMode;
  onOpenRelatedBooks?: () => void;
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
}

export const AITocCoachModal: React.FC<AITocCoachModalProps> = ({
  planning,
  isOpen,
  onClose,
  onApplyTOC,
  fontSizeMode,
  onOpenRelatedBooks,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [appliedChapterIdx, setAppliedChapterIdx] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // If an initialPrompt comes in (e.g. from Related Books modal), handle it
  useEffect(() => {
    if (isOpen && initialPrompt) {
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [isOpen, initialPrompt]);

  // Initialize first greeting question if empty
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const author = planning.authorName?.trim() || '예비 작가';
      const hasTopic = Boolean(planning.topic?.trim() || planning.experience?.trim());

      let greeting = '';
      if (hasTopic) {
        greeting = `반갑습니다, ${author} 작가님! 작성해주신 주제("${planning.topic || '기획 내용'}")를 꼼꼼히 확인했습니다.\n\n3~5개 장으로 된 목차 뼈대를 잡기 전에, 먼저 **이번 책에서 독자에게 꼭 들려주고 싶은 특별한 사례나 핵심 아이디어**가 있다면 한 가지만 편하게 말씀해 주시겠어요?`;
      } else {
        greeting = `반갑습니다, ${author} 작가님! 책의 뼈대가 될 목차를 함께 만들기 위해 찾아오셨군요.\n\n먼저 **어떤 주제로 책을 쓰고 싶으신지, 혹은 나누고 싶은 나만의 경험**이 있다면 편하게 한 가지만 짧게 들려주시겠어요?`;
      }

      setMessages([
        {
          id: 'msg-init',
          role: 'assistant',
          content: greeting,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  }, [isOpen, messages.length, planning]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setErrorMessage(null);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      // Send conversation history to server
      const payloadMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat-toc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          planningContext: planning,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `서버 응답 오류 (${res.status})`);
      }

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || '답변을 불러오지 못했습니다.',
        suggestedChapters: data.suggestedChapters,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Failed to chat with AI:', err);
      setErrorMessage(
        err.message || 'AI 코치와의 대화 중 문제가 발생했습니다. 다시 시도해주세요.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleApply = (chapters: string[], msgId: string) => {
    onApplyTOC(chapters);
    setAppliedChapterIdx(msgId);
    setTimeout(() => setAppliedChapterIdx(null), 3000);
  };

  const handleResetChat = () => {
    setMessages([]);
    setErrorMessage(null);
  };

  // Check if any TOC has been suggested in the conversation yet
  const hasSuggestedTOC = messages.some((m) => m.suggestedChapters && m.suggestedChapters.length > 0);

  // Dynamic font sizing
  const textSizeClass =
    fontSizeMode === 'xlarge'
      ? 'text-lg leading-relaxed'
      : fontSizeMode === 'large'
      ? 'text-base leading-relaxed'
      : 'text-sm leading-relaxed';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-hidden animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#fdfbf7] rounded-3xl shadow-2xl flex flex-col h-[90vh] max-h-[850px] border-2 border-amber-600/50 overflow-hidden text-stone-900">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-stone-900 text-amber-50 px-5 sm:px-6 py-4 flex items-center justify-between border-b border-amber-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-book text-white">
                  AI와 목차 만들기
                </h2>
                <span className="text-[11px] bg-amber-500 text-stone-950 font-bold px-2 py-0.5 rounded-full shadow-sm">
                  1:1 기획 코칭
                </span>
              </div>
              <p className="text-xs sm:text-sm text-amber-200/90">
                수강생의 입력과 경험을 바탕으로 질문을 주고받으며 3~5개 장을 완성합니다
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenRelatedBooks && (
              <button
                type="button"
                onClick={onOpenRelatedBooks}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-800/90 hover:bg-amber-700 text-amber-200 hover:text-white text-xs font-bold transition-all border border-amber-600/70 shadow-xs"
                title="국내 서점 최근 관련 도서 실시간 조회"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">관련 책 살펴보기</span>
                <span className="sm:hidden">관련 책</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleResetChat}
              className="p-2 rounded-xl text-amber-200 hover:text-white hover:bg-amber-900/80 transition-colors"
              title="대화 처음부터 다시하기"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-amber-200 hover:text-white hover:bg-amber-900/80 transition-colors"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current Planning Context Summary Banner */}
        <div className="bg-amber-50/90 border-b border-amber-200/80 px-5 py-2.5 text-xs text-stone-700 flex items-center justify-between gap-3 shrink-0">
          <div className="truncate">
            <span className="font-bold text-amber-900">현재 기획:</span>{' '}
            <span className="text-stone-800 font-medium">
              {planning.title ? `[가제: ${planning.title}] ` : ''}
              {planning.topic ? `주제: ${planning.topic}` : '주제 작성 중'}
            </span>
          </div>
          <span className="text-[11px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded shrink-0">
            질문 하나씩 대화
          </span>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#faf7f2]">
          {messages.map((msg) => {
            const isAI = msg.role === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div className="w-9 h-9 rounded-2xl bg-amber-800 text-amber-200 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 ${
                    isAI
                      ? 'bg-white border border-stone-200/90 text-stone-800'
                      : 'bg-amber-800 text-white font-medium ml-auto'
                  }`}
                >
                  {/* Message Text with simple formatting */}
                  <div className={`${textSizeClass} whitespace-pre-wrap`}>
                    {msg.content}
                  </div>

                  {/* If a 3~5 chapter TOC is suggested in this message, show interactive card */}
                  {msg.suggestedChapters && msg.suggestedChapters.length > 0 && (
                    <div className="mt-3 bg-amber-50/80 rounded-2xl p-4 border-2 border-amber-300/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-amber-800" />
                          <span className="font-bold text-sm sm:text-base text-amber-950">
                            제안된 목차 뼈대 (총 {msg.suggestedChapters.length}개 장)
                          </span>
                        </div>
                        <span className="text-xs text-amber-800 font-semibold bg-amber-200/70 px-2 py-0.5 rounded-full">
                          초안 후보
                        </span>
                      </div>

                      {/* Chapters list */}
                      <ol className="space-y-2">
                        {msg.suggestedChapters.map((chapter, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-amber-200/70 shadow-2xs"
                          >
                            <span className="w-6 h-6 rounded-lg bg-amber-700 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-stone-900 text-sm sm:text-base">
                              {chapter}
                            </span>
                          </li>
                        ))}
                      </ol>

                      {/* Action Button: Apply to planning card */}
                      <div className="pt-1 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => handleApply(msg.suggestedChapters!, msg.id)}
                          disabled={appliedChapterIdx === msg.id || isLoading}
                          className={`w-full py-3 px-4 rounded-xl font-bold text-sm sm:text-base transition-all shadow flex items-center justify-center gap-2 ${
                            appliedChapterIdx === msg.id
                              ? 'bg-emerald-600 text-white cursor-default'
                              : 'bg-amber-600 hover:bg-amber-500 text-white hover:shadow-md active:scale-98'
                          }`}
                        >
                          {appliedChapterIdx === msg.id ? (
                            <>
                              <Check className="w-5 h-5" />
                              <span>기획 카드 목차에 반영 완료!</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-amber-200" />
                              <span>✨ 이 목차를 내 기획 카드에 반영하기</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-9 h-9 rounded-2xl bg-amber-800 text-amber-200 flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
              </div>
              <div className="bg-white border border-stone-200 rounded-2xl px-4 py-3 text-stone-600 text-sm flex items-center gap-2 shadow-xs">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>AI 기획 코치가 목차를 다듬고 있습니다...</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{errorMessage}</p>
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  className="mt-1.5 text-xs text-red-800 underline font-bold"
                >
                  다시 전송 시도하기
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-stone-100/90 border-t border-stone-200/90 overflow-x-auto flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-stone-500 shrink-0 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-amber-700" />
            빠른 팁:
          </span>

          {onOpenRelatedBooks && (
            <button
              type="button"
              onClick={onOpenRelatedBooks}
              className="text-xs px-2.5 py-1.5 rounded-full bg-amber-100/90 hover:bg-amber-200 text-amber-950 border border-amber-300 transition-colors whitespace-nowrap font-bold flex items-center gap-1 shadow-2xs"
            >
              <BookOpen className="w-3 h-3 text-amber-800" />
              <span>📚 관련 책 살펴보기</span>
            </button>
          )}

          {!hasSuggestedTOC ? (
            <>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleSendMessage('내가 겪었던 가장 큰 실패와 이를 극복한 과정을 꼭 넣고 싶어요.')}
                className="text-xs px-2.5 py-1.5 rounded-full bg-white hover:bg-amber-100 disabled:opacity-50 text-stone-700 border border-stone-200 hover:border-amber-300 transition-colors whitespace-nowrap"
              >
                💡 실패와 극복 과정
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleSendMessage('초보자가 가장 많이 묻고 실수하는 현실적인 질문 3가지를 다루고 싶어요.')}
                className="text-xs px-2.5 py-1.5 rounded-full bg-white hover:bg-amber-100 disabled:opacity-50 text-stone-700 border border-stone-200 hover:border-amber-300 transition-colors whitespace-nowrap"
              >
                ❓ 초보자의 3가지 질문
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleSendMessage('매일 10분씩 작은 습관을 실천해서 얻은 실제 변화를 보여주고 싶어요.')}
                className="text-xs px-2.5 py-1.5 rounded-full bg-white hover:bg-amber-100 disabled:opacity-50 text-stone-700 border border-stone-200 hover:border-amber-300 transition-colors whitespace-nowrap"
              >
                🌱 10분 작은 습관
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleSendMessage('생각해보니 주제나 다루고 싶은 경험 아이디어를 다른 내용으로 바꾸고 싶어요.')}
                className="text-xs px-2.5 py-1.5 rounded-full bg-white hover:bg-amber-100 disabled:opacity-50 text-amber-900 border border-amber-300 transition-colors whitespace-nowrap font-medium"
              >
                🔄 아이디어 변경하기
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleSendMessage('초보자도 이해하기 쉽게 더 친근하고 쉬운 표현으로 바꿔줘.')}
                className="text-xs px-2.5 py-1.5 rounded-full bg-white hover:bg-amber-100 disabled:opacity-50 text-stone-700 border border-stone-200 hover:border-amber-300 transition-colors whitespace-nowrap font-medium"
              >
                ✨ 더 쉽게 바꿔줘
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleSendMessage('목차의 순서를 바꿔서 실천 노하우가 먼저 나오게 해줘.')}
                className="text-xs px-2.5 py-1.5 rounded-full bg-white hover:bg-amber-100 disabled:opacity-50 text-stone-700 border border-stone-200 hover:border-amber-300 transition-colors whitespace-nowrap font-medium"
              >
                🔄 순서 변경
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleSendMessage('3개 장으로 아주 핵심만 간단하게 압축해줘.')}
                className="text-xs px-2.5 py-1.5 rounded-full bg-white hover:bg-amber-100 disabled:opacity-50 text-stone-700 border border-stone-200 hover:border-amber-300 transition-colors whitespace-nowrap font-medium"
              >
                📖 3장으로 압축
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleSendMessage('5개 장으로 구체적인 실전 사례를 더 채워줘.')}
                className="text-xs px-2.5 py-1.5 rounded-full bg-white hover:bg-amber-100 disabled:opacity-50 text-stone-700 border border-stone-200 hover:border-amber-300 transition-colors whitespace-nowrap font-medium"
              >
                📚 5장으로 풍성하게
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleSendMessage('이 장 하나를 삭제하고 다른 사례를 넣어줘.')}
                className="text-xs px-2.5 py-1.5 rounded-full bg-white hover:bg-amber-100 disabled:opacity-50 text-stone-700 border border-stone-200 hover:border-amber-300 transition-colors whitespace-nowrap font-medium"
              >
                ✂️ 특정 장 삭제/교체
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleSendMessage('생각해보니 주제나 다루고 싶은 경험 아이디어를 다른 내용으로 바꾸고 싶어요.')}
                className="text-xs px-2.5 py-1.5 rounded-full bg-white hover:bg-amber-100 disabled:opacity-50 text-amber-900 border border-amber-300 transition-colors whitespace-nowrap font-medium"
              >
                💡 주제/아이디어 바꾸기
              </button>
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 sm:p-5 bg-white border-t border-stone-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2.5"
          >
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                rows={2}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="답변을 입력하세요 (예: 제 실제 실패담을 꼭 넣고 싶어요, 더 쉽게 바꿔줘 등)..."
                disabled={isLoading}
                className={`w-full rounded-2xl border-2 border-stone-300 bg-stone-50 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:bg-white focus:outline-none resize-none transition-all shadow-inner ${
                  fontSizeMode === 'xlarge'
                    ? 'text-lg'
                    : fontSizeMode === 'large'
                    ? 'text-base'
                    : 'text-sm'
                }`}
              />
              <span className="absolute bottom-2.5 right-3 text-[10px] text-stone-400 hidden sm:inline">
                Enter 전송 / Shift+Enter 줄바꿈
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-5 py-3.5 bg-amber-700 hover:bg-amber-600 disabled:bg-stone-300 text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span className="hidden sm:inline">보내기</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
