import React from 'react';
import { BirthdayProvider, useBirthday } from './context/BirthdayContext';
import { Navbar } from './components/Navbar';
import { FloatingElements } from './components/FloatingElements';
import { WelcomeScreen } from './components/steps/WelcomeScreen';
import { StepRecipient } from './components/steps/StepRecipient';
import { StepQuestions } from './components/steps/StepQuestions';
import { StepMemories } from './components/steps/StepMemories';
import { StepLetter } from './components/steps/StepLetter';
import { StepReview } from './components/steps/StepReview';
import { MagicalExperience } from './components/surprise/MagicalExperience';
import { AdminDashboard } from './components/admin/AdminDashboard';

const AppContent: React.FC = () => {
  const { currentStep, isAdminMode, setIsAdminMode } = useBirthday();

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
        return <StepReview />;
      case 7:
        return <MagicalExperience />;
      default:
        return <WelcomeScreen />;
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col font-sans">
      {/* Navbar */}
      <Navbar />

      {/* Floating decorative ambient background (when in creation flow) */}
      {currentStep < 7 && <FloatingElements />}

      {/* Main Content Area */}
      <main className="flex-1 relative z-10">
        {renderStep()}
      </main>

      {/* Admin Dashboard Overlay */}
      {isAdminMode && (
        <AdminDashboard onClose={() => setIsAdminMode(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <BirthdayProvider>
      <AppContent />
    </BirthdayProvider>
  );
}
