import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { NexusCareLogo } from '@/shared/components/ui/NexusCareLogo';
import { Stethoscope, Building2, ArrowRight } from 'lucide-react';

type Role = 'health-worker' | 'hospital' | null;

export function RoleSelection() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleContinue = async () => {
    if (!selectedRole) return;

    setIsLoading(true);

    try {
      // Store selected role
      localStorage.setItem('selectedRole', selectedRole);
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Route based on selected role
      if (selectedRole === 'health-worker') {
        // Route to auth onboarding pipeline (unprotected)
        navigate('/auth/onboarding/professional-profile');
      } else if (selectedRole === 'hospital') {
        // Create temporary auth token for hospital administrator
        const tempAuthToken = `temp_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const tempUserData = {
          id: `user_${Date.now()}`,
          fullName: 'Hospital Administrator',
          email: localStorage.getItem('pendingEmail') || '',
          role: 'hospital-admin',
          onboardingComplete: false, // They still need to complete onboarding
          createdAt: new Date().toISOString()
        };
        
        console.log('Creating hospital admin auth:', { tempAuthToken, tempUserData });
        
        localStorage.setItem('authToken', tempAuthToken);
        localStorage.setItem('userData', JSON.stringify(tempUserData));
        localStorage.removeItem('pendingEmail');
        localStorage.removeItem('emailVerified');
        
        // Route to hospital onboarding flow
        navigate('/hospital/onboarding/registration');
      }
    } catch (error) {
      console.error('Role selection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3FAFF] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Main Role Selection Card */}
        <Card className="bg-white border border-gray-200 shadow-xl rounded-3xl overflow-hidden min-h-[90vh] sm:min-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center justify-between">
              <NexusCareLogo size="sm" />
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white px-6 pb-2">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div className="bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue h-1 rounded-full w-3/4"></div>
            </div>
          </div>

          <CardContent className="px-6 py-8 flex-1 flex flex-col justify-center">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-onboarding-textPrimary mb-4">
                Choose Your Professional Role
              </h1>
              <p className="text-sm text-onboarding-textSecondary px-4">
                Select your medical specialization to view clinical opportunities tailored to your expertise.
              </p>
            </div>

            {/* Role Cards - Two Column Layout */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {/* Health Workers Card */}
              <div
                onClick={() => handleRoleSelect('health-worker')}
                className={`p-6 rounded-xl border cursor-pointer transition-all duration-200 text-center ${
                  selectedRole === 'health-worker'
                    ? 'border-onboarding-primaryBlue bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                    selectedRole === 'health-worker'
                      ? 'bg-blue-100'
                      : 'bg-blue-50'
                  }`}>
                    <Stethoscope className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-onboarding-textPrimary mb-2 text-base">
                    Health Workers
                  </h3>
                  <p className="text-sm text-onboarding-textSecondary leading-relaxed mb-4">
                    Medical professionals providing direct patient care, consultations, and clinical services.
                  </p>
                  
                  {/* Feature List */}
                  <div className="space-y-2 text-left w-full">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-onboarding-textSecondary">Direct patient consultations</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-onboarding-textSecondary">Clinical assessments</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-onboarding-textSecondary">Treatment planning</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hospital Administrator Card */}
              <div
                onClick={() => handleRoleSelect('hospital')}
                className={`p-6 rounded-xl border cursor-pointer transition-all duration-200 text-center ${
                  selectedRole === 'hospital'
                    ? 'border-onboarding-primaryBlue bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                    selectedRole === 'hospital'
                      ? 'bg-green-100'
                      : 'bg-green-50'
                  }`}>
                    <Building2 className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-onboarding-textPrimary mb-2 text-base">
                    Hospital Administrator
                  </h3>
                  <p className="text-sm text-onboarding-textSecondary leading-relaxed mb-4">
                    Healthcare facility management, staff coordination, and operational oversight.
                  </p>
                  
                  {/* Feature List */}
                  <div className="space-y-2 text-left w-full">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-onboarding-textSecondary">Staff management</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-onboarding-textSecondary">Shift scheduling</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-onboarding-textSecondary">Resource allocation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <Button
              onClick={handleContinue}
              disabled={!selectedRole || isLoading}
              className={`w-full font-medium py-4 rounded-xl transition-all duration-200 ${
                selectedRole
                  ? 'bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue text-white hover:opacity-90 shadow-md'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Continue</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>

            {/* Terms */}
            <p className="text-xs text-onboarding-textSecondary text-center mt-6 leading-relaxed">
              Need help choosing your role?{' '}
              <button className="text-secondary-600 hover:text-secondary-700 font-medium">
                Contact Support
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}