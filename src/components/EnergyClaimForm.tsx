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
    <section className="bg-white rounded-3xl shadow-xl shadow-emerald-900/5 border border-emerald-50 p-8 md:p-10" data-purpose="form-container">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Start your claim enquiry</h2>
        <p className="text-sm text-slate-500 mt-1">Required fields are marked with an asterisk.</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {/* Full Name */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-sm font-semibold text-slate-700" htmlFor="fullName">Full Name *</label>
          <input
            className="block w-full px-4 py-3 bg-emerald-50/30 border border-emerald-100 rounded-xl text-slate-800 focus:bg-white transition-colors outline-none focus:border-[#065F46] focus:ring-2 focus:ring-[#065F46]/20"
            id="fullName"
            name="fullName"
            autoComplete="name"
            value={values.fullName}
            onChange={(event) => updateValue("fullName", event.target.value)}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
            placeholder="John Doe"
            required
          />
          {errors.fullName && (
            <span className="text-xs text-red-500 mt-1" id="fullName-error">
              {errors.fullName}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Email */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-semibold text-slate-700" htmlFor="email">Email *</label>
            <input
              className="block w-full px-4 py-3 bg-emerald-50/30 border border-emerald-100 rounded-xl text-slate-800 focus:bg-white transition-colors outline-none focus:border-[#065F46] focus:ring-2 focus:ring-[#065F46]/20"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(event) => updateValue("email", event.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              placeholder="john@example.com"
              required
            />
            {errors.email && (
              <span className="text-xs text-red-500 mt-1" id="email-error">
                {errors.email}
              </span>
            )}
          </div>

          {/* Phone */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-semibold text-slate-700" htmlFor="phone">Phone *</label>
            <input
              className="block w-full px-4 py-3 bg-emerald-50/30 border border-emerald-100 rounded-xl text-slate-800 focus:bg-white transition-colors outline-none focus:border-[#065F46] focus:ring-2 focus:ring-[#065F46]/20"
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={values.phone}
              onChange={(event) => updateValue("phone", event.target.value)}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              placeholder="0123 456 7890"
              required
            />
            {errors.phone && (
              <span className="text-xs text-red-500 mt-1" id="phone-error">
                {errors.phone}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Postcode */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-semibold text-slate-700" htmlFor="postcode">Postcode *</label>
            <input
              className="block w-full px-4 py-3 bg-emerald-50/30 border border-emerald-100 rounded-xl text-slate-800 focus:bg-white transition-colors outline-none focus:border-[#065F46] focus:ring-2 focus:ring-[#065F46]/20"
              id="postcode"
              name="postcode"
              autoComplete="postal-code"
              value={values.postcode}
              onChange={(event) =>
                updateValue("postcode", event.target.value.toUpperCase())
              }
              aria-invalid={Boolean(errors.postcode)}
              aria-describedby={errors.postcode ? "postcode-error" : undefined}
              placeholder="SW1A 1AA"
              required
            />
            {errors.postcode && (
              <span className="text-xs text-red-500 mt-1" id="postcode-error">
                {errors.postcode}
              </span>
            )}
          </div>

          {/* Claim Type */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-semibold text-slate-700" htmlFor="claimType">Claim Type *</label>
            <select
              className="block w-full px-4 py-3 bg-emerald-50/30 border border-emerald-100 rounded-xl text-slate-800 focus:bg-white transition-colors appearance-none outline-none focus:border-[#065F46] focus:ring-2 focus:ring-[#065F46]/20"
              id="claimType"
              name="claimType"
              value={values.claimType}
              onChange={(event) => updateValue("claimType", event.target.value)}
              aria-invalid={Boolean(errors.claimType)}
              aria-describedby={errors.claimType ? "claimType-error" : undefined}
              required
            >
              <option value="" disabled>Select claim type</option>
              {claimTypes.map((claimType) => (
                <option key={claimType} value={claimType}>
                  {claimType}
                </option>
              ))}
            </select>
            {errors.claimType && (
              <span className="text-xs text-red-500 mt-1" id="claimType-error">
                {errors.claimType}
              </span>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-sm font-semibold text-slate-700" htmlFor="address">Address</label>
          <input
            className="block w-full px-4 py-3 bg-emerald-50/30 border border-emerald-100 rounded-xl text-slate-800 focus:bg-white transition-colors outline-none focus:border-[#065F46] focus:ring-2 focus:ring-[#065F46]/20"
            id="address"
            name="address"
            autoComplete="street-address"
            value={values.address}
            onChange={(event) => updateValue("address", event.target.value)}
            placeholder="Your full address"
          />
        </div>

        {/* Message */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-sm font-semibold text-slate-700" htmlFor="message">Message</label>
          <textarea
            className="block w-full px-4 py-3 bg-emerald-50/30 border border-emerald-100 rounded-xl text-slate-800 focus:bg-white transition-colors resize-none outline-none focus:border-[#065F46] focus:ring-2 focus:ring-[#065F46]/20"
            id="message"
            name="message"
            rows={5}
            value={values.message}
            onChange={(event) => updateValue("message", event.target.value)}
            placeholder="Tell us what happened"
          />
        </div>

        {/* Consent Checkbox */}
        <div className="flex items-start space-x-3 pt-2">
          <input
            className="w-5 h-5 mt-0.5 text-[#065F46] bg-emerald-50 border-emerald-200 rounded focus:ring-[#065F46] focus:ring-2"
            id="consent"
            name="consent"
            type="checkbox"
            checked={values.consent}
            onChange={(event) => updateValue("consent", event.target.checked)}
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? "consent-error" : undefined}
            required
          />
          <div className="flex flex-col">
            <label className="text-sm text-slate-600" htmlFor="consent">
              I agree to be contacted about my energy claim enquiry. *
            </label>
            {errors.consent && (
              <span className="text-xs text-red-500 mt-1" id="consent-error">
                {errors.consent}
              </span>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button 
            className="w-full py-4 bg-[#065F46] hover:bg-[#044e3a] text-white font-bold text-lg rounded-xl shadow-lg shadow-emerald-900/20 transition-all duration-200 transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Claim Enquiry"}
          </button>
        </div>

        {submitState.message && (
          <div
            className={`p-4 rounded-xl text-sm ${
              submitState.status === "error" 
                ? "bg-red-50 text-red-800 border border-red-200" 
                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
            }`}
            role={submitState.status === "error" ? "alert" : "status"}
          >
            {submitState.message}
          </div>
        )}

        {hasErrors && <span className="sr-only">The form has errors.</span>}
      </form>
    </section>
  );
}
