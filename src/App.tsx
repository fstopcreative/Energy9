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
    <div className="min-h-screen flex items-center justify-center p-6 md:p-12">
      <main className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center" data-purpose="hero-section">
        <section className="space-y-8" data-purpose="claim-info">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#065F46] mb-3 block">
              Energy Claim Support
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-800 leading-tight">
              Check if you may have an energy claim
            </h1>
            <p className="mt-6 text-lg text-slate-600 max-w-xl leading-relaxed">
              Submit your details and our team will review your enquiry. Your information is sent securely to our claims workflow for follow-up.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3" data-purpose="trust-badges">
            <span className="px-4 py-2 bg-white border border-emerald-100 rounded-full text-sm font-medium text-slate-700 shadow-sm">
              No obligation review
            </span>
            <span className="px-4 py-2 bg-white border border-emerald-100 rounded-full text-sm font-medium text-slate-700 shadow-sm">
              Fast response
            </span>
            <span className="px-4 py-2 bg-white border border-emerald-100 rounded-full text-sm font-medium text-slate-700 shadow-sm">
              Secure submission
            </span>
          </div>
        </section>

        <EnergyClaimForm claimTypes={claimTypes} />
      </main>
    </div>
  );
}
