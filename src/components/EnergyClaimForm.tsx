import { FormEvent, useMemo, useState } from "react";

type ClaimFormValues = {
  fullName: string;
  email: string;
  phone: string;
  postcode: string;
  address: string;
  claimType: string;
  message: string;
  consent: boolean;
};

type FieldErrors = Partial<Record<keyof ClaimFormValues, string>>;

type SubmitState =
  | { status: "idle"; message: "" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

type EnergyClaimFormProps = {
  claimTypes: string[];
};

const initialValues: ClaimFormValues = {
  fullName: "",
  email: "",
  phone: "",
  postcode: "",
  address: "",
  claimType: "",
  message: "",
  consent: false,
};

function validate(values: ClaimFormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.fullName.trim()) {
    errors.fullName = "Full name is required.";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.phone.trim()) {
    errors.phone = "Phone number is required.";
  }

  if (!values.postcode.trim()) {
    errors.postcode = "Postcode is required.";
  }

  if (!values.claimType) {
    errors.claimType = "Select a claim type.";
  }

  if (!values.consent) {
    errors.consent = "Consent is required before submitting.";
  }

  return errors;
}

export function EnergyClaimForm({ claimTypes }: EnergyClaimFormProps) {
  const [values, setValues] = useState<ClaimFormValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
    message: "",
  });

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  function updateValue<K extends keyof ClaimFormValues>(
    field: K,
    value: ClaimFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
    setSubmitState({ status: "idle", message: "" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setSubmitState({
        status: "error",
        message: "Please fix the highlighted fields and try again.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitState({ status: "idle", message: "" });

    try {
      const response = await fetch("/api/submit-claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(result?.error ?? "Unable to submit your enquiry.");
      }

      setValues(initialValues);
      setErrors({});
      setSubmitState({
        status: "success",
        message: "Thank you. Your enquiry has been received.",
      });
    } catch (error) {
      setSubmitState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
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

      <div className="field-group">
        <label htmlFor="fullName">Full Name *</label>
        <input
          id="fullName"
          name="fullName"
          autoComplete="name"
          value={values.fullName}
          onChange={(event) => updateValue("fullName", event.target.value)}
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={errors.fullName ? "fullName-error" : undefined}
          required
        />
        {errors.fullName && (
          <span className="field-error" id="fullName-error">
            {errors.fullName}
          </span>
        )}
      </div>

      <div className="field-grid">
        <div className="field-group">
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => updateValue("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            required
          />
          {errors.email && (
            <span className="field-error" id="email-error">
              {errors.email}
            </span>
          )}
        </div>

        <div className="field-group">
          <label htmlFor="phone">Phone *</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(event) => updateValue("phone", event.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            required
          />
          {errors.phone && (
            <span className="field-error" id="phone-error">
              {errors.phone}
            </span>
          )}
        </div>
      </div>

      <div className="field-grid">
        <div className="field-group">
          <label htmlFor="postcode">Postcode *</label>
          <input
            id="postcode"
            name="postcode"
            autoComplete="postal-code"
            value={values.postcode}
            onChange={(event) =>
              updateValue("postcode", event.target.value.toUpperCase())
            }
            aria-invalid={Boolean(errors.postcode)}
            aria-describedby={errors.postcode ? "postcode-error" : undefined}
            required
          />
          {errors.postcode && (
            <span className="field-error" id="postcode-error">
              {errors.postcode}
            </span>
          )}
        </div>

        <div className="field-group">
          <label htmlFor="claimType">Claim Type *</label>
          <select
            id="claimType"
            name="claimType"
            value={values.claimType}
            onChange={(event) => updateValue("claimType", event.target.value)}
            aria-invalid={Boolean(errors.claimType)}
            aria-describedby={errors.claimType ? "claimType-error" : undefined}
            required
          >
            <option value="">Select claim type</option>
            {claimTypes.map((claimType) => (
              <option key={claimType} value={claimType}>
                {claimType}
              </option>
            ))}
          </select>
          {errors.claimType && (
            <span className="field-error" id="claimType-error">
              {errors.claimType}
            </span>
          )}
        </div>
      </div>

      <div className="field-group">
        <label htmlFor="address">Address</label>
        <input
          id="address"
          name="address"
          autoComplete="street-address"
          value={values.address}
          onChange={(event) => updateValue("address", event.target.value)}
        />
      </div>

      <div className="field-group">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={values.message}
          onChange={(event) => updateValue("message", event.target.value)}
          placeholder="Tell us what happened"
        />
      </div>

      <div className="consent-row">
        <input
          id="consent"
          name="consent"
          type="checkbox"
          checked={values.consent}
          onChange={(event) => updateValue("consent", event.target.checked)}
          aria-invalid={Boolean(errors.consent)}
          aria-describedby={errors.consent ? "consent-error" : undefined}
          required
        />
        <label htmlFor="consent">
          I agree to be contacted about my energy claim enquiry. *
        </label>
      </div>
      {errors.consent && (
        <span className="field-error consent-error" id="consent-error">
          {errors.consent}
        </span>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Claim Enquiry"}
      </button>

      {submitState.message && (
        <div
          className={`form-message ${submitState.status}`}
          role={submitState.status === "error" ? "alert" : "status"}
        >
          {submitState.message}
        </div>
      )}

      {hasErrors && <span className="sr-only">The form has errors.</span>}
    </form>
  );
}
