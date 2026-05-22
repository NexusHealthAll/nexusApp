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
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6 flex justify-center">
            <NexusCareLogo size="lg" />
          </div>
          <h1 className="text-3xl font-bold text-onboarding-textPrimary mb-4">
            Choose Your Professional Role
          </h1>
          <p className="text-lg text-onboarding-textSecondary max-w-lg mx-auto">
            Select your medical specialization to view clinical opportunities tailored to your expertise.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Health Worker / Doctor Card */}
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-md rounded-2xl ${
              selectedRole === 'health-worker' 
                ? 'ring-2 ring-secondary-500 shadow-md' 
                : 'hover:shadow-md'
            }`}
            onClick={() => handleRoleSelect('health-worker')}
          >
            <CardContent className="p-8 text-center">
              <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
                selectedRole === 'health-worker' 
                  ? 'bg-secondary-100' 
                  : 'bg-slate-100'
              }`}>
                <Stethoscope className={`h-8 w-8 ${
                  selectedRole === 'health-worker' 
                    ? 'text-secondary-600' 
                    : 'text-slate-600'
                }`} />
              </div>
              
              <h3 className="text-xl font-bold text-onboarding-textPrimary mb-3">
                Health Workers
              </h3>
              
              <p className="text-onboarding-textSecondary mb-4">
                Medical professionals providing direct patient care, consultations, and clinical services.
              </p>
              
              <div className="space-y-2 text-sm text-onboarding-textSecondary">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Direct patient consultations</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Clinical assessments</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Treatment planning</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hospital / Nurse Card */}
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-md rounded-2xl ${
              selectedRole === 'hospital' 
                ? 'ring-2 ring-secondary-500 shadow-md' 
                : 'hover:shadow-md'
            }`}
            onClick={() => handleRoleSelect('hospital')}
          >
            <CardContent className="p-8 text-center">
              <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
                selectedRole === 'hospital' 
                  ? 'bg-secondary-100' 
                  : 'bg-slate-100'
              }`}>
                <Building2 className={`h-8 w-8 ${
                  selectedRole === 'hospital' 
                    ? 'text-secondary-600' 
                    : 'text-slate-600'
                }`} />
              </div>
              
              <h3 className="text-xl font-bold text-onboarding-textPrimary mb-3">
                Hospital Administrator
              </h3>
              
              <p className="text-onboarding-textSecondary mb-4">
                Healthcare facility management, staff coordination, and operational oversight.
              </p>
              
              <div className="space-y-2 text-sm text-onboarding-textSecondary">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                  <span>Staff management</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                  <span>Shift scheduling</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                  <span>Resource allocation</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedRole || isLoading}
            isLoading={isLoading}
            className={`px-12 py-3 text-sm font-semibold uppercase tracking-widest rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 ${
              selectedRole
                ? 'bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue text-white'
                : 'bg-slate-300 text-slate-500'
            }`}
          >
            {isLoading ? (
              'Processing...'
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-onboarding-textSecondary">
            Need help choosing your role?{' '}
            <button className="text-secondary-600 hover:text-secondary-700 font-medium">
              Contact Support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}