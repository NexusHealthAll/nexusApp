import { useState } from 'react';
import { LicenseInformationForm } from './LicenseInformationForm';
import { SpecialtySelectionForm } from './SpecialtySelectionForm';
import { PaystackPayoutForm } from './PaystackPayoutForm';

interface VerificationSetupFlowProps {
  onComplete?: () => void;
}

type Step = 'license' | 'specialty' | 'payout' | 'complete';

export function VerificationSetupFlow({ onComplete }: VerificationSetupFlowProps) {
  const [currentStep, setCurrentStep] = useState<Step>('license');

  const handleStepComplete = (nextStep: Step) => {
    setCurrentStep(nextStep);
  };

  const handleComplete = () => {
    setCurrentStep('complete');
    if (onComplete) {
      onComplete();
    }
  };

  if (currentStep === 'complete') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Verification Setup Complete!
          </h1>
          <p className="text-neutral-600 mb-6">
            Your profile is now under review. You'll receive an email notification once approved.
          </p>
          <button
            onClick={() => window.location.href = '/medical-staff/dashboard'}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  switch (currentStep) {
    case 'license':
      return (
        <LicenseInformationForm
          onNext={() => handleStepComplete('specialty')}
        />
      );
    
    case 'specialty':
      return (
        <SpecialtySelectionForm
          onNext={() => handleStepComplete('payout')}
          onBack={() => handleStepComplete('license')}
        />
      );
    
    case 'payout':
      return (
        <PaystackPayoutForm
          onComplete={handleComplete}
          onBack={() => handleStepComplete('specialty')}
        />
      );
    
    default:
      return null;
  }
}