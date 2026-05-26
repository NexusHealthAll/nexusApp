import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button';
import { NexusCareLogo } from '@/shared/components/ui/NexusCareLogo';
import { 
  Check, 
  RefreshCw,
  ArrowRight,
  Lock,
  BarChart3,
  Repeat
} from 'lucide-react';

export function EmailVerificationSuccess() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleContinueToDashboard = async () => {
    setIsLoading(true);
    
    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to role selection or dashboard based on user type
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.role === 'hospital-admin') {
          navigate('/hospital/dashboard');
        } else {
          navigate('/auth/role-selection');
        }
      } else {
        navigate('/auth/role-selection');
      }
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3FAFF] flex flex-col">
      {/* Header with Logo */}
      <div className="bg-white px-6 py-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          <NexusCareLogo size="sm" />
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="w-full max-w-md mx-auto text-center">
          {/* Success Icon */}
          <div className="mx-auto mb-8 relative">
            <div className="w-28 h-28 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl flex items-center justify-center mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center">
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-onboarding-textPrimary mb-2">
            Email Verification
          </h1>
          <h2 className="text-3xl font-bold text-[#0EA5E9] mb-6">
            Confirmed.
          </h2>

          {/* Description */}
          <p className="text-base text-onboarding-textSecondary mb-10 leading-relaxed px-2">
            Your email identity has been successfully mapped to our secure clinician network.
          </p>

          {/* Feature List */}
          <div className="space-y-6 mb-10">
            {/* Secure Access */}
            <div className="flex items-start space-x-4 text-left bg-blue-50 p-4 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Lock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-onboarding-textPrimary text-base">
                  Secure Access
                </h3>
                <p className="text-sm text-onboarding-textSecondary leading-relaxed mt-1">
                  Multi-layer encryption active on your account.
                </p>
              </div>
            </div>

            {/* Advanced Insights */}
            <div className="flex items-start space-x-4 text-left bg-green-50 p-4 rounded-xl">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-onboarding-textPrimary text-base">
                  Advanced Insights
                </h3>
                <p className="text-sm text-onboarding-textSecondary leading-relaxed mt-1">
                  Real-time clinical data and patient performance analytics.
                </p>
              </div>
            </div>

            {/* Automatic Syncing */}
            <div className="flex items-start space-x-4 text-left bg-purple-50 p-4 rounded-xl">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Repeat className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-onboarding-textPrimary text-base">
                  Automatic Syncing
                </h3>
                <p className="text-sm text-onboarding-textSecondary leading-relaxed mt-1">
                  Cross-platform integration with clinical terminals.
                </p>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleContinueToDashboard}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] hover:from-[#0284C7] hover:to-[#0369A1] text-white font-semibold py-5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-base"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span>Continue to Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Footer with Verification ID */}
      <div className="bg-white px-6 py-6 border-t border-gray-100 flex-shrink-0">
        <p className="text-sm text-gray-400 font-mono tracking-wider text-center">
          VERIFICATION ID: NX-992-KLR
        </p>
      </div>
    </div>
  );
}