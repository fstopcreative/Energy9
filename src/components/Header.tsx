const homeHref = "https://energy-claim-home-page.vercel.app/";

export function Header() {
  return (
    <nav className="site-nav" aria-label="Primary">
      <div className="site-nav__inner">
        <a href={homeHref} className="site-nav__brand">
          wbpdux
        </a>
      </div>
    </nav>
  );
}
