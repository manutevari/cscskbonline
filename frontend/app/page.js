const cscFeeds = [
  { label: 'CSC Official Portal', url: 'https://csc.gov.in/', tag: 'Official' },
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
        <div className="brand"><b>CSCSKB ONLINE</b> – <span>AI Powered CSC</span> <em>Knowledge & Service Platform</em></div>
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
          <h1>Fast, trusted CSC help with AI guidance.</h1>
          <p>Deploy this CSCSKB Online landing page on Vercel as a Next.js app and on Streamlit Cloud from the same repository.</p>
          <div className="cta">
            <a className="btn primary" href="#services">Explore Services</a>
            <a className="btn secondary" href="https://maps.app.goo.gl/WNidZh1cEukiXna88" target="_blank" rel="noreferrer">Get Directions</a>
          </div>
          <div className="metricRow"><div><b>4+</b>Service groups</div><div><b>24/7</b>Online guidance</div><div><b>1-tap</b>Map route</div></div>
        </article>
        <aside className="panel">
          <span className="badge">Local CSC Center</span>
          <h2>Ankit Tiwari CSC Center</h2>
          <p>Digital India • Power To Empower</p>
          <ul><li>Government forms and certificates</li><li>Scheme/document guidance</li><li>Payment and application support</li></ul>
        </aside>
      </section>
      <section id="services" className="cards">
        {services.map(([badge, title, body]) => <article className="card" key={title}><span className="badge">{badge}</span><h3>{title}</h3><p>{body}</p></article>)}
      </section>
      <section className="grid">
        <article className="panel review"><h2>Original Review</h2><p>“Very helpful CSC center for online government services. The guidance was clear, the process was transparent, and my work was completed on time.”</p></article>
        <article className="panel"><h2>Map Location</h2><iframe title="Ankit Tiwari CSC Center map" src="https://www.google.com/maps?q=Ankit%20Tiwari%20CSC%20Center&output=embed" loading="lazy" /></article>
      </section>
      <footer>Vercel deployment build — ready from <code>frontend/</code>. Streamlit deployment remains ready from <code>streamlit_app.py</code>.</footer>
    </main>
  );
}
