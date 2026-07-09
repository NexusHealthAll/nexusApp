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
      // Simulate email validation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Store email for next step
      localStorage.setItem('pendingEmail', email);
      
      // Navigate to OTP verification
      navigate('/auth/verify-otp');
    } catch (error) {
      console.error('Signup error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3FAFF] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Signup Card */}
        <Card className="bg-white border border-gray-200 shadow-xl rounded-3xl overflow-hidden min-h-[85vh] sm:min-h-0 flex flex-col">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center justify-between">
              <NexusCareLogo size="sm" />
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>

          <CardContent className="px-6 py-8 flex-1 flex flex-col justify-center">
            {/* Title */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-onboarding-textPrimary mb-2">
                Start your
              </h1>
              <h2 className="text-2xl font-bold text-onboarding-textPrimary mb-4">
                professional journey.
              </h2>
              <p className="text-sm text-onboarding-textSecondary">
                Enter your work email to begin.
              </p>
            </div>

            {/* Email Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-onboarding-textPrimary mb-2">
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
                  className="w-full px-4 py-4 bg-[#E8F4FD] border-0 rounded-xl text-onboarding-textPrimary placeholder-onboarding-textSecondary focus:outline-none focus:ring-2 focus:ring-onboarding-primaryBlue"
                />
                <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-onboarding-textSecondary" />
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
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-xs text-onboarding-textSecondary font-medium">
                  HIPAA COMPLIANT
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <Lock className="w-3 h-3 text-blue-600" />
                </div>
                <span className="text-xs text-onboarding-textSecondary font-medium">
                  AES-256 ENCRYPTED
                </span>
              </div>
            </div>

            {/* Terms */}
            <p className="text-xs text-onboarding-textSecondary text-center leading-relaxed">
              By continuing, you agree to our{' '}
              <span className="text-onboarding-primaryBlue font-medium">Terms of Service</span>{' '}
              and{' '}
              <span className="text-onboarding-primaryBlue font-medium">Privacy Policy</span>.
            </p>

            {/* Footer Links */}
            <div className="flex justify-center space-x-6 mt-6 pt-6 border-t border-gray-100">
              <div className="flex flex-col items-center space-y-1">
                <FileText className="w-5 h-5 text-onboarding-textSecondary" />
                <span className="text-xs text-onboarding-textSecondary">Docs</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <HelpCircle className="w-5 h-5 text-onboarding-textSecondary" />
                <span className="text-xs text-onboarding-textSecondary">Support</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <UserCheck className="w-5 h-5 text-onboarding-textSecondary" />
                <span className="text-xs text-onboarding-textSecondary">Legal</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}