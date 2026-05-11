import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";

// ──────────────────────────────────────────────────────────────────────────────
// EDIT THESE TO CHANGE THE POPUP MESSAGES
// ──────────────────────────────────────────────────────────────────────────────
const SUCCESS_TITLE = "Thank you!";
const SUCCESS_MESSAGE =
  "Your information has been submitted. You will soon receive a link via email to upload any documents we may require.";

const ERROR_TITLE = "Something went wrong";
const ERROR_FALLBACK_MESSAGE =
  "We couldn't submit your enquiry. Please try again, or contact us if the problem persists.";
// ──────────────────────────────────────────────────────────────────────────────

type ClaimFormValues = {
  businessLegalName: string;
  tradingName: string;
  companyNumber: string;
  businessType: string;
  primaryContactName: string;
  contactRole: string;
  email: string;
  telephone: string;
  registeredPostcode: string;
  siteSameAsRegistered: string;
  siteAddress: string;
  sitePostcode: string;
  currentSupplier: string;
  historicSupplier: string;
  brokerUsed: string;
  mpan: string;
  mprn: string;
  contractStartDate: string;
  contractEndDate: string;
  agreementRoute: string;
  outboundSalesCall: string;
  signedLoaHeld: string;
  contractTermsHeld: string;
  claim1Summary: string;
  claim1DocumentsAvailable: string[];
  claim2Exists: string;
  claim2Summary: string;
  claim2DocumentsAvailable: string[];
  authorityConfirmed: boolean;
  contactConsent: boolean;
  assessmentSharingConsent: boolean;
  utilityReviewOptIn: boolean;
  marketingConsent: boolean;
};

type FieldErrors = Partial<Record<keyof ClaimFormValues, string>>;

const initialValues: ClaimFormValues = {
  businessLegalName: "",
  tradingName: "",
  companyNumber: "",
  businessType: "",
  primaryContactName: "",
  contactRole: "",
  email: "",
  telephone: "",
  registeredPostcode: "",
  siteSameAsRegistered: "",
  siteAddress: "",
  sitePostcode: "",
  currentSupplier: "",
  historicSupplier: "",
  brokerUsed: "",
  mpan: "",
  mprn: "",
  contractStartDate: "",
  contractEndDate: "",
  agreementRoute: "",
  outboundSalesCall: "",
  signedLoaHeld: "",
  contractTermsHeld: "",
  claim1Summary: "",
  claim1DocumentsAvailable: [],
  claim2Exists: "",
  claim2Summary: "",
  claim2DocumentsAvailable: [],
  authorityConfirmed: false,
  contactConsent: false,
  assessmentSharingConsent: false,
  utilityReviewOptIn: false,
  marketingConsent: false,
};

const businessTypeOptions = [
  "Limited company",
  "LLP",
  "Sole trader",
  "Partnership",
  "Charity",
  "Other",
];

const yesNoUnsureOptions = ["Yes", "No", "Unsure"];

const agreementRouteOptions = [
  "Signed LOA",
  "Signable",
  "Phone/verbal",
  "Email",
  "Online",
  "Unsure",
];

const documentTypeOptions = [
  "LOA",
  "Bills",
  "Supplier contract",
  "Broker emails",
  "Terms",
  "Call recording",
  "None yet",
];

const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;
const PHONE_REGEX = /^[+\d][\d\s()-]{6,}$/;

function validate(values: ClaimFormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.businessLegalName.trim()) {
    errors.businessLegalName = "Business legal name is required.";
  }

  if (!values.businessType) {
    errors.businessType = "Select a business type.";
  }

  if (!values.primaryContactName.trim()) {
    errors.primaryContactName = "Primary contact name is required.";
  }

  if (!values.contactRole.trim()) {
    errors.contactRole = "Role / position is required.";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.telephone.trim()) {
    errors.telephone = "Telephone number is required.";
  } else if (!PHONE_REGEX.test(values.telephone.trim())) {
    errors.telephone = "Enter a valid telephone number.";
  }

  if (!values.registeredPostcode.trim()) {
    errors.registeredPostcode = "Registered postcode is required.";
  } else if (!UK_POSTCODE_REGEX.test(values.registeredPostcode.trim())) {
    errors.registeredPostcode = "Enter a valid UK postcode.";
  }

  if (!values.siteSameAsRegistered) {
    errors.siteSameAsRegistered = "Select an option.";
  } else if (values.siteSameAsRegistered !== "Yes") {
    if (!values.siteAddress.trim()) {
      errors.siteAddress = "Site address is required.";
    }
    if (!values.sitePostcode.trim()) {
      errors.sitePostcode = "Site postcode is required.";
    } else if (!UK_POSTCODE_REGEX.test(values.sitePostcode.trim())) {
      errors.sitePostcode = "Enter a valid UK postcode.";
    }
  }

  if (!values.agreementRoute) {
    errors.agreementRoute = "Select how the contract was agreed.";
  }

  if (!values.outboundSalesCall) {
    errors.outboundSalesCall = "Select an option.";
  }

  if (!values.signedLoaHeld) {
    errors.signedLoaHeld = "Select an option.";
  }

  if (!values.contractTermsHeld) {
    errors.contractTermsHeld = "Select an option.";
  }

  if (!values.claim1Summary.trim()) {
    errors.claim1Summary = "Claim 1 summary is required.";
  }

  if (values.claim1DocumentsAvailable.length === 0) {
    errors.claim1DocumentsAvailable = "Select at least one option.";
  }

  if (!values.claim2Exists) {
    errors.claim2Exists = "Select an option.";
  } else if (values.claim2Exists !== "No") {
    if (!values.claim2Summary.trim()) {
      errors.claim2Summary = "Claim 2 summary is required.";
    }
    if (values.claim2DocumentsAvailable.length === 0) {
      errors.claim2DocumentsAvailable = "Select at least one option.";
    }
  }

  if (!values.authorityConfirmed) {
    errors.authorityConfirmed = "Authority confirmation is required.";
  }
  if (!values.contactConsent) {
    errors.contactConsent = "Contact consent is required.";
  }
  if (!values.assessmentSharingConsent) {
    errors.assessmentSharingConsent = "Assessment sharing consent is required.";
  }

  return errors;
}

function toPayload(values: ClaimFormValues) {
  const siteDiffers = values.siteSameAsRegistered !== "Yes";
  const claim2Active = values.claim2Exists === "Yes" || values.claim2Exists === "Unsure";
  return {
    business_legal_name: values.businessLegalName.trim(),
    trading_name: values.tradingName.trim(),
    company_number: values.companyNumber.trim(),
    business_type: values.businessType,
    primary_contact_name: values.primaryContactName.trim(),
    contact_role: values.contactRole.trim(),
    email: values.email.trim(),
    telephone: values.telephone.trim(),
    registered_postcode: values.registeredPostcode.trim().toUpperCase(),
    site_same_as_registered: values.siteSameAsRegistered,
    site_address: siteDiffers ? values.siteAddress.trim() : "",
    site_postcode: siteDiffers ? values.sitePostcode.trim().toUpperCase() : "",
    current_supplier: values.currentSupplier.trim(),
    historic_supplier: values.historicSupplier.trim(),
    broker_used: values.brokerUsed.trim(),
    mpan: values.mpan.trim(),
    mprn: values.mprn.trim(),
    contract_start_date: values.contractStartDate,
    contract_end_date: values.contractEndDate,
    agreement_route: values.agreementRoute,
    outbound_sales_call: values.outboundSalesCall,
    signed_loa_held: values.signedLoaHeld,
    contract_terms_held: values.contractTermsHeld,
    claim_1_summary: values.claim1Summary.trim(),
    claim_1_documents_available: values.claim1DocumentsAvailable,
    claim_2_exists: values.claim2Exists,
    claim_2_summary: claim2Active ? values.claim2Summary.trim() : "",
    claim_2_documents_available: claim2Active ? values.claim2DocumentsAvailable : [],
    authority_confirmed: values.authorityConfirmed,
    contact_consent: values.contactConsent,
    assessment_sharing_consent: values.assessmentSharingConsent,
    utility_review_opt_in: values.utilityReviewOptIn,
    marketing_consent: values.marketingConsent,
  };
}

type SectionProps = {
  badge: string;
  title: string;
  description?: string;
  children: ReactNode;
};

function Section({ badge, title, description, children }: SectionProps) {
  return (
    <fieldset className="form-section">
      <legend className="section-title">
        <span className="section-badge">{badge}</span>
        <span className="section-title-text">{title}</span>
      </legend>
      {description && <p className="section-description">{description}</p>}
      <div className="section-body">{children}</div>
    </fieldset>
  );
}

type RadioGroupProps = {
  name: string;
  label: string;
  options: string[];
  value: string;
  required?: boolean;
  error?: string;
  variant?: "default" | "segmented";
  onChange: (value: string) => void;
};

function RadioGroup({
  name,
  label,
  options,
  value,
  required,
  error,
  variant = "default",
  onChange,
}: RadioGroupProps) {
  const errorId = error ? `${name}-error` : undefined;
  const groupClassName =
    variant === "segmented" ? "option-group option-group--segmented" : "option-group";
  return (
    <div className="field-group">
      <span className="field-label">
        {label}
        {required && <span className="required-asterisk">*</span>}
      </span>
      <div className={groupClassName} role="radiogroup" aria-describedby={errorId}>
        {options.map((option) => (
          <label key={option} className="option-pill">
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
      {error && (
        <span className="field-error" id={errorId}>
          {error}
        </span>
      )}
    </div>
  );
}

type CheckboxGroupProps = {
  name: string;
  label: string;
  options: string[];
  values: string[];
  required?: boolean;
  error?: string;
  onChange: (values: string[]) => void;
};

type ModalState =
  | { open: false }
  | { open: true; variant: "success" | "error"; title: string; message: string };

type SubmissionModalProps = {
  state: ModalState;
  onClose: () => void;
};

function SubmissionModal({ state, onClose }: SubmissionModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!state.open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [state.open, onClose]);

  if (!state.open) return null;

  const { variant, title, message } = state;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submission-modal-title"
      onClick={onClose}
    >
      <div
        className={`modal-card modal-card--${variant}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={`modal-icon modal-icon--${variant}`} aria-hidden="true">
          {variant === "success" ? "✓" : "!"}
        </div>
        <h3 id="submission-modal-title" className="modal-title">
          {title}
        </h3>
        <p className="modal-message">{message}</p>
        <button
          ref={closeButtonRef}
          type="button"
          className="modal-close"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

function CheckboxGroup({ name, label, options, values, required, error, onChange }: CheckboxGroupProps) {
  const errorId = error ? `${name}-error` : undefined;
  function toggle(option: string) {
    if (values.includes(option)) {
      onChange(values.filter((value) => value !== option));
    } else {
      onChange([...values, option]);
    }
  }
  return (
    <div className="field-group">
      <span className="field-label">
        {label}
        {required && <span className="required-asterisk">*</span>}
      </span>
      <div className="option-group" aria-describedby={errorId}>
        {options.map((option) => (
          <label key={option} className="option-pill">
            <input
              type="checkbox"
              name={name}
              value={option}
              checked={values.includes(option)}
              onChange={() => toggle(option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
      {error && (
        <span className="field-error" id={errorId}>
          {error}
        </span>
      )}
    </div>
  );
}

export function EnergyClaimForm() {
  const [values, setValues] = useState<ClaimFormValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [validationHint, setValidationHint] = useState("");
  const [modal, setModal] = useState<ModalState>({ open: false });

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);
  const siteDiffers = values.siteSameAsRegistered !== "" && values.siteSameAsRegistered !== "Yes";
  const claim2Active = values.claim2Exists === "Yes" || values.claim2Exists === "Unsure";

  function updateValue<K extends keyof ClaimFormValues>(field: K, value: ClaimFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
    setValidationHint("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setValidationHint("Please fix the highlighted fields and try again.");
      return;
    }

    setIsSubmitting(true);
    setValidationHint("");

    try {
      const response = await fetch("/api/submit-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...toPayload(values), website_url: honeypot }),
      });

      const result = (await response.json().catch(() => null)) as
        | { code?: string; error?: string }
        | null;

      if (!response.ok) {
        const code = result?.code ?? "ERROGK0";
        console.error("[submit-claim]", response.status, result);
        setModal({
          open: true,
          variant: "error",
          title: ERROR_TITLE,
          message: `${ERROR_FALLBACK_MESSAGE} (Code: ${code})`,
        });
        return;
      }

      setValues(initialValues);
      setErrors({});
      setModal({
        open: true,
        variant: "success",
        title: SUCCESS_TITLE,
        message: SUCCESS_MESSAGE,
      });
    } catch (error) {
      console.error("[submit-claim] network", error);
      setModal({
        open: true,
        variant: "error",
        title: ERROR_TITLE,
        message: `${ERROR_FALLBACK_MESSAGE} (Code: ERROGK8)`,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="claim-form" onSubmit={handleSubmit} noValidate>
      <div className="form-heading">
        <h2>Start your claim enquiry</h2>
        <p>Required fields are marked with an asterisk.</p>
      </div>

      {import.meta.env.DEV && (
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            padding: "0.75rem",
            background: "#fef3c7",
            border: "1px dashed #f59e0b",
            borderRadius: "0.5rem",
            fontSize: "0.8125rem",
          }}
        >
          <span style={{ alignSelf: "center", fontWeight: 600, color: "#92400e" }}>
            DEV preview:
          </span>
          <button
            type="button"
            onClick={() =>
              setModal({
                open: true,
                variant: "success",
                title: SUCCESS_TITLE,
                message: SUCCESS_MESSAGE,
              })
            }
            style={{ padding: "0.4rem 0.75rem", cursor: "pointer" }}
          >
            Test success
          </button>
          <button
            type="button"
            onClick={() =>
              setModal({
                open: true,
                variant: "error",
                title: ERROR_TITLE,
                message: ERROR_FALLBACK_MESSAGE,
              })
            }
            style={{ padding: "0.4rem 0.75rem", cursor: "pointer" }}
          >
            Test error
          </button>
        </div>
      )}

      <div className="honeypot-field" aria-hidden="true">
        <label htmlFor="website_url">Website (leave blank)</label>
        <input
          id="website_url"
          name="website_url"
          type="text"
          autoComplete="off"
          tabIndex={-1}
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <Section badge="A" title="Business details">
        <div className="field-group">
          <label htmlFor="businessLegalName">Business legal name *</label>
          <input
            id="businessLegalName"
            name="businessLegalName"
            autoComplete="organization"
            value={values.businessLegalName}
            onChange={(e) => updateValue("businessLegalName", e.target.value)}
            aria-invalid={Boolean(errors.businessLegalName)}
            aria-describedby={errors.businessLegalName ? "businessLegalName-error" : undefined}
            required
          />
          {errors.businessLegalName && (
            <span className="field-error" id="businessLegalName-error">
              {errors.businessLegalName}
            </span>
          )}
        </div>

        <div className="field-grid">
          <div className="field-group">
            <label htmlFor="tradingName">
              Trading name<span className="optional-tag">Optional</span>
            </label>
            <input
              id="tradingName"
              name="tradingName"
              value={values.tradingName}
              onChange={(e) => updateValue("tradingName", e.target.value)}
            />
            <span className="field-hint">Only if different from legal name.</span>
          </div>

          <div className="field-group">
            <label htmlFor="companyNumber">
              Company number<span className="optional-tag">Optional</span>
            </label>
            <input
              id="companyNumber"
              name="companyNumber"
              value={values.companyNumber}
              onChange={(e) => updateValue("companyNumber", e.target.value)}
            />
            <span className="field-hint">Companies House number, if known.</span>
          </div>
        </div>

        <RadioGroup
          name="businessType"
          label="Business type"
          options={businessTypeOptions}
          value={values.businessType}
          onChange={(v) => updateValue("businessType", v)}
          error={errors.businessType}
          required
        />
      </Section>

      <Section badge="B" title="Contact details">
        <div className="field-grid">
          <div className="field-group">
            <label htmlFor="primaryContactName">Primary contact name *</label>
            <input
              id="primaryContactName"
              name="primaryContactName"
              autoComplete="name"
              value={values.primaryContactName}
              onChange={(e) => updateValue("primaryContactName", e.target.value)}
              aria-invalid={Boolean(errors.primaryContactName)}
              required
            />
            {errors.primaryContactName && (
              <span className="field-error">{errors.primaryContactName}</span>
            )}
          </div>

          <div className="field-group">
            <label htmlFor="contactRole">Role / position *</label>
            <input
              id="contactRole"
              name="contactRole"
              value={values.contactRole}
              onChange={(e) => updateValue("contactRole", e.target.value)}
              aria-invalid={Boolean(errors.contactRole)}
              required
            />
            {errors.contactRole && (
              <span className="field-error">{errors.contactRole}</span>
            )}
          </div>
        </div>

        <div className="field-grid">
          <div className="field-group">
            <label htmlFor="email">Email address *</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(e) => updateValue("email", e.target.value)}
              aria-invalid={Boolean(errors.email)}
              required
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="field-group">
            <label htmlFor="telephone">Telephone number *</label>
            <input
              id="telephone"
              name="telephone"
              type="tel"
              autoComplete="tel"
              value={values.telephone}
              onChange={(e) => updateValue("telephone", e.target.value)}
              aria-invalid={Boolean(errors.telephone)}
              required
            />
            {errors.telephone && (
              <span className="field-error">{errors.telephone}</span>
            )}
          </div>
        </div>
      </Section>

      <Section badge="C" title="Address details">
        <div className="field-group">
          <label htmlFor="registeredPostcode">Registered postcode *</label>
          <input
            id="registeredPostcode"
            name="registeredPostcode"
            autoComplete="postal-code"
            value={values.registeredPostcode}
            onChange={(e) =>
              updateValue("registeredPostcode", e.target.value.toUpperCase())
            }
            aria-invalid={Boolean(errors.registeredPostcode)}
            required
          />
          {errors.registeredPostcode && (
            <span className="field-error">{errors.registeredPostcode}</span>
          )}
        </div>

        <RadioGroup
          name="siteSameAsRegistered"
          label="Is the energy supply site the same as the registered address?"
          options={yesNoUnsureOptions}
          value={values.siteSameAsRegistered}
          onChange={(v) => updateValue("siteSameAsRegistered", v)}
          error={errors.siteSameAsRegistered}
          variant="segmented"
          required
        />

        {siteDiffers && (
          <>
            <div className="field-group">
              <label htmlFor="siteAddress">Site address *</label>
              <textarea
                id="siteAddress"
                name="siteAddress"
                rows={3}
                value={values.siteAddress}
                onChange={(e) => updateValue("siteAddress", e.target.value)}
                aria-invalid={Boolean(errors.siteAddress)}
              />
              {errors.siteAddress && (
                <span className="field-error">{errors.siteAddress}</span>
              )}
            </div>

            <div className="field-group">
              <label htmlFor="sitePostcode">Site postcode *</label>
              <input
                id="sitePostcode"
                name="sitePostcode"
                value={values.sitePostcode}
                onChange={(e) =>
                  updateValue("sitePostcode", e.target.value.toUpperCase())
                }
                aria-invalid={Boolean(errors.sitePostcode)}
              />
              {errors.sitePostcode && (
                <span className="field-error">{errors.sitePostcode}</span>
              )}
            </div>
          </>
        )}
      </Section>

      <Section
        badge="D"
        title="Energy details"
        description="Provide what you know. Leave blank if unsure."
      >
        <div className="field-grid">
          <div className="field-group">
            <label htmlFor="currentSupplier">Current energy supplier</label>
            <input
              id="currentSupplier"
              name="currentSupplier"
              value={values.currentSupplier}
              onChange={(e) => updateValue("currentSupplier", e.target.value)}
            />
          </div>

          <div className="field-group">
            <label htmlFor="historicSupplier">Historic supplier relevant to review</label>
            <input
              id="historicSupplier"
              name="historicSupplier"
              value={values.historicSupplier}
              onChange={(e) => updateValue("historicSupplier", e.target.value)}
              placeholder="e.g. Npower, BES, Opus"
            />
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="brokerUsed">Broker / consultant used</label>
          <input
            id="brokerUsed"
            name="brokerUsed"
            value={values.brokerUsed}
            onChange={(e) => updateValue("brokerUsed", e.target.value)}
            placeholder="e.g. Watt Utilities"
          />
        </div>

        <div className="field-grid">
          <div className="field-group">
            <label htmlFor="mpan">
              MPAN (electricity)<span className="optional-tag">Optional</span>
            </label>
            <input
              id="mpan"
              name="mpan"
              value={values.mpan}
              onChange={(e) => updateValue("mpan", e.target.value)}
              placeholder="13-digit electricity number"
            />
          </div>

          <div className="field-group">
            <label htmlFor="mprn">
              MPRN (gas)<span className="optional-tag">Optional</span>
            </label>
            <input
              id="mprn"
              name="mprn"
              value={values.mprn}
              onChange={(e) => updateValue("mprn", e.target.value)}
              placeholder="6-10 digit gas number"
            />
          </div>
        </div>

        <div className="field-grid">
          <div className="field-group">
            <label htmlFor="contractStartDate">Contract start date</label>
            <input
              id="contractStartDate"
              name="contractStartDate"
              type="date"
              value={values.contractStartDate}
              onChange={(e) => updateValue("contractStartDate", e.target.value)}
            />
          </div>

          <div className="field-group">
            <label htmlFor="contractEndDate">Contract end date</label>
            <input
              id="contractEndDate"
              name="contractEndDate"
              type="date"
              value={values.contractEndDate}
              onChange={(e) => updateValue("contractEndDate", e.target.value)}
            />
          </div>
        </div>
      </Section>

      <Section badge="E" title="Agreement route">
        <RadioGroup
          name="agreementRoute"
          label="How was the contract agreed?"
          options={agreementRouteOptions}
          value={values.agreementRoute}
          onChange={(v) => updateValue("agreementRoute", v)}
          error={errors.agreementRoute}
          required
        />

        <RadioGroup
          name="outboundSalesCall"
          label="Was there an outbound sales call?"
          options={yesNoUnsureOptions}
          value={values.outboundSalesCall}
          onChange={(v) => updateValue("outboundSalesCall", v)}
          error={errors.outboundSalesCall}
          variant="segmented"
          required
        />

        <RadioGroup
          name="signedLoaHeld"
          label="Do you hold a signed Letter of Authority?"
          options={yesNoUnsureOptions}
          value={values.signedLoaHeld}
          onChange={(v) => updateValue("signedLoaHeld", v)}
          error={errors.signedLoaHeld}
          variant="segmented"
          required
        />

        <RadioGroup
          name="contractTermsHeld"
          label="Do you hold contract confirmation emails or terms?"
          options={yesNoUnsureOptions}
          value={values.contractTermsHeld}
          onChange={(v) => updateValue("contractTermsHeld", v)}
          error={errors.contractTermsHeld}
          variant="segmented"
          required
        />
      </Section>

      <Section badge="F" title="Claim 1">
        <div className="field-group">
          <label htmlFor="claim1Summary">Claim 1 summary *</label>
          <textarea
            id="claim1Summary"
            name="claim1Summary"
            rows={4}
            value={values.claim1Summary}
            onChange={(e) => updateValue("claim1Summary", e.target.value)}
            placeholder="What supplier/broker/period is this about?"
            aria-invalid={Boolean(errors.claim1Summary)}
            required
          />
          {errors.claim1Summary && (
            <span className="field-error">{errors.claim1Summary}</span>
          )}
        </div>

        <CheckboxGroup
          name="claim1DocumentsAvailable"
          label="Claim 1 document types available"
          options={documentTypeOptions}
          values={values.claim1DocumentsAvailable}
          onChange={(v) => updateValue("claim1DocumentsAvailable", v)}
          error={errors.claim1DocumentsAvailable}
          required
        />
      </Section>

      <Section badge="G" title="Claim 2">
        <RadioGroup
          name="claim2Exists"
          label="Do you have a second contract/site/potential claim?"
          options={yesNoUnsureOptions}
          value={values.claim2Exists}
          onChange={(v) => updateValue("claim2Exists", v)}
          error={errors.claim2Exists}
          variant="segmented"
          required
        />

        {claim2Active && (
          <>
            <div className="field-group">
              <label htmlFor="claim2Summary">Claim 2 summary *</label>
              <textarea
                id="claim2Summary"
                name="claim2Summary"
                rows={4}
                value={values.claim2Summary}
                onChange={(e) => updateValue("claim2Summary", e.target.value)}
                placeholder="Second contract/site/period"
                aria-invalid={Boolean(errors.claim2Summary)}
              />
              {errors.claim2Summary && (
                <span className="field-error">{errors.claim2Summary}</span>
              )}
            </div>

            <CheckboxGroup
              name="claim2DocumentsAvailable"
              label="Claim 2 document types available"
              options={documentTypeOptions}
              values={values.claim2DocumentsAvailable}
              onChange={(v) => updateValue("claim2DocumentsAvailable", v)}
              error={errors.claim2DocumentsAvailable}
              required
            />
          </>
        )}
      </Section>

      <Section badge="H" title="Consent">
        <div className="consent-row">
          <input
            id="authorityConfirmed"
            name="authorityConfirmed"
            type="checkbox"
            checked={values.authorityConfirmed}
            onChange={(e) => updateValue("authorityConfirmed", e.target.checked)}
            aria-invalid={Boolean(errors.authorityConfirmed)}
            required
          />
          <label htmlFor="authorityConfirmed">
            I confirm I have authority to submit this enquiry on behalf of the business. *
          </label>
        </div>
        {errors.authorityConfirmed && (
          <span className="field-error consent-error">{errors.authorityConfirmed}</span>
        )}

        <div className="consent-row">
          <input
            id="contactConsent"
            name="contactConsent"
            type="checkbox"
            checked={values.contactConsent}
            onChange={(e) => updateValue("contactConsent", e.target.checked)}
            aria-invalid={Boolean(errors.contactConsent)}
            required
          />
          <label htmlFor="contactConsent">
            I consent to be contacted regarding this expression of interest. *
          </label>
        </div>
        {errors.contactConsent && (
          <span className="field-error consent-error">{errors.contactConsent}</span>
        )}

        <div className="consent-row">
          <input
            id="assessmentSharingConsent"
            name="assessmentSharingConsent"
            type="checkbox"
            checked={values.assessmentSharingConsent}
            onChange={(e) => updateValue("assessmentSharingConsent", e.target.checked)}
            aria-invalid={Boolean(errors.assessmentSharingConsent)}
            required
          />
          <label htmlFor="assessmentSharingConsent">
            I consent to my assessment being shared with RMB / assessment partner / solicitor as needed. *
          </label>
        </div>
        {errors.assessmentSharingConsent && (
          <span className="field-error consent-error">{errors.assessmentSharingConsent}</span>
        )}

        <div className="consent-divider">Optional</div>

        <div className="consent-row">
          <input
            id="utilityReviewOptIn"
            name="utilityReviewOptIn"
            type="checkbox"
            checked={values.utilityReviewOptIn}
            onChange={(e) => updateValue("utilityReviewOptIn", e.target.checked)}
          />
          <label htmlFor="utilityReviewOptIn">
            I would like a separate utility review (Evolve / utility follow-up).
          </label>
        </div>

        <div className="consent-row">
          <input
            id="marketingConsent"
            name="marketingConsent"
            type="checkbox"
            checked={values.marketingConsent}
            onChange={(e) => updateValue("marketingConsent", e.target.checked)}
          />
          <label htmlFor="marketingConsent">
            I consent to receive marketing communications.
          </label>
        </div>
      </Section>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Claim Enquiry"}
      </button>

      {validationHint && (
        <div className="form-message error" role="alert">
          {validationHint}
        </div>
      )}

      {hasErrors && <span className="sr-only">The form has errors.</span>}

      <SubmissionModal state={modal} onClose={() => setModal({ open: false })} />
    </form>
  );
}
