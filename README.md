# Nexus Care - Healthcare Management Dashboard

A modern, feature-first healthcare management system built with React, TypeScript, and Tailwind CSS.

## 🏗️ Architecture

This project follows a **feature-first** directory structure for better scalability and maintainability:

```
src/
├── features/           # Feature-based modules
│   ├── dashboard/      # Dashboard overview and analytics
│   ├── patients/       # Patient management
│   ├── doctors/        # Doctor profiles and schedules
│   └── appointments/   # Appointment scheduling
├── layouts/            # Layout components
├── shared/             # Shared components and utilities
├── types/              # TypeScript interfaces and types
└── styles/             # Global styles and design tokens
```

## 🎨 Design System

- **Colors**: Healthcare-focused blues and teals with neutral grays
- **Typography**: Inter font family for clean, professional appearance
- **Components**: Composition-based, reusable UI components
- **Spacing**: Consistent 8px grid system
- **Accessibility**: WCAG-compliant components with proper semantic HTML

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Build for Production

```bash
pnpm build
```

## 📋 Features

### ✅ Implemented
- **Dashboard**: Overview with key metrics and quick actions
- **Patient Management**: List view with search and filtering
- **Doctor Management**: Grid view with profiles and ratings
- **Appointment Management**: Table view with status tracking
- **Responsive Layout**: Mobile-first design with sidebar navigation
- **Design System**: Comprehensive Tailwind configuration with custom tokens

### 🚧 Coming Soon
- Patient detail views and forms
- Doctor scheduling and availability
- Appointment booking flow
- Analytics and reporting
- Search and advanced filtering
- Notifications system

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Package Manager**: pnpm

## 📁 Key Files

- `src/types/index.ts` - TypeScript interfaces for Patient, Doctor, Appointment
- `tailwind.config.js` - Design system configuration
- `src/styles/theme.ts` - Design tokens and theme constants
- `src/layouts/MainLayout.tsx` - Main application layout
- `src/features/*/components/` - Feature-specific components

## 🔗 Backend Integration

The TypeScript interfaces in `src/types/` serve as contracts for backend API integration. Key entities:

- **Patient**: Complete patient records with medical history
- **Doctor**: Doctor profiles with specializations and availability
- **Appointment**: Appointment scheduling with status tracking

## 🎯 Development Guidelines

- Use absolute imports with `@/` prefix
- Follow composition patterns for components
- Implement proper TypeScript typing
- Use semantic HTML for accessibility
- Follow the established design system

## 📝 License

This project is private and proprietary.
