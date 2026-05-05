import { EnergyClaimForm } from "./components/EnergyClaimForm";

const claimTypes = [
  "Overcharged energy bill",
  "Incorrect meter reading",
  "Smart meter issue",
  "Supplier switching problem",
  "Credit refund owed",
  "Business energy broker commission",
  "Other",
];

export default function App() {
  return (
    <main className="page-shell">
      <section className="hero-section" aria-labelledby="page-title">
        <div className="hero-content">
          <p className="trust-line">Energy claim support</p>
          <h1 id="page-title">Check if you may have an energy claim</h1>
          <p className="hero-copy">
            Submit your details and our team will review your enquiry. Your
            information is sent securely to our claims workflow for follow-up.
          </p>

          <div className="assurance-list" aria-label="Service assurances">
            <span>No obligation review</span>
            <span>Fast response</span>
            <span>Secure submission</span>
          </div>
        </div>

        <EnergyClaimForm claimTypes={claimTypes} />
      </section>
    </main>
  );
}
