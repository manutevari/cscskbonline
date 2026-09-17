import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tata Water Distributor | Shikohabad, Firozabad",
  description:
    "Tata Water distributor and customer support in Shikohabad, Firozabad, Uttar Pradesh.",
};

const PHONE = "+918937887070";

const WHATSAPP =
  "https://wa.me/918937887070?text=Hello%2C%20I%20want%20to%20enquire%20about%20Tata%20Water.";

const FACEBOOK =
  "https://www.facebook.com/profile.php?id=61581329466166";

const MAPS =
  "https://maps.app.goo.gl/5sjao2KhtvRgioU7A";

const REVIEW =
  "https://g.page/r/CeLm6K0yGQAjEBM/review";

export default function TataWaterPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

          <a href="/" className="group">
            <div className="text-xl font-extrabold text-sky-700">
              💧 Tata Water
            </div>
            <div className="text-xs text-slate-500">
              Distributor • Shikohabad
            </div>
          </a>

          <nav className="hidden items-center gap-6 md:flex">
            <a
              href="/"
              className="font-semibold text-slate-600 hover:text-sky-600"
            >
              CSC Home
            </a>

            <a
              href="#services"
              className="font-semibold text-slate-600 hover:text-sky-600"
            >
              Services
            </a>

            <a
              href="#contact"
              className="font-semibold text-slate-600 hover:text-sky-600"
            >
              Contact
            </a>
          </nav>

          <a
            href={`tel:${PHONE}`}
            className="rounded-full bg-sky-600 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-sky-700"
          >
            📞 Call Now
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="overflow-hidden bg-gradient-to-br from-sky-700 via-cyan-600 to-teal-500">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:py-28">

          <div className="text-white">

            <div className="mb-5 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
              💧 Tata Water Distributor • Shikohabad
            </div>

            <h1 className="text-4xl font-black leading-tight md:text-6xl">
              Pure Water.
              <br />
              Reliable Delivery.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-white/90">
              Tata Water distribution and customer enquiry support
              for Shikohabad and nearby areas of Firozabad,
              Uttar Pradesh.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">

              <a
                href={`tel:${PHONE}`}
                className="rounded-full bg-white px-7 py-3.5 font-bold text-sky-700 shadow-lg hover:bg-slate-100"
              >
                📞 Call Now
              </a>

              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/50 bg-white/10 px-7 py-3.5 font-bold text-white backdrop-blur hover:bg-white/20"
              >
                💬 WhatsApp
              </a>

            </div>
          </div>

          <div className="rounded-3xl bg-white/15 p-3 shadow-2xl backdrop-blur">

            <div className="rounded-2xl bg-white p-8">

              <div className="text-center">

                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-sky-100 text-5xl">
                  💧
                </div>

                <h2 className="mt-5 text-2xl font-extrabold">
                  Tata Water
                </h2>

                <p className="mt-2 text-slate-500">
                  Local Distributor & Customer Support
                </p>

              </div>

              <div className="mt-7 space-y-3">

                <a
                  href={`tel:${PHONE}`}
                  className="block rounded-xl bg-sky-50 p-4 text-center font-bold text-sky-700 hover:bg-sky-100"
                >
                  📞 +91-8937887070
                </a>

                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl bg-green-50 p-4 text-center font-bold text-green-700 hover:bg-green-100"
                >
                  💬 WhatsApp Enquiry
                </a>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* NAVIGATION */}
      <section className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-3 px-5 py-5">

          <a
            href="/"
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold hover:border-sky-500 hover:text-sky-600"
          >
            ← CSC Home
          </a>

          <a
            href="#services"
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold hover:border-sky-500 hover:text-sky-600"
          >
            Our Services
          </a>

          <a
            href={FACEBOOK}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold hover:border-sky-500 hover:text-sky-600"
          >
            📘 Facebook
          </a>

          <a
            href={MAPS}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold hover:border-sky-500 hover:text-sky-600"
          >
            📍 Location
          </a>

        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="mx-auto max-w-7xl px-5 py-20">

        <div className="mx-auto max-w-2xl text-center">

          <span className="font-bold text-sky-600">
            OUR SERVICES
          </span>

          <h2 className="mt-3 text-3xl font-black md:text-4xl">
            Water Solutions for Your Needs
          </h2>

          <p className="mt-4 text-slate-500">
            Enquiry and support for households, shops,
            offices and businesses.
          </p>

        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          <ServiceCard
            icon="💧"
            title="Water Supply"
            description="Reliable water supply enquiry and distribution support."
          />

          <ServiceCard
            icon="🚚"
            title="Delivery"
            description="Ask about water delivery availability in your area."
          />

          <ServiceCard
            icon="📦"
            title="Bulk Orders"
            description="Enquire about requirements for shops, offices and businesses."
          />

          <ServiceCard
            icon="🤝"
            title="Distributor Enquiry"
            description="Get information about Tata Water distribution opportunities."
          />

        </div>
      </section>

      {/* LOCAL SUPPORT */}
      <section className="bg-white">

        <div className="mx-auto max-w-7xl px-5 py-20">

          <div className="grid gap-12 md:grid-cols-2 md:items-center">

            <div>

              <span className="font-bold text-sky-600">
                LOCAL SUPPORT
              </span>

              <h2 className="mt-3 text-3xl font-black md:text-4xl">
                Serving Shikohabad & Nearby Areas
              </h2>

              <p className="mt-5 leading-7 text-slate-600">
                For Tata Water enquiries, delivery requirements
                and distributor-related support, contact us directly.
              </p>

              <div className="mt-8 space-y-4">

                <Feature text="Local Shikohabad support" />
                <Feature text="Direct phone enquiry" />
                <Feature text="WhatsApp communication" />
                <Feature text="Business & bulk enquiry support" />

              </div>

            </div>

            <div className="rounded-3xl bg-gradient-to-br from-sky-50 to-cyan-50 p-8">

              <div className="rounded-2xl bg-white p-8 shadow-lg">

                <div className="text-5xl">
                  📍
                </div>

                <h3 className="mt-5 text-2xl font-black">
                  Our Location
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  Shikohabad,
                  <br />
                  Firozabad, Uttar Pradesh
                </p>

                <a
                  href={MAPS}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-block rounded-full bg-sky-600 px-6 py-3 font-bold text-white hover:bg-sky-700"
                >
                  📍 Open Google Maps
                </a>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FACEBOOK + QR */}
      <section className="bg-slate-900">

        <div className="mx-auto max-w-6xl px-5 py-20">

          <div className="grid items-center gap-10 md:grid-cols-2">

            <div className="text-white">

              <span className="font-bold text-cyan-400">
                CONNECT WITH US
              </span>

              <h2 className="mt-3 text-3xl font-black md:text-4xl">
                Stay Connected
              </h2>

              <p className="mt-5 leading-7 text-slate-300">
                Follow our Facebook page or contact us directly
                for Tata Water enquiries and updates.
              </p>

              <div className="mt-7 flex flex-wrap gap-4">

                <a
                  href={FACEBOOK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-white px-7 py-3.5 font-bold text-slate-900 hover:bg-slate-100"
                >
                  📘 Follow us on Facebook
                </a>

                <a
                  href={REVIEW}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/30 px-7 py-3.5 font-bold text-white hover:bg-white/10"
                >
                  ⭐ Give a Review
                </a>

              </div>

            </div>

            <div className="flex justify-center">

              <div className="rounded-3xl bg-white p-6 text-center shadow-2xl">

                <div className="mb-4 font-bold text-slate-800">
                  Scan to Connect
                </div>

                <img
                  src="/tata-water-qr.png"
                  alt="Tata Water QR Code"
                  className="mx-auto h-56 w-56 rounded-xl object-contain"
                />

                <p className="mt-4 text-sm text-slate-500">
                  Scan the QR code to connect with us
                </p>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-sky-600 to-cyan-600">

        <div className="mx-auto max-w-5xl px-5 py-16 text-center text-white">

          <h2 className="text-3xl font-black md:text-4xl">
            Need Tata Water?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-white/90">
            Call or WhatsApp us for your enquiry.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">

            <a
              href={`tel:${PHONE}`}
              className="rounded-full bg-white px-8 py-4 font-black text-sky-700 shadow-lg hover:bg-slate-100"
            >
              📞 +91-8937887070
            </a>

            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/50 bg-white/10 px-8 py-4 font-black text-white hover:bg-white/20"
            >
              💬 WhatsApp
            </a>

          </div>

        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="mx-auto max-w-7xl px-5 py-20">

        <div className="rounded-3xl bg-white p-8 shadow-xl md:p-12">

          <div className="grid gap-10 md:grid-cols-3">

            <ContactItem
              icon="📞"
              title="Call Us"
              value="+91-8937887070"
              href={`tel:${PHONE}`}
            />

            <ContactItem
              icon="📘"
              title="Facebook"
              value="Follow our Facebook page"
              href={FACEBOOK}
            />

            <ContactItem
              icon="📍"
              title="Location"
              value="Shikohabad, Firozabad, UP"
              href={MAPS}
            />

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t bg-slate-950 text-white">

        <div className="mx-auto max-w-7xl px-5 py-12">

          <div className="grid gap-10 md:grid-cols-3">

            <div>

              <div className="text-xl font-black">
                💧 Tata Water
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Distributor & customer support
                <br />
                Shikohabad, Firozabad, Uttar Pradesh
              </p>

            </div>

            <div>

              <h3 className="font-bold">
                Quick Links
              </h3>

              <div className="mt-4 space-y-3 text-sm">

                <a
                  href="/"
                  className="block text-slate-400 hover:text-white"
                >
                  ← CSC Home
                </a>

                <a
                  href="/tata-water"
                  className="block text-slate-400 hover:text-white"
                >
                  Tata Water
                </a>

                <a
                  href="#services"
                  className="block text-slate-400 hover:text-white"
                >
                  Services
                </a>

                <a
                  href="#contact"
                  className="block text-slate-400 hover:text-white"
                >
                  Contact
                </a>

              </div>

            </div>

            <div>

              <h3 className="font-bold">
                Connect
              </h3>

              <div className="mt-4 space-y-3 text-sm">

                <a
                  href={`tel:${PHONE}`}
                  className="block text-slate-400 hover:text-white"
                >
                  📞 +91-8937887070
                </a>

                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-slate-400 hover:text-white"
                >
                  💬 WhatsApp
                </a>

                <a
                  href={FACEBOOK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-slate-400 hover:text-white"
                >
                  📘 Facebook
                </a>

              </div>

            </div>

          </div>

          <div className="mt-10 border-t border-slate-800 pt-6 text-center text-sm text-slate-500">

            © {new Date().getFullYear()} Tata Water Distributor —
            Shikohabad, Firozabad, Uttar Pradesh

          </div>

        </div>

      </footer>

    </main>
  );
}


/* SERVICE CARD */

function ServiceCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">

      <div className="text-4xl">
        {icon}
      </div>

      <h3 className="mt-5 text-xl font-extrabold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </div>
  );
}


/* FEATURE */

function Feature({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-700">
        ✓
      </div>

      <span className="font-semibold text-slate-700">
        {text}
      </span>

    </div>
  );
}


/* CONTACT ITEM */

function ContactItem({
  icon,
  title,
  value,
  href,
}: {
  icon: string;
  title: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="rounded-2xl border border-slate-200 p-6 transition hover:border-sky-400 hover:shadow-lg"
    >

      <div className="text-3xl">
        {icon}
      </div>

      <h3 className="mt-4 font-black">
        {title}
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        {value}
      </p>

    </a>
  );
}