/**
 * YCloud WhatsApp business accounts & phone numbers (clients directory).
 */

export interface WabaAccount {
  id: string;
  name: string;
  currency: string;
  messageTemplateNamespace: string;
  accountReviewStatus: string;
  businessId: string;
  businessStatus: string;
  businessName: string;
  businessVerificationStatus: string;
  whatsappBusinessManagerMessagingLimit: string;
  ownershipType: string;
  primaryFundingId: string;
  timezoneId: string;
  paymentMethodAttached: boolean;
  isOnBizApp: boolean;
}

export interface PhoneNumber {
  id: string;
  phoneNumber: string;
  wabaId: string;
  verifiedName: string;
  qualityRating: string;
  messagingLimit: string;
  whatsappBusinessManagerMessagingLimit: string;
  isOfficialBusinessAccount: boolean;
  codeVerificationStatus: string;
  status: string;
  displayPhoneNumber: string;
  nameStatus: string;
  newName?: string;
  newNameStatus: string;
  decision: string;
  requestedVerifiedName: string;
  rejectionReason?: string;
  isOnBizApp: boolean;
}

export interface PagedResponse<T> {
  offset: number;
  limit: number;
  length: number;
  items: T[];
}

export interface WabaNode extends WabaAccount {
  phoneNumbers: PhoneNumber[];
}

export interface BusinessNode {
  businessId: string;
  businessName: string;
  businessStatus: string;
  businessVerificationStatus: string;
  wabas: WabaNode[];
  phoneCount: number;
}

export interface AccountKpis {
  businessCount: number;
  wabaCount: number;
  phoneCount: number;
  connected: number;
  pending: number;
  inactive: number;
}
