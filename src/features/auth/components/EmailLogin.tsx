import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { NexusCareLogo } from '@/shared/components/ui/NexusCareLogo';
import { Mail } from 'lucide-react';

export function EmailLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate OTP sending
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store email for OTP verification
      localStorage.setItem('pendingEmail', email);
      
      // Navigate to OTP verification
      navigate('/auth/verify-otp');
    } catch (error) {
      console.error('OTP send error:', error);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    
    if (error) {
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-[#F3FAFF] flex flex-col items-center justify-center p-6">
      {/* Large Logo Section */}
      <div className="text-center mb-16">
        <div className="mb-6 flex justify-center">
          <NexusCareLogo size="xl" />
        </div>
        <p className="text-onboarding-textSecondary text-lg font-medium">Clinical Precision. Digital Care.</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md">
        <Card className="bg-white shadow-md border-0 rounded-2xl overflow-hidden">
          {/* Blue Header Bar */}
          <div className="h-1 bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue"></div>
          
          <CardContent className="p-8">
            {/* Welcome Section */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-onboarding-textPrimary mb-2">Welcome Back</h1>
              <p className="text-onboarding-textSecondary">Enter your email address to access your workspace</p>
            </div>

            <form onSubmit={handleSendOTP} className="space-y-6">
              {/* Email Address Section */}
              <div className="space-y-3">
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                  Email Address
                </label>
                
                {/* Email Input Container */}
                <div className="flex items-center gap-2.5 rounded-lg bg-onboarding-inputBackground px-3 py-2.5">
                  {/* Email Icon */}
                  <Mail className="h-4 w-4 text-secondary-600 flex-shrink-0" />
                  
                  {/* Email Input */}
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 outline-none"
                    placeholder="enter email"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
              </div>

              {/* Continue Button */}
              <Button
                type="submit"
                disabled={isLoading || !email.trim()}
                isLoading={isLoading}
                className="w-full rounded-lg bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue py-3 text-sm font-semibold uppercase tracking-widest text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                Continue →
              </Button>

              {/* Security Notice */}
              <div className="flex items-center justify-center space-x-2 text-sm text-onboarding-textSecondary">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Secure OTP will be sent to your email.</span>
              </div>
            </form>

            {/* Support Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-onboarding-textSecondary">
                Need help accessing your account?{' '}
                <button className="text-secondary-600 hover:text-secondary-700 font-medium">
                  Support
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Text */}
        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-400 uppercase tracking-wider font-medium">
            Trusted by Healthcare Professionals Across Nigeria
          </p>
        </div>
      </div>
    </div>
  );
}