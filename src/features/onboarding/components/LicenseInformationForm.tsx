import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Upload, FileText, CheckCircle } from 'lucide-react';

interface LicenseInformationFormProps {
  onNext: () => void;
  onBack?: () => void;
}

interface LicenseData {
  licenseNumber: string;
  issuingAuthority: string;
  expiryDate: string;
  licenseType: string;
  uploadedDocument: File | null;
}

export function LicenseInformationForm({ onNext, onBack }: LicenseInformationFormProps) {
  const [licenseData, setLicenseData] = useState<LicenseData>({
    licenseNumber: '',
    issuingAuthority: '',
    expiryDate: '',
    licenseType: '',
    uploadedDocument: null
  });

  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (field: keyof LicenseData, value: string) => {
    setLicenseData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        setLicenseData(prev => ({
          ...prev,
          uploadedDocument: file
        }));
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLicenseData(prev => ({
        ...prev,
        uploadedDocument: file
      }));
    }
  };

  const isFormValid = () => {
    return licenseData.licenseNumber && 
           licenseData.issuingAuthority && 
           licenseData.expiryDate && 
           licenseData.licenseType && 
           licenseData.uploadedDocument;
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
            License Information
          </h1>
          <p className="text-neutral-600">
            Please provide your professional medical license details
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-primary-600">License Info</span>
            </div>
            <div className="w-8 h-px bg-neutral-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-neutral-300 text-neutral-600 flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-neutral-500">Specialty</span>
            </div>
            <div className="w-8 h-px bg-neutral-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-neutral-300 text-neutral-600 flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-neutral-500">Payout</span>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary-600" />
              <span>Medical License Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* License Type */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                License Type *
              </label>
              <select
                value={licenseData.licenseType}
                onChange={(e) => handleInputChange('licenseType', e.target.value)}
                className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Select license type</option>
                <option value="medical-doctor">Medical Doctor (MD)</option>
                <option value="registered-nurse">Registered Nurse (RN)</option>
                <option value="nurse-practitioner">Nurse Practitioner (NP)</option>
                <option value="physician-assistant">Physician Assistant (PA)</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* License Number */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                License Number *
              </label>
              <input
                type="text"
                value={licenseData.licenseNumber}
                onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                placeholder="Enter your license number"
                className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>

            {/* Issuing Authority */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Issuing Authority *
              </label>
              <input
                type="text"
                value={licenseData.issuingAuthority}
                onChange={(e) => handleInputChange('issuingAuthority', e.target.value)}
                placeholder="e.g., Medical and Dental Council of Nigeria"
                className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                License Expiry Date *
              </label>
              <input
                type="date"
                value={licenseData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>

            {/* Document Upload */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Upload License Document *
              </label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary-400 bg-primary-50' 
                    : licenseData.uploadedDocument
                    ? 'border-success-400 bg-success-50'
                    : 'border-neutral-300 hover:border-neutral-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {licenseData.uploadedDocument ? (
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-8 w-8 text-success-600" />
                    <div>
                      <p className="font-medium text-success-800">
                        {licenseData.uploadedDocument.name}
                      </p>
                      <p className="text-sm text-success-600">
                        {(licenseData.uploadedDocument.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
                    <p className="font-medium text-neutral-700">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-neutral-500">
                      PDF, PNG, JPG up to 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {onBack && (
                <Button variant="outline" onClick={onBack} className="sm:w-auto">
                  Back
                </Button>
              )}
              <Button 
                onClick={onNext} 
                disabled={!isFormValid()}
                className="flex-1 sm:flex-none sm:ml-auto"
              >
                Continue to Specialty Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}