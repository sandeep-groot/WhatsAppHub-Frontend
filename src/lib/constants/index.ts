/**
 * Application constants — central re-export for routes, config, copy, and defaults.
 */

export { API_ROUTES, PAGE_ROUTES } from "./routes";
export { FEATURES, type FeatureKey } from "./features";
export {
  APP_CONFIG,
  APP_NAME,
  APP_VERSION,
  PAGE_METADATA,
  createPageMetadata,
  type PageMetadataKey,
} from "./app";
export {
  NAV_SECTION_LABELS,
  FOOTER_LINK_LABELS,
  KPI_CARD_COPY,
  EMPTY_STATE_COPY,
} from "./copy";
export {
  POLLING_DEFAULTS,
  PAGINATION_DEFAULTS,
  MESSAGE_FORM_DEFAULTS,
  QUERY_DEFAULTS,
} from "./defaults";
