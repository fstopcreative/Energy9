const HOME_BASE = "https://energy-claim-home-page.vercel.app";

const policyLinks = [
  { label: "Privacy Notice", href: `${HOME_BASE}/privacy.html` },
  { label: "Cookie and Tracking Policy", href: `${HOME_BASE}/cookies.html` },
  { label: "Website Terms of Use", href: `${HOME_BASE}/terms.html` },
  { label: "BEC Form Terms and Consent Notice", href: `${HOME_BASE}/bec-form.html` },
  { label: "Contact and Communications Policy", href: `${HOME_BASE}/contact-policy.html` },
  { label: "Complaints / Concerns Procedure", href: `${HOME_BASE}/complaints.html` },
  { label: "Accessibility Statement", href: `${HOME_BASE}/accessibility.html` },
  { label: "Data Retention and Document Handling Policy", href: `${HOME_BASE}/data-retention.html` },
  { label: "Partner / Referral Disclosure", href: `${HOME_BASE}/partner-disclosure.html` },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__grid">
          <div className="site-footer__col site-footer__col--brand">
            <div className="site-footer__brand">wbpdux</div>
            <p className="site-footer__desc">
              Wbpdux is a document-management and referral-support service. We are
              not a law firm and do not provide legal advice. Any legal assessment
              is undertaken by an appointed assessment team or solicitor under its
              own terms.
            </p>
            <div className="site-footer__contact">
              <div className="site-footer__contact-row">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="site-footer__icon"
                >
                  <path
                    d="M12 22s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                <span>
                  5/6 Salmon Fields Business Village, Oldham, Lancashire, United
                  Kingdom, OL2 6HT.
                </span>
              </div>
              <div className="site-footer__contact-row">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="site-footer__icon"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M4 7l8 6 8-6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <a href="mailto:info@wbpdux.co.uk">info@wbpdux.co.uk</a>
              </div>
            </div>
          </div>

          <div className="site-footer__col site-footer__col--links">
            <h4 className="site-footer__heading">Policies</h4>
            <ul className="site-footer__links">
              {policyLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="site-footer__bottom">
          <div>
            Wellbeing Places Limited trading as Wbpdux Company Number: 11342583
          </div>
        </div>
      </div>
    </footer>
  );
}
