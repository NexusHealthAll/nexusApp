import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle';
import { emailField } from '@/shared/validation/fields';

// This screen only ever collects a work email (registration OTP is sent
// next) — there's no password, name, or phone field here, so the schema is
// just the shared email primitive.
const signupSchema = z.object({ email: emailField });
type SignupValues = z.infer<typeof signupSchema>;

export function EmailSignup() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '' },
  });

  const onValid = async (values: SignupValues) => {
    setIsLoading(true);
    setServerError('');

    try {
      // Store email and health-worker registration flow
      localStorage.setItem('pendingEmail', values.email);
      useAuthStore.getState().setPendingEmail(values.email);
      useAuthStore.getState().setActiveAuthFlow({
        role: "health-worker",
        action: "register",
        origin: "health-worker-onboarding",
      });

      // Send registration OTP
      await apiClient.post("/api/v1/clinicians/otp/send", { email: values.email });

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

  const displayError = serverError || errors.email?.message || '';

  return (
    <div className="min-h-screen bg-[#F3FAFF] dark:bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Signup Card */}
        <Card className="bg-white border border-gray-200 shadow-xl rounded-3xl overflow-hidden min-h-[85vh] sm:min-h-0 flex flex-col dark:bg-neutral-900 dark:border-neutral-800 dark:shadow-none">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-100 flex-shrink-0 dark:bg-neutral-900 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <NexusCareLogo size="sm" />
              <ThemeToggle />
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
            <form onSubmit={handleSubmit(onValid)} noValidate>
              <div className="mb-6">
                <label className="block text-sm font-medium text-onboarding-textPrimary dark:text-neutral-300 mb-2">
                  WORK EMAIL
                </label>
                <div className="relative">
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="name@medicalcenter.com"
                    className="w-full px-4 py-4 pr-11 bg-[#E8F4FD] dark:bg-neutral-800 border-0 rounded-xl text-onboarding-textPrimary dark:text-neutral-50 placeholder-onboarding-textSecondary dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-onboarding-primaryBlue"
                  />
                  <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-onboarding-textSecondary dark:text-neutral-500 pointer-events-none" />
                </div>
                {displayError && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{displayError}</p>
                )}
              </div>

              {/* Continue Button */}
              <Button
                type="submit"
                disabled={isLoading}
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
            </form>

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