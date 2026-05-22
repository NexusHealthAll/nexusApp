import React from 'react';

interface NexusCareLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function NexusCareLogo({ size = 'md', className = '' }: NexusCareLogoProps) {
  const sizeClasses = {
    sm: {
      icon: 'h-6 w-6',
      text: 'text-sm',
      gap: 'gap-2'
    },
    md: {
      icon: 'h-8 w-8',
      text: 'text-lg',
      gap: 'gap-2.5'
    },
    lg: {
      icon: 'h-10 w-10',
      text: 'text-xl',
      gap: 'gap-3'
    },
    xl: {
      icon: 'h-12 w-12',
      text: 'text-2xl',
      gap: 'gap-3'
    }
  };

  const { icon, text, gap } = sizeClasses[size];

  return (
    <div className={`flex items-center ${gap} ${className}`}>
      {/* Original Hospital Onboarding Logo */}
      <img src="/logo.png" alt="NexusCare" className={icon} />
      
      {/* Original Hospital Onboarding Text - Exact same as OnboardingNavbar */}
      <p className={`${text} font-bold tracking-wide text-[#1A5888]`}>
        NEXUS
        <span className="text-secondary-800">CARE</span>
      </p>
    </div>
  );
}