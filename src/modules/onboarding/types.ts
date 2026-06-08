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
