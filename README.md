# Energy Claim Landing Page

A single-page React app that collects business energy claim enquiries and forwards each submission to a Microsoft Power Automate flow, which writes the row into an Excel workbook on OneDrive / SharePoint.

## Tech stack

- React 19 + TypeScript + Vite
- Vercel serverless functions for the submit endpoint
- Microsoft 365 (Excel Online + Power Automate) as the persistence layer

## Form structure

The form follows the spec in `form-alanlari.pdf` — 33 fields across 8 sections, with conditional branching and multi-select document checklists:

| Section | Fields |
| --- | --- |
| A. Business details | `business_legal_name`, `trading_name`, `company_number`, `business_type` |
| B. Contact details | `primary_contact_name`, `contact_role`, `email`, `telephone` |
| C. Address details | `registered_postcode`, `site_same_as_registered`, `site_address`*, `site_postcode`* |
| D. Energy details | `current_supplier`, `historic_supplier`, `broker_used`, `mpan`, `mprn`, `contract_start_date`, `contract_end_date` |
| E. Agreement route | `agreement_route`, `outbound_sales_call`, `signed_loa_held`, `contract_terms_held` |
| F. Claim 1 | `claim_1_summary`, `claim_1_documents_available` (multi-select) |
| G. Claim 2 | `claim_2_exists`, `claim_2_summary`*, `claim_2_documents_available`* (multi-select) |
| H. Consent | `authority_confirmed`, `contact_consent`, `assessment_sharing_consent`, `utility_review_opt_in`, `marketing_consent` |

`*` = conditional. Site fields show when the supply site differs from the registered address. Claim 2 fields show when the user reports a second claim.

Client-side validation covers required fields, UK postcode format, email format, telephone format, and the three required consent checkboxes.

## Local development

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:5173`. Note: `/api/submit-claim` is a Vercel serverless route and is **not** served by Vite — to test the API locally use `vercel dev` (see Vercel CLI docs) and set `POWER_AUTOMATE_URL` in a local `.env.local`:

```bash
POWER_AUTOMATE_URL="https://your-power-automate-webhook-url"
```

## Microsoft 365 setup

The repo ships with [`wbpdux-energy-claim-list.xlsx`](./wbpdux-energy-claim-list.xlsx), pre-formatted for Power Automate.

- Worksheet: `Claims`
- Excel Table: `ClaimEnquiries` (range `A1:AI2`)
- 35 columns: 33 form fields plus `created_at` and `source`

Steps:

1. Upload `wbpdux-energy-claim-list.xlsx` to OneDrive or SharePoint.
2. In Power Automate, create a new flow:
   - **Trigger:** *When a HTTP request is received* — leave the schema empty (the JSON body will be auto-inferred on first call, or paste the schema below).
   - **Action:** *Excel Online (Business) → Add a row into a table*
     - File: the uploaded workbook
     - Table: `ClaimEnquiries`
     - Map each table column to `triggerBody()?['<column_name>']`
3. For the array columns, wrap the expression in `join()` so they are stored as comma-separated strings:
   - `join(triggerBody()?['claim_1_documents_available'], ', ')`
   - `join(triggerBody()?['claim_2_documents_available'], ', ')`
4. Save the flow, copy the generated HTTPS POST URL.
5. Set the URL as the `POWER_AUTOMATE_URL` environment variable in Vercel (and in `.env.local` for local testing).

The placeholder empty row (row 2) in the workbook exists only so the Excel Table is valid; you may delete it after the first real submission.

## API contract

The frontend posts to `/api/submit-claim`. The API validates required fields and forwards this JSON to Power Automate:

```json
{
  "created_at": "2026-05-11T09:00:00.000Z",
  "source": "Website",
  "business_legal_name": "Example Ltd",
  "trading_name": "",
  "company_number": "",
  "business_type": "Limited company",
  "primary_contact_name": "Jane Doe",
  "contact_role": "Director",
  "email": "jane@example.com",
  "telephone": "07123456789",
  "registered_postcode": "SW1A 1AA",
  "site_same_as_registered": "Yes",
  "site_address": "",
  "site_postcode": "",
  "current_supplier": "",
  "historic_supplier": "",
  "broker_used": "",
  "mpan": "",
  "mprn": "",
  "contract_start_date": "",
  "contract_end_date": "",
  "agreement_route": "Signed LOA",
  "outbound_sales_call": "No",
  "signed_loa_held": "Yes",
  "contract_terms_held": "Yes",
  "claim_1_summary": "...",
  "claim_1_documents_available": ["LOA", "Bills"],
  "claim_2_exists": "No",
  "claim_2_summary": "",
  "claim_2_documents_available": [],
  "authority_confirmed": true,
  "contact_consent": true,
  "assessment_sharing_consent": true,
  "utility_review_opt_in": false,
  "marketing_consent": false
}
```

## Deploying to Vercel

1. Import the project into Vercel.
2. Add `POWER_AUTOMATE_URL` as a project environment variable.
3. Deploy.

The API route `/api/submit-claim` accepts `POST` only. The handler enforces a 50 KB payload cap, a 5 000-character per-field cap, sanitizes leading `=`, `+`, `-`, `@`, tab, and CR characters to prevent spreadsheet formula injection, and silently drops submissions whose hidden honeypot field is filled.

## Error codes (internal)

When the form fails, the popup shows a generic message plus a short code. The codes map to specific failure modes and are intended only for internal diagnostics — not for end users. Open the browser DevTools Console for the full technical detail.

| Code | HTTP | Where | Meaning |
| --- | --- | --- | --- |
| `ERROGK1` | 405 | API | Non-POST method hit `/api/submit-claim`. |
| `ERROGK2` | 400 | API | Body missing or not JSON-parseable. |
| `ERROGK3` | 413 | API | Payload exceeds 50 KB. |
| `ERROGK4` | 400 | API | Required field validation failed server-side. |
| `ERROGK5` | 500 | API | `POWER_AUTOMATE_URL` env var not configured on Vercel. |
| `ERROGK6` | 502 | API | Power Automate responded with non-2xx (flow disabled, schema mismatch, Excel locked, etc.). Check `upstreamStatus` / `upstreamMessage` in the response body. |
| `ERROGK7` | 502 | API | `fetch` to Power Automate threw (URL invalid, MS service down, network from Vercel blocked). |
| `ERROGK8` | — | Client | Browser `fetch` to `/api/submit-claim` threw (user offline, CORS, Vercel function timeout, DNS). |
| `ERROGK0` | — | Client | API returned an error response without a recognized code (fallback). |

Quick triage:

- `ERROGK5` → set the env var, redeploy.
- `ERROGK6` → open the Power Automate flow run history; the error is on Microsoft's side.
- `ERROGK7` → flow URL probably wrong or revoked; regenerate and update env var.
- `ERROGK8` → ask the user to refresh / check their connection.
- `ERROGK4` → unexpected; client validation should have caught it. Indicates a payload tampering or a client/server validation mismatch worth investigating.
