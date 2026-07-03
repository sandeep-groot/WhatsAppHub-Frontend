/**
 * Feature flags for optional routes and UI sections.
 * Toggle these to enable commented-out navigation items and pages.
 */

export const FEATURES = {
  connections: false,
  users: false,
  roles: false,
  settings: false,
} as const;

export type FeatureKey = keyof typeof FEATURES;