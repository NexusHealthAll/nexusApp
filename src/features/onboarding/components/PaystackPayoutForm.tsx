import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { CreditCard, Bank, Shield, CheckCircle, AlertCircle } from 'lucide-react';

interface PaystackPayoutFormProps {
  onComplete: () => void;
  onBack: () => void;
}

interface PayoutData {
  accountNumber: string;
  bankCode: string;
  accountName: string;
  bvn: string;
  phoneNumber: string;
  email: string;
}

const nigerianBanks = [
  { code: '044', name: 'Access Bank' },
  { code: '014', name: 'Afribank Nigeria Plc' },
  { code: '023', name: 'Citibank Nigeria Limited' },
  { code: '050', name: 'Ecobank Nigeria Plc' },
  { code: '040', name: 'Equitorial Trust Bank Limited' },
  { code: '011', name: 'First Bank of Nigeria Limited' },
  { code: '214', name: 'First City Monument Bank Plc' },
  { code: '058', name: 'Guaranty Trust Bank Plc' },
  { code: '030', name: 'Heritage Banking Company Ltd' },
  { code: '082', name: 'Keystone Bank Limited' },
  { code: '076', name: 'Polaris Bank Limited' },
  { code: '221', name: 'Stanbic IBTC Bank Plc' },
  { code: '068', name: 'Standard Chartered Bank Nigeria Limited' },
  { code: '232', name: 'Sterling Bank Plc' },
  { code: '032', name: 'Union Bank of Nigeria Plc' },
  { code: '033', name: 'United Bank for Africa Plc' },
  { code: '215', name: 'Unity Bank Plc' },
  { code: '035', name: 'Wema Bank Plc' },
  { code: '057', name: 'Zenith Bank Plc' }
];

export function PaystackPayoutForm({ onComplete, onBack }: PaystackPayoutFormProps) {
  const [payoutData, setPayoutData] = useState<PayoutData>({
    accountNumber: '',
    bankCode: '',
    accountName: '',
    bvn: '',
    phoneNumber: '',
    email: ''
  });

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleInputChange = (field: keyof PayoutData, value: string) => {
    setPayoutData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset verification status when account details change
    if (field === 'accountNumber' || field === 'bankCode') {
      setVerificationStatus('idle');
    }
  };

  const verifyAccountDetails = async () => {
    if (!payoutData.accountNumber || !payoutData.bankCode) return;
    
    setIsVerifying(true);
    
    // Simulate API call to verify account details
    setTimeout(() => {
      // Mock verification - in real app, this would call Paystack API
      const mockAccountName = 'Dr. Amina Yusuf';
      setPayoutData(prev => ({
        ...prev,
        accountName: mockAccountName
      }));
      setVerificationStatus('success');
      setIsVerifying(false);
    }, 2000);
  };

  const isFormValid = () => {
    return payoutData.accountNumber && 
           payoutData.bankCode && 
           payoutData.accountName &&
           payoutData.bvn && 
           payoutData.phoneNumber && 
           payoutData.email &&
           verificationStatus === 'success' &&
           agreedToTerms;
  };

  const selectedBank = nigerianBanks.find(bank => bank.code === payoutData.bankCode);

  return (
    <div className="min-h-screen bg-neutral-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
            Payout Setup
          </h1>
          <p className="text-neutral-600">
            Set up your Paystack account for secure payments
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-success-600 text-white flex items-center justify-center text-sm font-semibold">
                ✓
              </div>
              <span className="ml-2 text-sm font-medium text-success-600">License Info</span>
            </div>
            <div className="w-8 h-px bg-success-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-success-600 text-white flex items-center justify-center text-sm font-semibold">
                ✓
              </div>
              <span className="ml-2 text-sm font-medium text-success-600">Specialty</span>
            </div>
            <div className="w-8 h-px bg-success-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-primary-600">Payout</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Security Notice */}
          <Card className="border-primary-200 bg-primary-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-primary-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-primary-900 mb-1">Secure Payment Processing</h3>
                  <p className="text-sm text-primary-800">
                    Your banking information is encrypted and processed securely through Paystack, 
                    Nigeria's leading payment processor.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Account Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bank className="h-5 w-5 text-primary-600" />
                <span>Bank Account Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bank Selection */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Bank *
                </label>
                <select
                  value={payoutData.bankCode}
                  onChange={(e) => handleInputChange('bankCode', e.target.value)}
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select your bank</option>
                  {nigerianBanks.map((bank) => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Account Number *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={payoutData.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                    placeholder="Enter 10-digit account number"
                    maxLength={10}
                    className="flex-1 p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                  <Button
                    variant="outline"
                    onClick={verifyAccountDetails}
                    disabled={!payoutData.accountNumber || !payoutData.bankCode || isVerifying}
                    className="px-4"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify'}
                  </Button>
                </div>
              </div>

              {/* Account Name Verification */}
              {verificationStatus === 'success' && (
                <div className="p-3 bg-success-50 border border-success-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-success-600" />
                    <div>
                      <p className="font-medium text-success-800">Account Verified</p>
                      <p className="text-sm text-success-700">
                        {payoutData.accountName} • {selectedBank?.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {verificationStatus === 'error' && (
                <div className="p-3 bg-error-50 border border-error-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-error-600" />
                    <div>
                      <p className="font-medium text-error-800">Verification Failed</p>
                      <p className="text-sm text-error-700">
                        Please check your account number and bank selection.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-primary-600" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* BVN */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Bank Verification Number (BVN) *
                </label>
                <input
                  type="text"
                  value={payoutData.bvn}
                  onChange={(e) => handleInputChange('bvn', e.target.value)}
                  placeholder="Enter your 11-digit BVN"
                  maxLength={11}
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Your BVN is required for identity verification and compliance.
                </p>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={payoutData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={payoutData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Terms and Conditions */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <label htmlFor="terms" className="text-sm text-neutral-700">
                  I agree to the{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-700 underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-700 underline">
                    Privacy Policy
                  </a>
                  . I understand that my banking information will be securely processed by Paystack 
                  for payment processing purposes.
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={onBack} className="sm:w-auto">
              Back to Specialty Selection
            </Button>
            <Button 
              onClick={onComplete} 
              disabled={!isFormValid()}
              className="flex-1 sm:flex-none sm:ml-auto"
            >
              Complete Setup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}