export interface ConsentRecord {
  ip: string;
  timestamp: string;
  text: string;
}

export interface QuoteInvoice {
  quoteRef: string;
  amount: number;
  currency: string;
  taxTreatment: string;
  depositRequired: number;
  dueDate: string;
  scope: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Paid' | 'Cancelled';
  createdAt: string;
}

export interface ClientChecklist {
  scriptApproved: boolean;
  scriptApprovedBy?: string;
  scriptApprovedAt?: string;
  claimsVerified: boolean;
  claimsVerifiedBy?: string;
  claimsVerifiedAt?: string;
  logoApproved: boolean;
  logoApprovedBy?: string;
  logoApprovedAt?: string;
  voiceoverApproved: boolean;
  voiceoverApprovedBy?: string;
  voiceoverApprovedAt?: string;
  finalApproved: boolean;
  finalApprovedBy?: string;
  finalApprovedAt?: string;
}

export interface Enquiry {
  id?: string;
  fullName: string;
  businessName: string;
  email: string;
  phone?: string;
  location: string; // UK business location
  niche: string; // Business niche / industry
  serviceRequired: string;
  budgetRange: string;
  projectDescription: string;
  websiteUrl?: string;
  createdAt?: string;
  
  // Advanced parameters
  videoObjective?: string;
  preferredFormat?: string;
  desiredTimeline?: string;
  status?: 'New' | 'Contacted' | 'Quoted' | 'In Progress' | 'Delivered' | 'Closed' | 'Rejected';
  internalNotes?: string;
  consentRecord?: ConsentRecord;
  quotes?: QuoteInvoice[];
  checklist?: ClientChecklist;
}

export interface VideoAd {
  id: string;
  title: string;
  demoTitle: string;
  niche: string;
  description: string;
  videoUrl: string;
  cta: string;
  posterUrl?: string;
  isFallback?: boolean;
  fallbackReason?: string;
  isDemo?: boolean;
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  description: string;
  badge?: string;
}

export interface VideoGenerationParams {
  businessType: string;
  adObjective: string;
  videoPrompt: string;
  aspectRatio: "16:9" | "9:16";
  resolution: "720p" | "1080p";
  visualStyle: string;
  ctaText: string;
}

export interface GenerationStatus {
  status: "idle" | "validating" | "generating" | "polling" | "success" | "error";
  operationName?: string;
  progressMessage?: string;
  videoUrl?: string;
  errorDetails?: string;
}
