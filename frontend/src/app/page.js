const cscFeeds = [
  { label: 'Official CSC Portal', url: 'https://csc.gov.in/', tag: 'Official' },
  { label: 'Digital Seva live services', url: 'https://digitalseva.csc.gov.in/', tag: 'Live' },
  { label: 'CSC newsletter / Tarang updates', url: 'https://csc.gov.in/new_newsletter', tag: 'News' },
  { label: 'CSC social updates', url: 'https://twitter.com/CSCegov_', tag: 'Feed' },
];

const services = [
  ['Service', 'Government Forms', 'Eligibility, documents, fees, and processing time explained clearly.'],
  ['AI', 'Knowledge Assistant', 'Hindi/English help for CSC services, schemes, FAQs, and documents.'],
  ['Trust', 'Reviews', 'Original testimonials and local proof improve confidence and conversions.'],
  ['Local', 'Map Location', 'One-tap directions and contact actions for mobile visitors.'],
];

export default function Home() {
  return (
    <main>
      <header className="top">
        <div className="brand"><b>CSC SHIKOHABAD</b> – <span>Ankit Tiwari CSC Center</span> <em>AI Knowledge Platform</em></div>
      </header>
      <nav className="marquee" aria-label="Highlighted live CSC feeds">
        <strong>🔴 LIVE CSC FEEDS</strong>
        <div className="track">
          {[...cscFeeds, ...cscFeeds].map((feed, index) => (
            <a href={feed.url} target="_blank" rel="noreferrer" key={`${feed.label}-${index}`}>
              {feed.label} <span>{feed.tag}</span>
            </a>
          ))}
        </div>
      </nav>
      <section className="grid hero">
        <article className="panel">
          <span className="badge">Vercel + Streamlit ready</span>
          <h1>Trusted Digital India services with AI guidance.</h1>
          <p>Your trusted partner for Digital India services, government schemes, documents, payments, and online solutions in Shikohabad.</p>
          <div className="cta">
            <a className="btn primary" href="#services">Explore Services</a>
            <a className="btn secondary" href="https://maps.app.goo.gl/WNidZh1cEukiXna88" target="_blank" rel="noreferrer">Get Directions</a>
          </div>
          <div className="metricRow"><div><b>4+</b>Service groups</div><div><b>24/7</b>Online guidance</div><div><b>1-tap</b>Map route</div></div>
        </article>
        <aside className="panel">
          <span className="badge">Your Local CSC Center</span>
          <h2>Ankit Tiwari CSC Center</h2>
          <p>Purana Bijli Office, Agra Road, near Roadways Bus Stand, Shikohabad</p>
          <ul><li>Government forms and certificates</li><li>Scheme and document guidance</li><li>Digital payments and applications</li></ul>
        </aside>
      </section>
      <section id="services" className="cards">
        {services.map(([badge, title, body]) => <article className="card" key={title}><span className="badge">{badge}</span><h3>{title}</h3><p>{body}</p></article>)}
      </section>
      <section className="grid">
        <article className="panel review"><h2>Original Review</h2><p>“Bahut achha service mila, process fast aur transparent tha. CSC Shikohabad team ne documents aur scheme guidance clearly explain ki.”</p></article>
        <article className="panel"><h2>Map Location</h2><iframe title="Ankit Tiwari CSC Center map" src="https://www.google.com/maps?q=Ankit%20Tiwari%20CSC%20Center&output=embed" loading="lazy" /></article>
      </section>
      <footer>Vercel deployment build — ready from <code>frontend/src/app/</code>. Streamlit deployment remains ready from <code>streamlit_app.py</code>.</footer>
    </main>
  );
}
