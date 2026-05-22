import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { NexusCareLogo } from '@/shared/components/ui/NexusCareLogo';

export function PhoneLogin() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }

    if (phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate OTP sending
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store phone number for OTP verification
      localStorage.setItem('pendingPhone', phoneNumber);
      
      // Navigate to OTP verification
      navigate('/auth/verify-otp');
    } catch (error) {
      console.error('OTP send error:', error);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    // Remove any non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    setPhoneNumber(cleaned);
    
    if (error) {
      setError('');
    }
  };

  const formatPhoneDisplay = (phone: string) => {
    // Format as XXX XXX XXXX for display
    if (phone.length <= 3) return phone;
    if (phone.length <= 6) return `${phone.slice(0, 3)} ${phone.slice(3)}`;
    return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 10)}`;
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6">
      {/* Large Logo Section */}
      <div className="text-center mb-16">
        <div className="mb-6 flex justify-center">
          <NexusCareLogo size="xl" />
        </div>
        <p className="text-slate-500 text-lg font-medium">Clinical Precision. Digital Care.</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md">
        <Card className="bg-white shadow-lg border-0 rounded-3xl overflow-hidden">
          {/* Blue Header Bar */}
          <div className="h-1 bg-gradient-to-r from-blue-500 to-teal-500"></div>
          
          <CardContent className="p-8">
            {/* Welcome Section */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h1>
              <p className="text-slate-600">Enter your phone number to access your workspace</p>
            </div>

            <form onSubmit={handleSendOTP} className="space-y-6">
              {/* Phone Number Section */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  Phone Number
                </label>
                
                {/* Phone Input Container */}
                <div className="relative bg-slate-50 rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center space-x-3">
                    {/* Nigerian Flag and Code */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <div className="w-6 h-4 rounded-sm overflow-hidden">
                        🇳🇬
                      </div>
                      <span className="text-slate-700 font-semibold">+234</span>
                    </div>
                    
                    {/* Phone Number Input */}
                    <input
                      type="tel"
                      value={formatPhoneDisplay(phoneNumber)}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className="flex-1 bg-transparent text-lg font-medium text-slate-700 placeholder-slate-400 border-0 outline-0 focus:ring-0"
                      placeholder="801 234 5678"
                      maxLength={13}
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
              </div>

              {/* Continue Button */}
              <Button
                type="submit"
                disabled={isLoading || phoneNumber.length < 10}
                isLoading={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 text-lg font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                Continue →
              </Button>

              {/* Security Notice */}
              <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Secure OTP will be sent to your number.</span>
              </div>
            </form>

            {/* Support Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">
                Need help accessing your account?{' '}
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Support
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Text */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">
            Trusted by Healthcare Professionals Across Nigeria
          </p>
        </div>
      </div>
    </div>
  );
}