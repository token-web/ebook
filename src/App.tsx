import React, { useState, useEffect } from 'react';
import { BookPlanning, FontSizeMode, PresetExample } from './types/card';
import { INITIAL_PLANNING, PRESET_EXAMPLES } from './constants/presets';
import { Header } from './components/Header';
import { ClassTimer } from './components/ClassTimer';
import { CardInputForm } from './components/CardInputForm';
import { PlanningCardView } from './components/PlanningCardView';
import { PresentationModal } from './components/PresentationModal';
import { TipsModal } from './components/TipsModal';
import { AITocCoachModal } from './components/AITocCoachModal';
import { RelatedBooksModal } from './components/RelatedBooksModal';
import { Edit3, CreditCard, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'my_ebook_planning_card_v1';
const FONT_STORAGE_KEY = 'my_ebook_font_size_v1';

export default function App() {
  // Main planning state loaded from localStorage or default initial planning
  const [planning, setPlanning] = useState<BookPlanning>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load from storage:', e);
    }
    return INITIAL_PLANNING;
  });

  // Font size mode preference for adult learners (normal, large, xlarge)
  const [fontSizeMode, setFontSizeMode] = useState<FontSizeMode>(() => {
    try {
      const saved = localStorage.getItem(FONT_STORAGE_KEY);
      if (saved === 'normal' || saved === 'large' || saved === 'xlarge') {
        return saved;
      }
    } catch (e) {
      // default to large for optimal readability
    }
    return 'large';
  });

  // UI state
  const [showTimer, setShowTimer] = useState<boolean>(true);
  const [showTips, setShowTips] = useState<boolean>(false);
  const [showRelatedBooks, setShowRelatedBooks] = useState<boolean>(false);
  const [coachInitialPrompt, setCoachInitialPrompt] = useState<string | null>(null);
  const [showPresentation, setShowPresentation] = useState<boolean>(false);
  const [showAICoach, setShowAICoach] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'input' | 'card'>('input');
  const [showSavedIndicator, setShowSavedIndicator] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Auto-save on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(planning));
      setShowSavedIndicator(true);
      const timer = setTimeout(() => setShowSavedIndicator(false), 2000);
      return () => clearTimeout(timer);
    } catch (e) {
      console.error('Failed to save to storage:', e);
    }
  }, [planning]);

  useEffect(() => {
    try {
      localStorage.setItem(FONT_STORAGE_KEY, fontSizeMode);
    } catch (e) {
      console.error('Failed to save font preference:', e);
    }
  }, [fontSizeMode]);

  const handlePlanningChange = (updated: Partial<BookPlanning>) => {
    setPlanning((prev) => ({
      ...prev,
      ...updated,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleSelectPreset = (preset: PresetExample) => {
    setPlanning({
      authorName: preset.data.authorName,
      title: preset.data.title,
      topic: preset.data.topic,
      experience: preset.data.experience,
      targetReader: preset.data.targetReader,
      coreMessage: preset.data.coreMessage,
      tableOfContents: [...preset.data.tableOfContents],
      updatedAt: new Date().toISOString(),
    });
    showToast(`“${preset.label}” 예시를 기획 카드에 불러왔습니다! ✨`);
  };

  const executeReset = () => {
    setPlanning({
      authorName: '예비 작가',
      title: '',
      topic: '',
      experience: '',
      targetReader: '',
      coreMessage: '',
      tableOfContents: [
        '1장. 시작하며',
        '2장. 나의 이야기',
        '3장. 핵심 노하우',
        '4장. 실천과 변화',
        '5장. 맺음말'
      ],
      updatedAt: new Date().toISOString(),
    });
    setShowResetModal(false);
    showToast('새로운 기획 카드로 초기화되었습니다.');
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col text-stone-800">
      {/* Top Header */}
      <Header
        fontSizeMode={fontSizeMode}
        setFontSizeMode={setFontSizeMode}
        showTimer={showTimer}
        setShowTimer={setShowTimer}
        onSelectPreset={handleSelectPreset}
        onReset={() => setShowResetModal(true)}
        onOpenTips={() => setShowTips(true)}
        onOpenRelatedBooks={() => setShowRelatedBooks(true)}
        isSavedNotification={showSavedIndicator}
      />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-16 right-4 sm:right-8 z-50 animate-in fade-in slide-in-from-top-3 duration-200 pointer-events-none">
          <div className="bg-stone-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-amber-500/60 flex items-center gap-3 max-w-md">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
            <span className="text-sm font-bold text-amber-100">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Focus Writing Timer */}
      {showTimer && <ClassTimer onClose={() => setShowTimer(false)} />}

      {/* Mobile Tab Switcher (Visible on < lg screens) */}
      <div className="lg:hidden sticky top-[57px] z-20 bg-stone-100 border-b border-stone-200 px-4 py-2.5 shadow-sm">
        <div className="grid grid-cols-2 gap-2 bg-stone-200 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveMobileTab('input')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-bold transition-all ${
              activeMobileTab === 'input'
                ? 'bg-amber-800 text-white shadow'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>1. 기획 입력하기</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab('card')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-bold transition-all ${
              activeMobileTab === 'card'
                ? 'bg-amber-800 text-white shadow'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>2. 기획 카드 보기</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Input Form (Desktop: 6 cols, Mobile: based on tab) */}
          <div
            className={`lg:col-span-6 space-y-6 ${
              activeMobileTab === 'input' ? 'block' : 'hidden lg:block'
            }`}
          >
            <CardInputForm
              planning={planning}
              onChange={handlePlanningChange}
              fontSizeMode={fontSizeMode}
              onOpenTips={() => setShowTips(true)}
              onOpenAICoach={() => setShowAICoach(true)}
              onOpenRelatedBooks={() => setShowRelatedBooks(true)}
            />
          </div>

          {/* Right Column: Live Planning Card Preview (Desktop: 6 cols sticky, Mobile: based on tab) */}
          <div
            className={`lg:col-span-6 lg:sticky lg:top-20 ${
              activeMobileTab === 'card' ? 'block' : 'hidden lg:block'
            }`}
          >
            <PlanningCardView
              planning={planning}
              fontSizeMode={fontSizeMode}
              onOpenPresentation={() => setShowPresentation(true)}
              onChange={handlePlanningChange}
              onCopySuccess={(msg) => showToast(msg)}
            />
          </div>
        </div>
      </main>

      {/* Floating Preview Button for Mobile while editing */}
      {activeMobileTab === 'input' && (
        <div className="lg:hidden fixed bottom-5 right-5 z-20">
          <button
            type="button"
            onClick={() => setActiveMobileTab('card')}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-amber-800 hover:bg-amber-700 text-white font-bold shadow-2xl border-2 border-amber-500/50 animate-bounce"
          >
            <CreditCard className="w-5 h-5 text-amber-300" />
            <span>완성된 카드 보기</span>
          </button>
        </div>
      )}

      {/* AI TOC Coach Modal */}
      <AITocCoachModal
        planning={planning}
        isOpen={showAICoach}
        onClose={() => setShowAICoach(false)}
        onOpenRelatedBooks={() => setShowRelatedBooks(true)}
        initialPrompt={coachInitialPrompt}
        onClearInitialPrompt={() => setCoachInitialPrompt(null)}
        onApplyTOC={(chapters) => {
          handlePlanningChange({ tableOfContents: chapters });
          showToast('AI가 제안한 목차가 기획 카드에 반영되었습니다! 🎉');
        }}
        fontSizeMode={fontSizeMode}
      />

      {/* Real-time Related Books Modal */}
      <RelatedBooksModal
        planning={planning}
        isOpen={showRelatedBooks}
        onClose={() => setShowRelatedBooks(false)}
        onContinueToAICoach={(customPrompt) => {
          setShowRelatedBooks(false);
          if (customPrompt) {
            setCoachInitialPrompt(customPrompt);
          }
          setShowAICoach(true);
        }}
        fontSizeMode={fontSizeMode}
      />

      {/* In-App Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border-2 border-stone-200 text-stone-900 space-y-4">
            <h3 className="text-xl font-bold font-book text-stone-900">
              새로운 기획 카드로 새로 쓸까요?
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              지금까지 입력하신 내용이 비워지고 새로운 빈 기획 카드로 시작합니다. 계속하시겠습니까?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={executeReset}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-500 text-white shadow transition-colors"
              >
                새로 쓰기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Presentation Modal */}
      {showPresentation && (
        <PresentationModal
          planning={planning}
          onClose={() => setShowPresentation(false)}
        />
      )}

      {/* Helpful Tips Modal */}
      {showTips && <TipsModal onClose={() => setShowTips(false)} />}

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-stone-200/80 bg-stone-100 text-center text-xs text-stone-500 space-y-1">
        <p className="font-medium text-stone-600">
          나만의 전자책 기획 카드 · 성인 예비 작가를 위한 맞춤형 워크시트
        </p>
        <p className="text-stone-400">
          작성한 내용은 브라우저에 자동 저장되며, 발표 모드와 텍스트 복사로 손쉽게 공유하실 수 있습니다.
        </p>
      </footer>
    </div>
  );
}
