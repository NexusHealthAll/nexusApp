import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Stethoscope, Heart, Brain, Baby, Eye, Bone, CheckCircle } from 'lucide-react';

interface SpecialtySelectionFormProps {
  onNext: () => void;
  onBack: () => void;
}

interface Specialty {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'primary' | 'specialist';
}

const specialties: Specialty[] = [
  {
    id: 'general-medicine',
    name: 'General Medicine',
    description: 'Primary care and general medical practice',
    icon: <Stethoscope className="h-6 w-6" />,
    category: 'primary'
  },
  {
    id: 'emergency-medicine',
    name: 'Emergency Medicine',
    description: 'Emergency department and urgent care',
    icon: <Heart className="h-6 w-6" />,
    category: 'primary'
  },
  {
    id: 'family-medicine',
    name: 'Family Medicine',
    description: 'Comprehensive family healthcare',
    icon: <Stethoscope className="h-6 w-6" />,
    category: 'primary'
  },
  {
    id: 'internal-medicine',
    name: 'Internal Medicine',
    description: 'Adult internal medicine and chronic conditions',
    icon: <Heart className="h-6 w-6" />,
    category: 'primary'
  },
  {
    id: 'cardiology',
    name: 'Cardiology',
    description: 'Heart and cardiovascular system',
    icon: <Heart className="h-6 w-6" />,
    category: 'specialist'
  },
  {
    id: 'neurology',
    name: 'Neurology',
    description: 'Brain and nervous system disorders',
    icon: <Brain className="h-6 w-6" />,
    category: 'specialist'
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics',
    description: 'Children and adolescent healthcare',
    icon: <Baby className="h-6 w-6" />,
    category: 'specialist'
  },
  {
    id: 'ophthalmology',
    name: 'Ophthalmology',
    description: 'Eye and vision care',
    icon: <Eye className="h-6 w-6" />,
    category: 'specialist'
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics',
    description: 'Bones, joints, and musculoskeletal system',
    icon: <Bone className="h-6 w-6" />,
    category: 'specialist'
  }
];

export function SpecialtySelectionForm({ onNext, onBack }: SpecialtySelectionFormProps) {
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string>('');
  const [yearsOfExperience, setYearsOfExperience] = useState<string>('');

  const handleSpecialtyToggle = (specialtyId: string) => {
    setSelectedSpecialties(prev => {
      if (prev.includes(specialtyId)) {
        return prev.filter(id => id !== specialtyId);
      } else {
        return [...prev, specialtyId];
      }
    });
  };

  const isFormValid = () => {
    return selectedSpecialties.length > 0 && experienceLevel && yearsOfExperience;
  };

  const primarySpecialties = specialties.filter(s => s.category === 'primary');
  const specialistSpecialties = specialties.filter(s => s.category === 'specialist');

  return (
    <div className="min-h-screen bg-neutral-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
            Specialty Selection
          </h1>
          <p className="text-neutral-600">
            Select your medical specialties and experience level
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
              <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-primary-600">Specialty</span>
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

        <div className="space-y-6">
          {/* Primary Care Specialties */}
          <Card>
            <CardHeader>
              <CardTitle>Primary Care Specialties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {primarySpecialties.map((specialty) => (
                  <div
                    key={specialty.id}
                    onClick={() => handleSpecialtyToggle(specialty.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedSpecialties.includes(specialty.id)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        selectedSpecialties.includes(specialty.id)
                          ? 'bg-primary-100 text-primary-600'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {specialty.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-neutral-900">{specialty.name}</h3>
                          {selectedSpecialties.includes(specialty.id) && (
                            <CheckCircle className="h-5 w-5 text-primary-600" />
                          )}
                        </div>
                        <p className="text-sm text-neutral-600 mt-1">{specialty.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Specialist Specialties */}
          <Card>
            <CardHeader>
              <CardTitle>Specialist Specialties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {specialistSpecialties.map((specialty) => (
                  <div
                    key={specialty.id}
                    onClick={() => handleSpecialtyToggle(specialty.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedSpecialties.includes(specialty.id)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        selectedSpecialties.includes(specialty.id)
                          ? 'bg-primary-100 text-primary-600'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {specialty.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-neutral-900 text-sm">{specialty.name}</h3>
                          {selectedSpecialties.includes(specialty.id) && (
                            <CheckCircle className="h-4 w-4 text-primary-600" />
                          )}
                        </div>
                        <p className="text-xs text-neutral-600 mt-1">{specialty.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Experience Level */}
          <Card>
            <CardHeader>
              <CardTitle>Experience Level</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Experience Level *
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select experience level</option>
                    <option value="resident">Resident/Intern</option>
                    <option value="junior">Junior Doctor (1-3 years)</option>
                    <option value="mid-level">Mid-level (4-7 years)</option>
                    <option value="senior">Senior Doctor (8-15 years)</option>
                    <option value="consultant">Consultant (15+ years)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    placeholder="Enter years"
                    min="0"
                    max="50"
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={onBack} className="sm:w-auto">
              Back to License Info
            </Button>
            <Button 
              onClick={onNext} 
              disabled={!isFormValid()}
              className="flex-1 sm:flex-none sm:ml-auto"
            >
              Continue to Payout Setup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}