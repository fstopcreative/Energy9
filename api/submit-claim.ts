type VercelRequest = {
  method?: string;
  body: unknown;
};

type VercelResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): {
    json(body: Record<string, unknown>): void;
  };
};

type ClaimPayload = {
  business_legal_name: string;
  trading_name: string;
  company_number: string;
  business_type: string;
  primary_contact_name: string;
  contact_role: string;
  email: string;
  telephone: string;
  registered_postcode: string;
  site_same_as_registered: string;
  site_address: string;
  site_postcode: string;
  current_supplier: string;
  historic_supplier: string;
  broker_used: string;
  mpan: string;
  mprn: string;
  contract_start_date: string;
  contract_end_date: string;
  agreement_route: string;
  outbound_sales_call: string;
  signed_loa_held: string;
  contract_terms_held: string;
  claim_1_summary: string;
  claim_1_documents_available: string[];
  claim_2_exists: string;
  claim_2_summary: string;
  claim_2_documents_available: string[];
  authority_confirmed: boolean;
  contact_consent: boolean;
  assessment_sharing_consent: boolean;
  utility_review_opt_in: boolean;
  marketing_consent: boolean;
};

type PowerAutomatePayload = ClaimPayload & {
  created_at: string;
  source: "Website";
};

const MAX_PAYLOAD_BYTES = 50_000;
const MAX_FIELD_LENGTH = 5_000;

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function sanitizeForExcel(value: string): string {
  if (!value) return value;
  // Prevent CSV / spreadsheet formula injection (=, +, -, @, tab, CR).
  if (/^[=+\-@\t\r]/.test(value)) {
    return "'" + value;
  }
  return value;
}

function cleanString(value: unknown): string {
  if (!isString(value)) return "";
  const trimmed = value.trim().slice(0, MAX_FIELD_LENGTH);
  return sanitizeForExcel(trimmed);
}

function cleanStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isString)
    .map((v) => sanitizeForExcel(v.trim().slice(0, MAX_FIELD_LENGTH)))
    .filter(Boolean);
}

function buildUpstreamHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const authorizationHeader = process.env.POWER_AUTOMATE_AUTHORIZATION?.trim();
  const sharedAccessSignature = process.env.POWER_AUTOMATE_SHARED_ACCESS_SIGNATURE?.trim();
  const customHeaderName = process.env.POWER_AUTOMATE_AUTH_HEADER_NAME?.trim();
  const customHeaderValue = process.env.POWER_AUTOMATE_AUTH_HEADER_VALUE?.trim();

  if (authorizationHeader) {
    headers.Authorization = authorizationHeader;
  } else if (sharedAccessSignature) {
    headers.Authorization = sharedAccessSignature.startsWith("SharedAccessSignature ")
      ? sharedAccessSignature
      : `SharedAccessSignature ${sharedAccessSignature}`;
  }

  if (customHeaderName && customHeaderValue) {
    headers[customHeaderName] = customHeaderValue;
  }

  return headers;
}

function getValidatedPayload(body: unknown): ClaimPayload | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const data = body as Record<string, unknown>;

  const payload: ClaimPayload = {
    business_legal_name: cleanString(data.business_legal_name),
    trading_name: cleanString(data.trading_name),
    company_number: cleanString(data.company_number),
    business_type: cleanString(data.business_type),
    primary_contact_name: cleanString(data.primary_contact_name),
    contact_role: cleanString(data.contact_role),
    email: cleanString(data.email),
    telephone: cleanString(data.telephone),
    registered_postcode: cleanString(data.registered_postcode),
    site_same_as_registered: cleanString(data.site_same_as_registered),
    site_address: cleanString(data.site_address),
    site_postcode: cleanString(data.site_postcode),
    current_supplier: cleanString(data.current_supplier),
    historic_supplier: cleanString(data.historic_supplier),
    broker_used: cleanString(data.broker_used),
    mpan: cleanString(data.mpan),
    mprn: cleanString(data.mprn),
    contract_start_date: cleanString(data.contract_start_date),
    contract_end_date: cleanString(data.contract_end_date),
    agreement_route: cleanString(data.agreement_route),
    outbound_sales_call: cleanString(data.outbound_sales_call),
    signed_loa_held: cleanString(data.signed_loa_held),
    contract_terms_held: cleanString(data.contract_terms_held),
    claim_1_summary: cleanString(data.claim_1_summary),
    claim_1_documents_available: cleanStringArray(data.claim_1_documents_available),
    claim_2_exists: cleanString(data.claim_2_exists),
    claim_2_summary: cleanString(data.claim_2_summary),
    claim_2_documents_available: cleanStringArray(data.claim_2_documents_available),
    authority_confirmed: data.authority_confirmed === true,
    contact_consent: data.contact_consent === true,
    assessment_sharing_consent: data.assessment_sharing_consent === true,
    utility_review_opt_in: data.utility_review_opt_in === true,
    marketing_consent: data.marketing_consent === true,
  };

  const requiredMissing =
    !payload.business_legal_name ||
    !payload.business_type ||
    !payload.primary_contact_name ||
    !payload.contact_role ||
    !payload.email ||
    !payload.telephone ||
    !payload.registered_postcode ||
    !payload.site_same_as_registered ||
    !payload.agreement_route ||
    !payload.outbound_sales_call ||
    !payload.signed_loa_held ||
    !payload.contract_terms_held ||
    !payload.claim_1_summary ||
    payload.claim_1_documents_available.length === 0 ||
    !payload.claim_2_exists ||
    !payload.authority_confirmed ||
    !payload.contact_consent ||
    !payload.assessment_sharing_consent;

  if (requiredMissing) return null;

  if (payload.site_same_as_registered !== "Yes") {
    if (!payload.site_address || !payload.site_postcode) return null;
  }

  if (payload.claim_2_exists !== "No") {
    if (!payload.claim_2_summary || payload.claim_2_documents_available.length === 0) {
      return null;
    }
  }

  return payload;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ code: "ERROGK1", error: "Method not allowed." });
  }

  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({ code: "ERROGK2", error: "Invalid request body." });
  }

  // Payload size guard
  let serializedSize = 0;
  try {
    serializedSize = JSON.stringify(req.body).length;
  } catch {
    return res.status(400).json({ code: "ERROGK2", error: "Invalid request body." });
  }
  if (serializedSize > MAX_PAYLOAD_BYTES) {
    return res.status(413).json({ code: "ERROGK3", error: "Payload too large." });
  }

  // Honeypot: silently accept-and-drop if filled (return 200 so bots don't retry)
  const honeypot = (req.body as Record<string, unknown>).website_url;
  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    return res.status(200).json({ success: true });
  }

  const claimPayload = getValidatedPayload(req.body);

  if (!claimPayload) {
    return res.status(400).json({ code: "ERROGK4", error: "Missing required fields." });
  }

  const flowUrl = process.env.POWER_AUTOMATE_URL;

  if (!flowUrl) {
    return res.status(500).json({
      code: "ERROGK5",
      error: "The claim submission service is not configured.",
    });
  }

  const payload: PowerAutomatePayload = {
    ...claimPayload,
    created_at: new Date().toISOString(),
    source: "Website",
  };

  try {
    const response = await fetch(flowUrl, {
      method: "POST",
      headers: buildUpstreamHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const upstreamMessage = await response.text().catch(() => "");
      return res.status(502).json({
        code: "ERROGK6",
        error: "Unable to forward the claim enquiry. Please try again.",
        upstreamStatus: response.status,
        upstreamMessage: upstreamMessage.slice(0, 240),
      });
    }

    return res.status(200).json({ success: true });
  } catch {
    return res.status(502).json({
      code: "ERROGK7",
      error: "Unable to reach the claim submission service. Please try again.",
    });
  }
}
