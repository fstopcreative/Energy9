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
  fullName: string;
  email: string;
  phone: string;
  postcode: string;
  address?: string;
  claimType: string;
  message?: string;
  consent: boolean;
};

type PowerAutomatePayload = ClaimPayload & {
  createdAt: string;
  source: "Website";
};

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function cleanString(value: unknown): string {
  return isString(value) ? value.trim() : "";
}

function getValidatedPayload(body: unknown): ClaimPayload | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const data = body as Record<string, unknown>;

  const payload: ClaimPayload = {
    fullName: cleanString(data.fullName),
    email: cleanString(data.email),
    phone: cleanString(data.phone),
    postcode: cleanString(data.postcode),
    address: cleanString(data.address),
    claimType: cleanString(data.claimType),
    message: cleanString(data.message),
    consent: data.consent === true,
  };

  if (
    !payload.fullName ||
    !payload.email ||
    !payload.phone ||
    !payload.postcode ||
    !payload.claimType ||
    !payload.consent
  ) {
    return null;
  }

  return payload;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const flowUrl = process.env.POWER_AUTOMATE_URL;

  if (!flowUrl) {
    return res.status(500).json({
      error: "The claim submission service is not configured.",
    });
  }

  const claimPayload = getValidatedPayload(req.body);

  if (!claimPayload) {
    return res.status(400).json({
      error: "Missing required fields.",
    });
  }

  const payload: PowerAutomatePayload = {
    ...claimPayload,
    createdAt: new Date().toISOString(),
    source: "Website",
  };

  try {
    const response = await fetch(flowUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const upstreamMessage = await response.text().catch(() => "");

      return res.status(502).json({
        error: "Unable to forward the claim enquiry. Please try again.",
        upstreamStatus: response.status,
        upstreamMessage: upstreamMessage.slice(0, 240),
      });
    }

    return res.status(200).json({ success: true });
  } catch {
    return res.status(502).json({
      error: "Unable to reach the claim submission service. Please try again.",
    });
  }
}
