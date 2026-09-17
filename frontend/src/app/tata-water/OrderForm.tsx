"use client";

import { FormEvent, useState } from "react";

const PRODUCTS = [
  "Tata Gluco+ Sports Drink — 200 ML",
  "Tata Gluco+ Orange Juice — 180 ML",
  "Tata Gluco+ Lychee Juice — 180 ML",
  "Tata Gluco+ Lemon Juice — 180 ML",
  "Tata GP Jelly Lychee — 180 ML",
  "Tata Copper+ Water — 250 ML",
  "Tata Copper+ Water — 500 ML",
  "Tata Copper+ Water — 1000 ML",
  "Tata Copper+ Water — 2000 ML",
];

const WHATSAPP = "https://wa.me/918937887070";
const RAZORPAY = "https://razorpay.me/@ankittiwaricsccenter";

export default function OrderForm() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("Saving enquiry…");
    const form = new FormData(event.currentTarget);
    const data = Object.fromEntries(form.entries());

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Unable to save enquiry");
      }
      setStatus("✓ Enquiry received. We will contact you shortly.");
      event.currentTarget.reset();
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Unable to save enquiry"
      );
    } finally {
      setBusy(false);
    }
  }

  const whatsapp = `${WHATSAPP}?text=${encodeURIComponent(
    "Hello, I want to enquire about a bulk Tata Water / Beverage order."
  )}`;

  return (
    <>
      <button className="tw-order-fab" onClick={() => setOpen(true)}>
        📦 Bulk Order / Enquiry
      </button>

      {open && (
        <div
          className="tw-order-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Tata Water bulk order"
        >
          <div className="tw-order-modal">
            <button
              className="tw-order-close"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              ×
            </button>

            <span className="tw-form-kicker">TATA WATER &amp; BEVERAGES</span>
            <h2>Bulk Order / Enquiry</h2>
            <p>
              Need products in bulk? Share your requirement and our distributor
              team will contact you.
            </p>

            <form onSubmit={submit} className="tw-order-form">
              <label>
                Name
                <input
                  name="name"
                  required
                  placeholder="Customer / Business name"
                />
              </label>

              <label>
                Mobile Number
                <input
                  name="mobile"
                  required
                  inputMode="tel"
                  placeholder="10-digit mobile number"
                />
              </label>

              <label>
                Product
                <select name="product" required defaultValue="">
                  <option value="" disabled>
                    Select product
                  </option>
                  {PRODUCTS.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </label>

              <label>
                Quantity
                <input
                  name="quantity"
                  required
                  placeholder="e.g. 50 cartons / 100 bottles"
                />
              </label>

              <label>
                Delivery Location
                <input
                  name="location"
                  placeholder="Shikohabad / nearby area"
                />
              </label>

              <label>
                Requirement
                <select
                  name="requirement"
                  defaultValue="Bulk / Wholesale"
                >
                  <option>Bulk / Wholesale</option>
                  <option>Shop / Retail</option>
                  <option>Office / Event</option>
                  <option>Home</option>
                </select>
              </label>

              <label className="tw-full-field">
                Remarks
                <textarea
                  name="remarks"
                  rows={3}
                  placeholder="Any specific pack size, delivery or price requirement"
                />
              </label>

              <button
                className="tw-submit-order"
                disabled={busy}
                type="submit"
              >
                {busy ? "Submitting…" : "Submit Enquiry"}
              </button>

              <a
                className="tw-whatsapp-order"
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
              >
                💬 Enquire directly on WhatsApp
              </a>
            </form>

            <div className="tw-payment-box-form">
              <div>
                <span>💳</span>
                <div>
                  <strong>Online Payment</strong>
                  <small>Pay securely through Razorpay</small>
                </div>
              </div>

              <a
                href={RAZORPAY}
                className="tw-razorpay-button"
                target="_blank"
                rel="noopener noreferrer"
              >
                Pay Online →
              </a>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .tw-order-fab{position:fixed;right:22px;bottom:22px;z-index:80;border:0;border-radius:999px;background:#0b7a4b;color:#fff;padding:15px 21px;font-weight:900;box-shadow:0 12px 30px #063c292e;cursor:pointer}
        .tw-order-overlay{position:fixed;inset:0;z-index:100;background:#031b2acc;display:grid;place-items:center;padding:18px}
        .tw-order-modal{position:relative;width:min(680px,100%);max-height:92vh;overflow:auto;background:#fff;border-radius:24px;padding:30px;box-shadow:0 30px 80px #0005;color:#09284a}
        .tw-order-close{position:absolute;right:16px;top:12px;border:0;background:#eef5fa;width:38px;height:38px;border-radius:50%;font-size:27px;cursor:pointer}
        .tw-form-kicker{font-size:11px;font-weight:900;letter-spacing:.14em;color:#0873c8}
        .tw-order-modal h2{font-size:32px;margin:8px 0}
        .tw-order-modal>p{color:#667c91;font-size:14px;line-height:1.55;margin:0 0 20px}
        .tw-order-form{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .tw-order-form label{font-size:11px;font-weight:900;color:#37536d}
        .tw-order-form input,.tw-order-form select,.tw-order-form textarea{display:block;width:100%;margin-top:6px;border:1px solid #d5e2ec;border-radius:10px;padding:11px 12px;font:inherit;font-size:13px;color:#09284a;background:#fbfdff;outline:none}
        .tw-order-form input:focus,.tw-order-form select:focus,.tw-order-form textarea:focus{border-color:#0873c8}
        .tw-full-field{grid-column:1/-1}
        .tw-submit-order,.tw-whatsapp-order{grid-column:1/-1;border:0;border-radius:11px;padding:13px;text-align:center;font-weight:900;text-decoration:none;cursor:pointer}
        .tw-submit-order{background:#075fae;color:#fff}
        .tw-submit-order:disabled{opacity:.65}
        .tw-whatsapp-order{background:#e7f7ee;color:#117b4d}
        .tw-payment-box-form{margin-top:18px;padding:15px;border:1px solid #dce8f2;border-radius:14px;background:#f7fbfe;display:flex;align-items:center;justify-content:space-between;gap:15px}
        .tw-payment-box-form>div{display:flex;align-items:center;gap:10px}
        .tw-payment-box-form>div>span{font-size:24px}
        .tw-payment-box-form strong{display:block;font-size:13px;color:#123d60}
        .tw-payment-box-form small{display:block;margin-top:3px;color:#718397;font-size:10px}
        .tw-razorpay-button{display:inline-flex;align-items:center;justify-content:center;background:#075fae;color:#fff;text-decoration:none;border-radius:9px;padding:11px 16px;font-size:12px;font-weight:900;white-space:nowrap}
        .tw-razorpay-button:hover{background:#004b8b}
        @media(max-width:600px){
          .tw-order-fab{right:12px;bottom:12px;padding:13px 16px}
          .tw-order-modal{padding:24px 18px}
          .tw-order-form{grid-template-columns:1fr}
          .tw-full-field{grid-column:auto}
          .tw-payment-box-form{align-items:stretch;flex-direction:column}
          .tw-razorpay-button{width:100%}
        }
      `}</style>
    </>
  );
}
