import type { AccountKpis, BusinessNode, PhoneNumber, WabaAccount } from "./types";

export function buildBusinessHierarchy(
  wabas: WabaAccount[],
  phones: PhoneNumber[]
): BusinessNode[] {
  const phonesByWaba = new Map<string, PhoneNumber[]>();
  for (const phone of phones) {
    const list = phonesByWaba.get(phone.wabaId) ?? [];
    list.push(phone);
    phonesByWaba.set(phone.wabaId, list);
  }

  const businessMap = new Map<string, BusinessNode>();
  for (const waba of wabas) {
    const node = businessMap.get(waba.businessId) ?? {
      businessId: waba.businessId,
      businessName: waba.businessName,
      businessStatus: waba.businessStatus,
      businessVerificationStatus: waba.businessVerificationStatus,
      wabas: [],
      phoneCount: 0,
    };
    const phoneNumbers = phonesByWaba.get(waba.id) ?? [];
    node.wabas.push({ ...waba, phoneNumbers });
    node.phoneCount += phoneNumbers.length;
    businessMap.set(waba.businessId, node);
  }

  return Array.from(businessMap.values());
}

export function computeAccountKpis(businesses: BusinessNode[]): AccountKpis {
  let wabaCount = 0;
  let phoneCount = 0;
  let connected = 0;
  let pending = 0;
  let inactive = 0;

  for (const business of businesses) {
    wabaCount += business.wabas.length;
    for (const waba of business.wabas) {
      for (const phone of waba.phoneNumbers) {
        phoneCount += 1;
        const status = (phone.status || "").toUpperCase();
        if (status === "CONNECTED" || status === "ACTIVE") {
          connected += 1;
        } else if (status === "PENDING" || status === "IN_PROGRESS") {
          pending += 1;
        } else {
          inactive += 1;
        }
      }
    }
  }

  return {
    businessCount: businesses.length,
    wabaCount,
    phoneCount,
    connected,
    pending,
    inactive,
  };
}
