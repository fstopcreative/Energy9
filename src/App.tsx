import { EnergyClaimForm } from "./components/EnergyClaimForm";

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
            <span>7 min Process</span>
            <span>Secure &amp; Compliant Data Handling</span>
            <span>48-Hour Response Time</span>
          </div>
        </div>

        <EnergyClaimForm />
      </section>
    </main>
  );
}
