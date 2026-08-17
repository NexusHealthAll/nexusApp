import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { NexusCareLogo } from '@/shared/components/ui/NexusCareLogo';
import { 
  Mail, 
  Shield, 
  Lock, 
  FileText,
  HelpCircle,
  UserCheck
} from 'lucide-react';
import { useAuthStore } from '@/shared/auth/store/authStore';
import apiClient from '@/lib/apiClient';

export function EmailSignup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    if (!email) {
      setError('Please enter your work email');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Store email and health-worker registration flow
      localStorage.setItem('pendingEmail', email);
      useAuthStore.getState().setPendingEmail(email);
      useAuthStore.getState().setActiveAuthFlow({
        role: "health-worker",
        action: "register",
        origin: "health-worker-onboarding",
      });

      // Send registration OTP
      await apiClient.post("/api/v1/clinicians/otp/send", { email });

      // Navigate to OTP verification
      navigate('/auth/verify-otp');
    } catch (error) {
      console.error('Signup error:', error);
      // Fallback navigation so flow remains uninterrupted
      navigate('/auth/verify-otp');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3FAFF] dark:bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Signup Card */}
        <Card className="bg-white border border-gray-200 shadow-xl rounded-3xl overflow-hidden min-h-[85vh] sm:min-h-0 flex flex-col dark:bg-neutral-900 dark:border-neutral-800 dark:shadow-none">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-100 flex-shrink-0 dark:bg-neutral-900 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <NexusCareLogo size="sm" />
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center dark:bg-neutral-800">
                <div className="w-2 h-2 bg-gray-400 rounded-full dark:bg-neutral-500"></div>
              </div>
            </div>
          </div>

          <CardContent className="px-6 py-8 flex-1 flex flex-col justify-center">
            {/* Title */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-onboarding-textPrimary dark:text-neutral-50 mb-2">
                Start your
              </h1>
              <h2 className="text-2xl font-bold text-onboarding-textPrimary dark:text-neutral-50 mb-4">
                professional journey.
              </h2>
              <p className="text-sm text-onboarding-textSecondary dark:text-neutral-400">
                Enter your work email to begin.
              </p>
            </div>

            {/* Email Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-onboarding-textPrimary dark:text-neutral-300 mb-2">
                WORK EMAIL
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="name@medicalcenter.com"
                  className="w-full px-4 py-4 bg-[#E8F4FD] dark:bg-neutral-800 border-0 rounded-xl text-onboarding-textPrimary dark:text-neutral-50 placeholder-onboarding-textSecondary dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-onboarding-primaryBlue"
                />
                <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-onboarding-textSecondary dark:text-neutral-500" />
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            {/* Continue Button */}
            <Button
              onClick={handleContinue}
              disabled={isLoading || !email}
              className="w-full bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue hover:opacity-90 text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl mb-6"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Continue</span>
                </div>
              ) : (
                'Continue →'
              )}
            </Button>

            {/* Security Features */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center">
                  <Shield className="w-3 h-3 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-xs text-onboarding-textSecondary dark:text-neutral-400 font-medium">
                  HIPAA COMPLIANT
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center">
                  <Lock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs text-onboarding-textSecondary dark:text-neutral-400 font-medium">
                  AES-256 ENCRYPTED
                </span>
              </div>
            </div>

            {/* Terms */}
            <p className="text-xs text-onboarding-textSecondary dark:text-neutral-400 text-center leading-relaxed">
              By continuing, you agree to our{' '}
              <span className="text-onboarding-primaryBlue dark:text-[#5AA6D6] font-medium">Terms of Service</span>{' '}
              and{' '}
              <span className="text-onboarding-primaryBlue dark:text-[#5AA6D6] font-medium">Privacy Policy</span>.
            </p>

            {/* Footer Links */}
            <div className="flex justify-center space-x-6 mt-6 pt-6 border-t border-gray-100 dark:border-neutral-800">
              <div className="flex flex-col items-center space-y-1">
                <FileText className="w-5 h-5 text-onboarding-textSecondary dark:text-neutral-500" />
                <span className="text-xs text-onboarding-textSecondary dark:text-neutral-500">Docs</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <HelpCircle className="w-5 h-5 text-onboarding-textSecondary dark:text-neutral-500" />
                <span className="text-xs text-onboarding-textSecondary dark:text-neutral-500">Support</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <UserCheck className="w-5 h-5 text-onboarding-textSecondary dark:text-neutral-500" />
                <span className="text-xs text-onboarding-textSecondary dark:text-neutral-500">Legal</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}