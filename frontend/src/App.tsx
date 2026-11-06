import React, { useState, useEffect } from 'react';
import { BirthdayProvider, useBirthday } from './context/BirthdayContext';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { Navbar } from './components/Navbar';
import { FloatingElements } from './components/FloatingElements';

// Steps
import { WelcomeScreen } from './components/steps/WelcomeScreen';
import { StepRecipient } from './components/steps/StepRecipient';
import { StepQuestions } from './components/steps/StepQuestions';
import { StepMemories } from './components/steps/StepMemories';
import { StepLetter } from './components/steps/StepLetter';
import { StepVoice } from './components/steps/StepVoice';
import { StepTheme } from './components/steps/StepTheme';
import { StepReview } from './components/steps/StepReview';

// Dedicated Recipient Experience & Creator Dashboard
import { RecipientExperience } from './components/surprise/RecipientExperience';
import { CreatorDashboard } from './components/dashboard/CreatorDashboard';
import { ShareManagerModal } from './components/dashboard/ShareManagerModal';
import { AdminDashboard } from './components/admin/AdminDashboard';

const AppContent: React.FC = () => {
  const { 
    currentStep, 
    viewMode, 
    setViewMode, 
    goToStep, 
    isAdminMode, 
    setIsAdminMode,
    shareModalSurprise,
    closeShareModal
  } = useBirthday();

  const [recipientSlug, setRecipientSlug] = useState<string | null>(null);

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path.startsWith('/s/')) {
        const s = path.slice(3).split('/')[0];
        if (s) setRecipientSlug(s);
      } else if (path.startsWith('/surprise/')) {
        const s = path.slice(10).split('/')[0];
        if (s) setRecipientSlug(s);
      } else {
        setRecipientSlug(null);
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // ── 1. STRICT SEPARATION: RECIPIENT EXPERIENCE ROUTE ──
  // If the user visits /s/:slug or /surprise/:slug, load ONLY the pristine RecipientExperience.
  // ABSOLUTELY NO Navbar, NO Admin Dashboard, NO Share Buttons, NO Creator Controls!
  if (recipientSlug) {
    return <RecipientExperience slug={recipientSlug} />;
  }

  // ── 2. CREATOR DASHBOARD VIEW ──
  if (viewMode === 'dashboard') {
    return (
      <div className="relative min-h-screen flex flex-col font-sans bg-[#FFF6F0]">
        <Navbar />
        <main className="flex-1 relative z-10">
          <CreatorDashboard
            onCreateNew={() => {
              setViewMode('wizard');
              goToStep(2);
            }}
            onPreviewSurprise={(slug) => {
              window.open(`/s/${slug}`, '_blank');
            }}
          />
        </main>

        {/* Global Share Modal */}
        {shareModalSurprise && (
          <ShareManagerModal
            surprise={shareModalSurprise}
            isOpen={Boolean(shareModalSurprise)}
            onClose={closeShareModal}
          />
        )}

        {/* Admin Dashboard Overlay */}
        {isAdminMode && (
          <AdminDashboard onClose={() => setIsAdminMode(false)} />
        )}
      </div>
    );
  }

  // ── 3. CREATOR WIZARD STEPS (1 TO 8) ──
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeScreen />;
      case 2:
        return <StepRecipient />;
      case 3:
        return <StepQuestions />;
      case 4:
        return <StepMemories />;
      case 5:
        return <StepLetter />;
      case 6:
        return <StepVoice />;
      case 7:
        return <StepTheme />;
      case 8:
        return <StepReview />;
      default:
        return <WelcomeScreen />;
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col font-sans bg-[#FFF6F0]">
      {/* Creator Navigation Bar */}
      <Navbar />

      {/* Floating Ambient Elements */}
      <FloatingElements />

      {/* Main Wizard Form Area */}
      <main className="flex-1 relative z-10">
        {renderStep()}
      </main>

      {/* Global Share Modal (e.g. after publishing) */}
      {shareModalSurprise && (
        <ShareManagerModal
          surprise={shareModalSurprise}
          isOpen={Boolean(shareModalSurprise)}
          onClose={closeShareModal}
        />
      )}

      {/* Admin Dashboard Overlay */}
      {isAdminMode && (
        <AdminDashboard onClose={() => setIsAdminMode(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BirthdayProvider>
        <AppContent />
        <AuthModal />
      </BirthdayProvider>
    </AuthProvider>
  );
}
