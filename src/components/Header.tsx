import React from 'react';
import { BookOpen, Sparkles, RefreshCw, Clock, Lightbulb, Check } from 'lucide-react';
import { FontSizeMode, PresetExample } from '../types/card';
import { PRESET_EXAMPLES } from '../constants/presets';

interface HeaderProps {
  fontSizeMode: FontSizeMode;
  setFontSizeMode: (size: FontSizeMode) => void;
  showTimer: boolean;
  setShowTimer: (show: boolean) => void;
  onSelectPreset: (preset: PresetExample) => void;
  onReset: () => void;
  onOpenTips: () => void;
  onOpenRelatedBooks?: () => void;
  isSavedNotification?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  fontSizeMode,
  setFontSizeMode,
  showTimer,
  setShowTimer,
  onSelectPreset,
  onReset,
  onOpenTips,
  onOpenRelatedBooks,
  isSavedNotification,
}) => {
  const [showPresetsMenu, setShowPresetsMenu] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 bg-amber-900 text-amber-50 shadow-md border-b border-amber-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-200 shadow-inner">
                <BookOpen className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-book">
                    나만의 전자책 기획 카드
                  </h1>
                  <span className="hidden md:inline-flex text-[11px] font-medium bg-amber-800/80 text-amber-200 px-2 py-0.5 rounded-full border border-amber-700/50">
                    성인 작가 워크숍
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-amber-200/90">
                  성인 예비 작가를 위한 첫 걸음 기획 워크시트
                </p>
              </div>
            </div>

            {/* Auto save indicator on mobile */}
            {isSavedNotification && (
              <span className="sm:hidden text-xs flex items-center gap-1 text-emerald-300 font-medium">
                <Check className="w-3.5 h-3.5" /> 자동저장
              </span>
            )}
          </div>

          {/* Quick Controls Toolbar */}
          <div className="flex items-center flex-wrap gap-2 justify-end w-full sm:w-auto">
            {isSavedNotification && (
              <span className="hidden sm:inline-flex text-xs items-center gap-1 text-emerald-300 font-medium bg-amber-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30 mr-1">
                <Check className="w-3.5 h-3.5" /> 자동저장됨
              </span>
            )}

            {/* Font Size Selector for Adult Writers */}
            <div className="flex items-center bg-amber-950/70 border border-amber-700/60 rounded-xl p-0.5 text-xs">
              <span className="px-2 text-amber-300 font-medium text-xs hidden lg:inline">글씨 크기:</span>
              <button
                type="button"
                onClick={() => setFontSizeMode('normal')}
                title="보통 글씨"
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  fontSizeMode === 'normal'
                    ? 'bg-amber-500 text-stone-900 font-bold shadow'
                    : 'text-amber-200 hover:text-white'
                }`}
              >
                보통
              </button>
              <button
                type="button"
                onClick={() => setFontSizeMode('large')}
                title="크게 (추천)"
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  fontSizeMode === 'large'
                    ? 'bg-amber-500 text-stone-900 font-bold shadow'
                    : 'text-amber-200 hover:text-white'
                }`}
              >
                크게
              </button>
              <button
                type="button"
                onClick={() => setFontSizeMode('xlarge')}
                title="아주 크게 (시원한 화면)"
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  fontSizeMode === 'xlarge'
                    ? 'bg-amber-500 text-stone-900 font-bold shadow'
                    : 'text-amber-200 hover:text-white'
                }`}
              >
                더 크게
              </button>
            </div>

            {/* Focus Timer Toggle */}
            <button
              type="button"
              onClick={() => setShowTimer(!showTimer)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all border ${
                showTimer
                  ? 'bg-amber-400 text-stone-950 border-amber-300 font-semibold shadow'
                  : 'bg-amber-950/70 text-amber-200 border-amber-700/60 hover:bg-amber-900 hover:text-white'
              }`}
              title="집중 타이머 열기/닫기"
            >
              <Clock className="w-4 h-4" />
              <span>집중 타이머</span>
            </button>

            {/* Tips Modal Button */}
            <button
              type="button"
              onClick={onOpenTips}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium bg-amber-950/70 text-amber-200 border border-amber-700/60 hover:bg-amber-900 hover:text-white transition-all"
              title="초보 작가 기획 팁 보기"
            >
              <Lightbulb className="w-4 h-4 text-amber-300" />
              <span>작성 팁</span>
            </button>

            {/* Related Books Real-time Search Button */}
            {onOpenRelatedBooks && (
              <button
                type="button"
                onClick={onOpenRelatedBooks}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-900/90 text-emerald-100 hover:bg-emerald-800 hover:text-white border border-emerald-500/50 shadow-xs transition-all"
                title="최근 국내 서점 도서 실시간 조회"
              >
                <BookOpen className="w-4 h-4 text-emerald-300" />
                <span className="hidden md:inline">관련 책 살펴보기</span>
                <span className="md:hidden">관련 책</span>
              </button>
            )}

            {/* Presets dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPresetsMenu(!showPresetsMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 hover:from-amber-500 hover:to-amber-400 shadow transition-all font-semibold"
              >
                <Sparkles className="w-4 h-4" />
                <span>예시 불러오기</span>
              </button>

              {showPresetsMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowPresetsMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-stone-200 py-2 z-50 text-stone-800 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-stone-100">
                      <p className="text-xs font-semibold text-stone-500">
                        초보 작가를 위한 추천 예시 4선
                      </p>
                      <p className="text-[11px] text-stone-400">
                        클릭하면 기획 카드에 자동으로 채워집니다
                      </p>
                    </div>
                    <div className="py-1">
                      {PRESET_EXAMPLES.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            onSelectPreset(preset);
                            setShowPresetsMenu(false);
                          }}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-amber-50 transition-colors flex flex-col group"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-semibold text-stone-800 text-sm group-hover:text-amber-900">
                              {preset.label}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                              {preset.tag}
                            </span>
                          </div>
                          <span className="text-xs text-stone-500 truncate mt-0.5">
                            {preset.data.title}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="pt-1 pb-1 border-t border-stone-100 px-2">
                      <button
                        type="button"
                        onClick={() => {
                          onReset();
                          setShowPresetsMenu(false);
                        }}
                        className="w-full text-center py-2 text-xs font-bold text-amber-800 hover:bg-amber-50 rounded-xl transition-colors"
                      >
                        ✍️ 빈 카드(깨끗한 상태)로 새로 쓰기
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Reset Button */}
            <button
              type="button"
              onClick={onReset}
              className="p-1.5 rounded-xl text-amber-300 hover:text-white hover:bg-amber-950/70 border border-amber-800/80 transition-all"
              title="새로 쓰기 (초기화)"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
