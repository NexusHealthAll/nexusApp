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
      <div className="w-full max-w-md">
        {/* Main Role Selection Card */}
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

          {/* Progress Bar */}
          <div className="bg-white px-6 pb-2">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div className="bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue h-1 rounded-full w-3/4"></div>
            </div>
          </div>

          <CardContent className="px-6 py-8 flex-1 flex flex-col justify-center">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-onboarding-textPrimary mb-2">
                How will you use
              </h1>
              <h2 className="text-2xl font-bold text-onboarding-textPrimary mb-4">
                NexusCare?
              </h2>
              <p className="text-sm text-onboarding-textSecondary">
                Select your primary professional role to customize your workspace.
              </p>
            </div>

            {/* Role Cards */}
            <div className="space-y-4 mb-8">
              {/* Healthcare Worker Card */}
              <div
                onClick={() => handleRoleSelect('health-worker')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                  selectedRole === 'health-worker'
                    ? 'border-onboarding-primaryBlue bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedRole === 'health-worker'
                      ? 'bg-onboarding-primaryBlue text-white'
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-onboarding-textPrimary mb-1">
                      Healthcare Worker
                    </h3>
                    <p className="text-sm text-onboarding-textSecondary leading-relaxed">
                      For doctors, nurses, and specialists managing patient care and medical records.
                    </p>
                  </div>
                </div>
              </div>

              {/* Hospital Facility Card */}
              <div
                onClick={() => handleRoleSelect('hospital')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                  selectedRole === 'hospital'
                    ? 'border-onboarding-primaryBlue bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedRole === 'hospital'
                      ? 'bg-onboarding-primaryBlue text-white'
                      : 'bg-green-100 text-green-600'
                  }`}>
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-onboarding-textPrimary mb-1">
                      Hospital Facility
                    </h3>
                    <p className="text-sm text-onboarding-textSecondary leading-relaxed">
                      For clinics and medical centers managing operations, staffing, and inventory.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <Button
              onClick={handleContinue}
              disabled={!selectedRole || isLoading}
              className={`w-full font-semibold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl ${
                selectedRole
                  ? 'bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue text-white hover:opacity-90'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
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
              By continuing, you agree to our terms of service and clinical compliance guidelines.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}