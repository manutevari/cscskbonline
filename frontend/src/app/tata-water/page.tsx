import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tata Water & Beverages | Shikohabad",
  description:
    "Tata Water, Tata Copper+ Water and Tata Gluco+ beverage enquiries and local distributor support in Shikohabad, Firozabad, Uttar Pradesh.",
};

const PHONE = "+918937887070";
const SECOND_PHONE = "+918979604695";
const WHATSAPP = "https://wa.me/918937887070?text=Hello%2C%20I%20want%20to%20enquire%20about%20Tata%20Water%20and%20Beverages.";
const FACEBOOK = "https://www.facebook.com/profile.php?id=61581329466166";
const MAPS = "https://maps.app.goo.gl/5sjao2KhtvRgioU7A";
const REVIEW = "https://g.page/r/CeLm6K0yGQAjEBM/review";

type Product = {
  name: string;
  size: string;
  category: string;
  description: string;
  tone: "orange" | "pink" | "lime" | "yellow" | "red" | "copper";
  mark: string;
};

const products: Product[] = [
  { name: "Tata Gluco+ Sports Drink", size: "200 ML", category: "Sports Drink", description: "Refreshing beverage for an active day.", tone: "red", mark: "GLUCO+" },
  { name: "Tata Gluco+ Orange Juice", size: "180 ML", category: "Juice", description: "Bright orange flavour for a refreshing break.", tone: "orange", mark: "ORANGE" },
  { name: "Tata Gluco+ Lychee Juice", size: "180 ML", category: "Juice", description: "Sweet lychee flavour in a convenient pack.", tone: "pink", mark: "LYCHEE" },
  { name: "Tata Gluco+ Lemon Juice", size: "180 ML", category: "Juice", description: "Zesty lemon flavour for a fresh taste.", tone: "lime", mark: "LEMON" },
  { name: "Tata GP Jelly Lychee", size: "180 ML", category: "Jelly", description: "Fruity lychee jelly beverage for a tasty treat.", tone: "pink", mark: "JELLY" },
  { name: "Tata Copper+ Water", size: "250 ML", category: "Copper+ Water", description: "Convenient small pack for everyday hydration.", tone: "copper", mark: "COPPER+" },
  { name: "Tata Copper+ Water", size: "500 ML", category: "Copper+ Water", description: "Easy-to-carry pack for travel and daily use.", tone: "copper", mark: "COPPER+" },
  { name: "Tata Copper+ Water", size: "1000 ML", category: "Copper+ Water", description: "A practical larger pack for home and work.", tone: "copper", mark: "COPPER+" },
  { name: "Tata Copper+ Water", size: "2000 ML", category: "Copper+ Water", description: "Large pack for families, offices and gatherings.", tone: "copper", mark: "COPPER+" },
];

export default function TataWaterPage() {
  return (
    <main className="tw-page">
      <style>{styles}</style>

      <header className="tw-header">
        <div className="tw-container tw-nav">
          <a href="/" className="tw-brand" aria-label="CSC SKB Online Home">
            <span className="tw-tata-mark">T</span>
            <span>
              <strong>TATA Water &amp; Beverages</strong>
              <small>Distributor Support • Shikohabad</small>
            </span>
          </a>
          <nav className="tw-menu" aria-label="Main navigation">
            <a href="/">CSC Home</a>
            <a href="#products">Products</a>
            <a href="#support">Delivery</a>
            <a href="#contact">Contact</a>
          </nav>
          <a className="tw-wa-head" href={WHATSAPP} target="_blank" rel="noopener noreferrer">💬 Order on WhatsApp</a>
        </div>
      </header>

      <section className="tw-hero">
        <div className="tw-water-orb orb-one" />
        <div className="tw-water-orb orb-two" />
        <div className="tw-container tw-hero-grid">
          <div className="tw-hero-copy">
            <span className="tw-kicker">TATA WATER &amp; BEVERAGES • SHIKOHABAD</span>
            <h1>Pure Water.<br /><em>Better Beverages.</em></h1>
            <p>Trusted Tata Water and beverage products for homes, shops, offices and businesses across Shikohabad and nearby areas.</p>
            <div className="tw-actions">
              <a className="tw-btn tw-btn-primary" href="#products">Explore Products <span>→</span></a>
              <a className="tw-btn tw-btn-whatsapp" href={WHATSAPP} target="_blank" rel="noopener noreferrer">💬 Order on WhatsApp</a>
            </div>
            <div className="tw-trust-row">
              <div><b>✓</b><span>Genuine Tata Products</span></div>
              <div><b>✓</b><span>Local Shikohabad Support</span></div>
              <div><b>✓</b><span>Fast Enquiry &amp; Delivery</span></div>
            </div>
          </div>
          <div className="tw-hero-art" aria-hidden="true">
            <div className="tw-splash splash-a" />
            <div className="tw-splash splash-b" />
            <div className="tw-bottle tw-water-bottle"><span className="mini-t">T</span><strong>TATA<br />WATER</strong></div>
            <div className="tw-cup"><span>GOOD<br />WATER</span></div>
            <div className="tw-bottle tw-copper-bottle"><span className="mini-t">T</span><strong>TATA<br />COPPER+</strong></div>
          </div>
        </div>
      </section>

      <section className="tw-highlights">
        <div className="tw-container tw-highlight-grid">
          <Highlight icon="🚚" title="Local Delivery" text="Shikohabad & nearby areas" />
          <Highlight icon="✓" title="Genuine Products" text="Tata Water & beverages" />
          <Highlight icon="💬" title="WhatsApp Support" text="Quick product enquiry" />
          <Highlight icon="📍" title="Local Distributor" text="Shikohabad, U.P." />
        </div>
      </section>

      <section id="products" className="tw-products-section">
        <div className="tw-container">
          <div className="tw-section-heading">
            <span>OUR PRODUCTS</span>
            <h2>Tata Beverage Collection</h2>
            <p>Water, sports drinks, juices and jelly — available for enquiry in Shikohabad.</p>
          </div>

          <div className="tw-category-pills">
            <a href="#products">All Products</a>
            <a href="#sports">Sports Drink</a>
            <a href="#juices">Juices &amp; Jelly</a>
            <a href="#copper">Tata Copper+ Water</a>
          </div>

          <div className="tw-product-grid">
            {products.map((product) => (
              <ProductCard key={`${product.name}-${product.size}`} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section id="support" className="tw-support">
        <div className="tw-container tw-support-grid">
          <div>
            <span className="tw-section-label">LOCAL SERVICE</span>
            <h2>From product enquiry to delivery support.</h2>
            <p>Tell us what product and pack size you need. We can guide you about availability, bulk requirements and delivery enquiries.</p>
            <div className="tw-support-points">
              <div><span>01</span> Product availability enquiry</div>
              <div><span>02</span> Home, shop &amp; office requirements</div>
              <div><span>03</span> Bulk order assistance</div>
              <div><span>04</span> WhatsApp customer support</div>
            </div>
          </div>
          <div className="tw-order-card">
            <div className="tw-order-icon">💧</div>
            <span>QUICK ORDER</span>
            <h3>Need Tata products?</h3>
            <p>Send your product name and required quantity on WhatsApp.</p>
            <a className="tw-btn tw-btn-whatsapp full" href={WHATSAPP} target="_blank" rel="noopener noreferrer">💬 Chat on WhatsApp</a>
            <a className="tw-call-link" href={`tel:${PHONE}`}>📞 +91-8937887070</a>
          </div>
        </div>
      </section>

      <section className="tw-contact" id="contact">
        <div className="tw-container">
          <div className="tw-contact-grid">
            <ContactCard icon="📍" title="Our Location" text="Near Bus Stand, Agra Gate, Shikohabad, U.P. 283135" href={MAPS} button="View on Google Maps" />
            <ContactCard icon="📞" title="Contact Us" text="+91-8937887070 • +91-8979604695" href={`tel:${PHONE}`} button="Call Now" />
            <ContactCard icon="⭐" title="Customer Reviews" text="Share your experience and help local customers." href={REVIEW} button="Give a Review" />
            <ContactCard icon="f" title="Follow Us" text="Stay connected for product updates and offers." href={FACEBOOK} button="Facebook" />
          </div>
        </div>
      </section>

      <footer className="tw-footer">
        <div className="tw-container tw-footer-main">
          <div className="tw-footer-brand"><span className="tw-tata-mark dark">T</span><div><strong>TATA Water &amp; Beverages</strong><small>Distributor Support — Shikohabad</small></div></div>
          <div className="tw-footer-links"><a href="/">CSC Home</a><a href="#products">Products</a><a href={WHATSAPP}>WhatsApp</a><a href={MAPS}>Location</a></div>
        </div>
        <div className="tw-container tw-footer-bottom">© {new Date().getFullYear()} Tata Water &amp; Beverages — Shikohabad, Firozabad, Uttar Pradesh <span>Powered by CSC SKB Online</span></div>
      </footer>
    </main>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="tw-product-card" id={product.category === "Sports Drink" ? "sports" : product.category === "Juice" || product.category === "Jelly" ? "juices" : "copper"}>
      <div className={`tw-pack-stage ${product.tone}`}>
        <div className="tw-pack">
          <span className="pack-cap" />
          <span className="pack-logo">TATA</span>
          <strong>{product.mark}</strong>
          <small>{product.size}</small>
        </div>
      </div>
      <div className="tw-product-body">
        <span className="tw-product-category">{product.category}</span>
        <h3>{product.name}</h3>
        <b>{product.size}</b>
        <p>{product.description}</p>
        <a href={`${WHATSAPP}%0AProduct%3A%20${encodeURIComponent(product.name)}%20${encodeURIComponent(product.size)}`} target="_blank" rel="noopener noreferrer">💬 Enquire on WhatsApp <span>→</span></a>
      </div>
    </article>
  );
}

function Highlight({ icon, title, text }: { icon: string; title: string; text: string }) {
  return <div className="tw-highlight"><span>{icon}</span><div><strong>{title}</strong><small>{text}</small></div></div>;
}

function ContactCard({ icon, title, text, href, button }: { icon: string; title: string; text: string; href: string; button: string }) {
  return <div className="tw-contact-card"><div className="tw-contact-icon">{icon}</div><h3>{title}</h3><p>{text}</p><a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined}>{button} →</a></div>;
}

const styles = `
.tw-page{--blue:#005baa;--deep:#003b78;--sky:#eaf7ff;--ink:#09284a;--muted:#61738a;--green:#16a765;--line:#dce8f2;background:#f8fbfe;color:var(--ink);font-family:Arial,Helvetica,sans-serif;min-height:100vh}.tw-page *{box-sizing:border-box}.tw-container{width:min(1180px,calc(100% - 36px));margin:0 auto}.tw-header{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.96);border-bottom:1px solid var(--line);backdrop-filter:blur(12px)}.tw-nav{min-height:76px;display:flex;align-items:center;gap:28px}.tw-brand{display:flex;align-items:center;gap:11px;color:var(--ink);text-decoration:none;min-width:270px}.tw-brand strong,.tw-footer-brand strong{display:block;font-size:18px;color:#07549d;letter-spacing:-.02em}.tw-brand small,.tw-footer-brand small{display:block;color:#6d7f92;font-size:11px;margin-top:2px}.tw-tata-mark{display:grid;place-items:center;width:45px;height:45px;border:3px solid #075eae;border-radius:50%;font-size:25px;font-weight:900;color:#075eae;line-height:1}.tw-tata-mark.dark{border-color:#fff;color:#fff}.tw-menu{display:flex;align-items:center;justify-content:center;gap:25px;flex:1}.tw-menu a{color:#183a5e;text-decoration:none;font-size:14px;font-weight:700}.tw-menu a:hover{color:var(--blue)}.tw-wa-head{background:var(--green);color:#fff;text-decoration:none;padding:12px 18px;border-radius:999px;font-size:13px;font-weight:800;white-space:nowrap;box-shadow:0 7px 18px #16a76533}.tw-hero{position:relative;overflow:hidden;background:linear-gradient(120deg,#eefaff 0%,#cceeff 52%,#fff 100%);border-bottom:1px solid #d6e9f7}.tw-hero:after{content:"";position:absolute;inset:auto 0 0;height:75px;background:linear-gradient(180deg,transparent,#ffffffaa)}.tw-hero-grid{min-height:510px;display:grid;grid-template-columns:1.02fr .98fr;align-items:center;gap:20px;position:relative;z-index:2}.tw-hero-copy{padding:62px 0}.tw-kicker,.tw-section-label,.tw-section-heading>span{font-size:12px;font-weight:900;letter-spacing:.14em;color:#0873c8}.tw-hero h1{font-size:clamp(45px,6vw,76px);line-height:.98;letter-spacing:-.045em;margin:18px 0;color:#063a72}.tw-hero h1 em{font-style:normal;color:#2d8c3c}.tw-hero p{max-width:620px;font-size:18px;line-height:1.65;color:#405d79;margin:0}.tw-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}.tw-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;text-decoration:none;border-radius:12px;padding:14px 21px;font-weight:900;font-size:14px;transition:.2s}.tw-btn:hover{transform:translateY(-2px)}.tw-btn-primary{background:var(--blue);color:#fff;box-shadow:0 10px 24px #005baa30}.tw-btn-whatsapp{background:var(--green);color:#fff;box-shadow:0 10px 24px #16a76528}.tw-btn.full{width:100%;margin-top:15px}.tw-trust-row{display:flex;gap:25px;flex-wrap:wrap;margin-top:30px}.tw-trust-row div{display:flex;align-items:center;gap:7px;color:#315270;font-size:12px;font-weight:700}.tw-trust-row b{width:21px;height:21px;border-radius:50%;display:grid;place-items:center;background:#e0f3e8;color:#16804e}.tw-hero-art{height:430px;position:relative;display:flex;align-items:center;justify-content:center}.tw-water-orb{position:absolute;border-radius:50%;filter:blur(2px);opacity:.65}.orb-one{width:360px;height:360px;background:#bcecff;right:5%;top:6%}.orb-two{width:180px;height:180px;background:#7ed9ff;left:9%;bottom:4%;opacity:.35}.tw-splash{position:absolute;border:3px solid #6dcff5;border-radius:50%;transform:rotate(-18deg);opacity:.75}.splash-a{width:380px;height:140px;right:2%;bottom:65px;border-left-color:transparent;border-right-color:transparent}.splash-b{width:300px;height:100px;left:7%;bottom:85px;border-top-color:transparent;border-bottom-color:#8ce2ff}.tw-bottle{position:absolute;bottom:70px;border-radius:24px 24px 18px 18px;box-shadow:0 25px 45px #07549d25;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:900;text-align:center}.tw-bottle:before{content:"";position:absolute;top:-30px;width:48px;height:35px;border-radius:8px 8px 3px 3px;background:#e7edf1;box-shadow:inset 0 3px 5px #0001}.tw-water-bottle{width:150px;height:270px;right:21%;background:linear-gradient(90deg,#eef6fa,#fff 45%,#cfe6f0);border:2px solid #b6d4e2;z-index:3}.tw-copper-bottle{width:105px;height:235px;right:7%;background:linear-gradient(90deg,#9d5428,#e2a16b 48%,#87401d);color:#fff;z-index:2}.mini-t{width:34px;height:34px;border:2px solid currentColor;border-radius:50%;display:grid;place-items:center;font-size:17px;margin-bottom:12px}.tw-bottle strong{font-size:16px;letter-spacing:.05em}.tw-cup{position:absolute;right:34%;bottom:75px;width:150px;height:135px;border-radius:15px 15px 35px 35px;background:linear-gradient(90deg,#fff,#dff7ff);border:3px solid #b8ddeb;box-shadow:0 18px 35px #0072bc22;z-index:5;display:grid;place-items:center;text-align:center;font-weight:900;color:#1267a6;font-size:19px;transform:rotate(4deg)}.tw-cup:after{content:"";position:absolute;width:55px;height:55px;border:12px solid #b8ddeb;border-left:0;border-radius:0 50% 50% 0;right:-52px;top:30px}.tw-highlights{background:#fff;border-bottom:1px solid var(--line)}.tw-highlight-grid{display:grid;grid-template-columns:repeat(4,1fr)}.tw-highlight{padding:22px 20px;display:flex;align-items:center;gap:13px;border-right:1px solid var(--line)}.tw-highlight:last-child{border-right:0}.tw-highlight>span{width:45px;height:45px;border-radius:50%;display:grid;place-items:center;background:#edf7ff;color:#0870bd;font-size:20px}.tw-highlight strong{display:block;font-size:13px}.tw-highlight small{display:block;color:#718398;font-size:11px;margin-top:3px}.tw-products-section{padding:70px 0 78px;background:linear-gradient(180deg,#fff,#f7fbff)}.tw-section-heading{text-align:center}.tw-section-heading h2{font-size:42px;margin:9px 0;color:#07365f;letter-spacing:-.035em}.tw-section-heading p{color:var(--muted);margin:0 auto;max-width:650px}.tw-category-pills{display:flex;justify-content:center;gap:9px;flex-wrap:wrap;margin:28px 0 34px}.tw-category-pills a{padding:9px 15px;border-radius:999px;background:#eaf3fb;color:#285171;text-decoration:none;font-size:12px;font-weight:800;border:1px solid #dce9f4}.tw-category-pills a:first-child{background:#075fae;color:#fff;border-color:#075fae}.tw-product-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.tw-product-card{background:#fff;border:1px solid var(--line);border-radius:20px;overflow:hidden;box-shadow:0 10px 28px #0b426b0b;transition:.25s}.tw-product-card:hover{transform:translateY(-5px);box-shadow:0 18px 38px #0b426b18;border-color:#acd2ea}.tw-pack-stage{height:220px;position:relative;display:grid;place-items:center;overflow:hidden;background:#f0f8fd}.tw-pack-stage:before{content:"";position:absolute;width:190px;height:190px;border-radius:50%;background:#fff;box-shadow:0 10px 30px #0c5e8e12}.tw-pack{position:relative;width:88px;height:160px;border-radius:14px 14px 11px 11px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;box-shadow:0 18px 26px #0a42632b;transform:perspective(300px) rotateY(-7deg);z-index:2}.tw-pack .pack-cap{position:absolute;top:-16px;width:28px;height:18px;border-radius:4px 4px 2px 2px;background:#d8e1e7}.tw-pack .pack-logo{font-size:11px;border:1px solid #fff;border-radius:50%;width:26px;height:26px;display:grid;place-items:center;margin-bottom:11px}.tw-pack strong{font-size:12px;letter-spacing:.04em}.tw-pack small{font-size:10px;margin-top:9px}.tw-pack-stage.red .tw-pack{background:linear-gradient(135deg,#c72227,#f24e45)}.tw-pack-stage.orange .tw-pack{background:linear-gradient(135deg,#e56b12,#ffad39)}.tw-pack-stage.pink .tw-pack{background:linear-gradient(135deg,#dc4678,#ff9eb9)}.tw-pack-stage.lime .tw-pack{background:linear-gradient(135deg,#8cae1d,#d4e84a)}.tw-pack-stage.yellow .tw-pack{background:linear-gradient(135deg,#d7a900,#f3d34e)}.tw-pack-stage.copper{background:linear-gradient(135deg,#f7eee8,#fff)}.tw-pack-stage.copper .tw-pack{width:75px;height:170px;border-radius:16px;background:linear-gradient(90deg,#8c431f,#e3a26d,#87401e);color:#fff}.tw-product-body{padding:20px}.tw-product-category{font-size:10px;text-transform:uppercase;letter-spacing:.12em;font-weight:900;color:#0b75c4}.tw-product-body h3{font-size:18px;line-height:1.25;margin:7px 0 5px;color:#0a3155}.tw-product-body>b{font-size:13px;color:#526d87}.tw-product-body p{font-size:12px;line-height:1.6;color:#72859a;min-height:39px;margin:10px 0 16px}.tw-product-body>a{display:flex;align-items:center;justify-content:space-between;background:#edf9f3;color:#13814e;text-decoration:none;border-radius:10px;padding:10px 12px;font-size:11px;font-weight:900}.tw-support{background:#062d55;color:#fff;padding:76px 0}.tw-support-grid{display:grid;grid-template-columns:1.35fr .65fr;gap:70px;align-items:center}.tw-section-label{color:#65c5ff}.tw-support h2{font-size:42px;line-height:1.12;letter-spacing:-.035em;margin:12px 0 18px}.tw-support p{color:#bfd2e5;line-height:1.75;max-width:650px}.tw-support-points{display:grid;grid-template-columns:1fr 1fr;gap:13px;margin-top:28px}.tw-support-points div{font-size:13px;font-weight:700;color:#e5f0f8}.tw-support-points span{display:inline-grid;place-items:center;width:29px;height:29px;border-radius:8px;background:#0a467e;color:#65c5ff;margin-right:9px;font-size:10px}.tw-order-card{background:#fff;color:#09284a;border-radius:24px;padding:30px;box-shadow:0 20px 50px #001b352e}.tw-order-icon{width:58px;height:58px;border-radius:17px;display:grid;place-items:center;background:#e9f7ff;font-size:28px}.tw-order-card>span{display:block;color:#0873c8;font-size:10px;font-weight:900;letter-spacing:.13em;margin-top:20px}.tw-order-card h3{font-size:25px;margin:8px 0}.tw-order-card p{color:#708399;font-size:13px;line-height:1.6}.tw-call-link{display:block;text-align:center;color:#1d4a6f;text-decoration:none;font-size:13px;font-weight:900;margin-top:15px}.tw-contact{padding:65px 0;background:#fff}.tw-contact-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px}.tw-contact-card{border:1px solid var(--line);border-radius:18px;padding:23px;background:#fff}.tw-contact-icon{width:43px;height:43px;border-radius:50%;background:#eef8ff;color:#0873c8;display:grid;place-items:center;font-size:19px;font-weight:900}.tw-contact-card h3{font-size:16px;margin:13px 0 7px}.tw-contact-card p{font-size:12px;line-height:1.6;color:#71849a;min-height:39px}.tw-contact-card a{display:inline-block;margin-top:12px;color:#0765ad;text-decoration:none;font-size:11px;font-weight:900}.tw-footer{background:#03294e;color:#fff}.tw-footer-main{min-height:100px;display:flex;align-items:center;justify-content:space-between;gap:20px}.tw-footer-brand{display:flex;align-items:center;gap:11px}.tw-footer-brand strong{color:#fff}.tw-footer-brand small{color:#9fb8cf}.tw-footer-links{display:flex;gap:20px}.tw-footer-links a{color:#c7d9e8;text-decoration:none;font-size:12px;font-weight:700}.tw-footer-bottom{border-top:1px solid #ffffff1c;padding:17px 0;color:#91abc1;font-size:11px;display:flex;justify-content:space-between;gap:15px}.tw-footer-bottom span{color:#c7d9e8}@media(max-width:900px){.tw-menu{display:none}.tw-nav{justify-content:space-between}.tw-brand{min-width:0}.tw-hero-grid{grid-template-columns:1fr}.tw-hero-art{height:330px;margin-top:-30px}.tw-hero-copy{padding:55px 0 10px}.tw-highlight-grid{grid-template-columns:1fr 1fr}.tw-highlight:nth-child(2){border-right:0}.tw-product-grid{grid-template-columns:1fr 1fr}.tw-support-grid{grid-template-columns:1fr}.tw-contact-grid{grid-template-columns:1fr 1fr}}@media(max-width:600px){.tw-container{width:min(100% - 24px,1180px)}.tw-brand strong{font-size:14px}.tw-brand small{font-size:9px}.tw-tata-mark{width:39px;height:39px;font-size:21px}.tw-wa-head{padding:10px 12px;font-size:11px}.tw-hero h1{font-size:48px}.tw-hero p{font-size:15px}.tw-trust-row{gap:12px}.tw-hero-art{height:280px}.tw-water-bottle{width:105px;height:200px;right:20%}.tw-copper-bottle{width:75px;height:170px;right:2%}.tw-cup{width:105px;height:95px;right:30%;font-size:13px}.tw-highlight-grid,.tw-product-grid,.tw-contact-grid{grid-template-columns:1fr}.tw-highlight{border-right:0;border-bottom:1px solid var(--line)}.tw-highlight:last-child{border-bottom:0}.tw-section-heading h2,.tw-support h2{font-size:32px}.tw-support-points{grid-template-columns:1fr}.tw-footer-main,.tw-footer-bottom{flex-direction:column;align-items:flex-start;padding:22px 0}.tw-footer-links{flex-wrap:wrap}.tw-category-pills{justify-content:flex-start;overflow:auto;flex-wrap:nowrap;padding-bottom:5px}}
`;
