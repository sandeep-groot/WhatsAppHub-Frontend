/**
 * Onboarding module - handles user onboarding flow
 */

export interface OnboardingStep {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  order: number;
}

export interface OnboardingStatus {
  currentStep: number;
  steps: OnboardingStep[];
  completed: boolean;
}

/** Payload returned by YCloud / Meta embedded signup (Step I). */
export interface EmbeddedSignupResult {
  wabaId: string;
  phoneNumberId: string;
  businessId?: string;
  authCode?: string;
}

export interface WabaBindRequest {
  wabaId: string;
  phoneNumberId: string;
}

export interface WabaBindResponse {
  success: boolean;
  message?: string;
}
