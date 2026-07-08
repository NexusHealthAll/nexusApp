import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Building2,
  FileText,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

export interface WaitlistAudienceCard {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  icon: LucideIcon;
}

export interface WaitlistStep {
  id: string;
  title: string;
  description: string;
}

export interface WaitlistInsight {
  category: string;
  readTime: string;
  title: string;
  description: string;
  icon: LucideIcon;
  image: string;
}

export const waitlistNavItems = [
  "Solutions",
  "How it Works",
  "Resources",
] as const;

export const waitlistAudienceCards: WaitlistAudienceCard[] = [
  {
    eyebrow: "Institutional Excellence",
    title: "For Hospitals",
    description:
      "Eliminate staffing gaps with automated compliance checks, verified clinicians, and a faster path to shift coverage.",
    ctaLabel: "Partner with Us",
    icon: Building2,
  },
  {
    eyebrow: "Clinician Empowerment",
    title: "For Health Workers",
    description:
      "Browse high-priority shifts, capture notes with AI assistance, and close out work with same-day payout visibility.",
    ctaLabel: "Start Practicing",
    icon: Stethoscope,
  },
] as const;

export const waitlistPartners = [
  "HealthNet",
  "Lago Med",
  "Nordic Clinic",
  "PrimeCare",
] as const;

export const waitlistSteps: WaitlistStep[] = [
  {
    id: "1",
    title: "Register & Verify",
    description:
      "Instant credential verification through our secure clinical network and role-specific onboarding.",
  },
  {
    id: "2",
    title: "Find & Accept",
    description:
      "Review matched opportunities based on expertise, preferred shifts, and facility demand.",
  },
  {
    id: "3",
    title: "Work & Get Paid",
    description:
      "Submit clinical summaries via AI scribe support and track same-day payout progress in one place.",
  },
] as const;

export const waitlistTrustPoints = [
  {
    title: "AI Documentation",
    description:
      "Structured visit capture and shift summaries designed to reduce administrative drag.",
    icon: FileText,
  },
  {
    title: "Compliance Ready",
    description:
      "Credential checks, eligibility tracking, and onboarding checkpoints built into the workflow.",
    icon: ShieldCheck,
  },
  {
    title: "Clinical Marketplace",
    description:
      "A curated network for hospitals and clinicians to discover verified opportunities faster.",
    icon: HeartPulse,
  },
] as const;

export const waitlistInsights: WaitlistInsight[] = [
  {
    category: "Innovation",
    readTime: "7 min read",
    title: "The Future of AI in Clinical Workflows",
    description:
      "How generative models are transforming medical documentation and patient engagement without slowing teams down.",
    icon: BadgeCheck,
    image: "/waitlist/ai-clinical.jpg",
  },
  {
    category: "Insights",
    readTime: "6 min read",
    title: "Navigating the Nigerian Healthcare Marketplace",
    description:
      "A practical guide for clinicians looking to optimize schedules and maximize earnings safely.",
    icon: HeartPulse,
    image: "/waitlist/healthcare- marketplace.jpg",
  },
  {
    category: "Regulatory",
    readTime: "8 min read",
    title: "Compliance at Scale: Managing 100+ Staff",
    description:
      "How operational teams can reduce credential bottlenecks and improve coverage planning.",
    icon: ShieldCheck,
    image: "/waitlist/compliance-guide.jpg",
  },
] as const;

export const waitlistFooterSections = [
  {
    title: "Solutions",
    links: ["For Hospitals", "For Clinicians", "AI Documentation"],
  },
  {
    title: "Community",
    links: ["Resource Center", "Events", "Clinical Partners"],
  },
  {
    title: "Legal",
    links: ["Terms of Service", "Privacy Policy", "Compliance Data"],
  },
] as const;
