import { Resend } from 'resend'
import type { SenderMeta } from '@/lib/sender-meta'

const COMPANY = 'Calendula Herbs'

let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

let _from: string | null = null
function getFromEmail(): string {
  if (!_from) _from = process.env.RESEND_FROM_EMAIL || 'noreply@calendula-herbs.com'
  return _from
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Resend timed out after ${ms}ms`)), ms)
    ),
  ]) as Promise<T>
}

// ─── OTP Email ────────────────────────────────────────────────────────────────

export async function sendOtpEmail(to: string, code: string) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:Inter,Arial,sans-serif">
  <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#15803d,#166534);padding:32px 40px;text-align:center">
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px">🌿 ${COMPANY}</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px">Admin Portal</p>
    </div>
    <div style="padding:40px">
      <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;font-weight:600">Your verification code</h2>
      <p style="margin:0 0 32px;color:#64748b;font-size:15px;line-height:1.6">Use the code below to verify your identity. It expires in <strong>10 minutes</strong>.</p>
      <div style="background:#f0fdf4;border:2px solid #bbf7d0;border-radius:12px;padding:24px;text-align:center;margin-bottom:32px">
        <span style="font-size:40px;font-weight:800;letter-spacing:12px;color:#15803d;font-family:monospace">${code}</span>
      </div>
      <p style="margin:0;color:#94a3b8;font-size:13px;text-align:center">If you didn't request this, please ignore this email.<br>Do not share this code with anyone.</p>
    </div>
    <div style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0">
      <p style="margin:0;color:#94a3b8;font-size:12px">© ${new Date().getFullYear()} ${COMPANY} For Import &amp; Export. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`

  return withTimeout(getResend().emails.send({
    from: getFromEmail(),
    to,
    subject: `${code} — Your ${COMPANY} Admin Verification Code`,
    html,
  }), 15000)
}

// ─── Contact Form Confirmation ────────────────────────────────────────────────

export async function sendContactConfirmation(
  to: string,
  name: string,
) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#f0fdf4;font-family:Inter,Arial,sans-serif">
  <div style="max-width:540px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#15803d,#166534);padding:32px 40px">
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700">🌿 ${COMPANY}</h1>
    </div>
    <div style="padding:40px">
      <h2 style="margin:0 0 16px;color:#0f172a;font-size:20px">Thank you, ${name}!</h2>
      <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.7">We've received your message and will get back to you within <strong>1–2 business days</strong>.</p>
      <p style="margin:0;color:#475569;font-size:15px;line-height:1.7">For urgent inquiries, please reach us directly at <a href="mailto:info@calendulaherbs.com" style="color:#15803d">info@calendulaherbs.com</a>.</p>
    </div>
    <div style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0">
      <p style="margin:0;color:#94a3b8;font-size:12px">© ${new Date().getFullYear()} ${COMPANY} For Import &amp; Export</p>
    </div>
  </div>
</body>
</html>`

  return withTimeout(getResend().emails.send({
    from: getFromEmail(),
    to,
    subject: `We received your message — ${COMPANY}`,
    html,
  }), 15000)
}

// ─── Contact Notification (to admin) ─────────────────────────────────────────

export async function sendContactNotification(
  managingEmails: string[],
  data: { name: string; email: string; phone?: string | null; company?: string | null; country?: string | null; subject?: string | null; message: string },
  meta?: SenderMeta,
) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,Arial,sans-serif">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:#0f172a;padding:24px 40px">
      <h2 style="margin:0;color:#4ade80;font-size:16px;font-weight:600">🌿 New Contact Inquiry</h2>
    </div>
    <div style="padding:32px 40px">
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${row('Name', data.name)}
        ${row('Email', `<a href="mailto:${data.email}" style="color:#15803d">${data.email}</a>`)}
        ${data.phone ? row('Phone', data.phone) : ''}
        ${data.company ? row('Company', data.company) : ''}
        ${data.country ? row('Country', data.country) : ''}
        ${data.subject ? row('Subject', data.subject) : ''}
      </table>
      <div style="margin-top:24px;background:#f8fafc;border-left:4px solid #15803d;border-radius:0 8px 8px 0;padding:16px 20px">
        <p style="margin:0;color:#475569;font-size:14px;line-height:1.7;white-space:pre-wrap">${data.message}</p>
      </div>
      ${meta ? metaSection(meta) : ''}
    </div>
  </div>
</body>
</html>`

  return withTimeout(getResend().emails.send({
    from: getFromEmail(),
    to: managingEmails,
    subject: `🌿 New Contact Inquiry from ${data.name}${data.company ? ` (${data.company})` : ''}`,
    html,
  }), 15000)
}

// ─── Cart Inquiry Notification ────────────────────────────────────────────────

export async function sendCartNotification(
  managingEmails: string[],
  data: { name: string; email: string; company?: string | null; country?: string | null; notes?: string | null },
  items: Array<{ productName: string; quantity: number }>,
  meta?: SenderMeta,
) {
  const itemsHtml = items
    .map((i) => `<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;color:#0f172a">${i.productName}</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;text-align:right">${i.quantity} kg</td></tr>`)
    .join('')

  const html = `
<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,Arial,sans-serif">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:#0f172a;padding:24px 40px">
      <h2 style="margin:0;color:#facc15;font-size:16px;font-weight:600">🛒 New Product Inquiry</h2>
    </div>
    <div style="padding:32px 40px">
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
        ${row('Name', data.name)}
        ${row('Email', `<a href="mailto:${data.email}" style="color:#15803d">${data.email}</a>`)}
        ${data.company ? row('Company', data.company) : ''}
        ${data.country ? row('Country', data.country) : ''}
      </table>
      <h3 style="margin:0 0 12px;color:#0f172a;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Products Requested</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
        <thead><tr style="background:#f8fafc"><th style="padding:10px 12px;text-align:left;color:#64748b;font-size:12px;text-transform:uppercase">Product</th><th style="padding:10px 12px;text-align:right;color:#64748b;font-size:12px;text-transform:uppercase">Quantity</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      ${data.notes ? `<div style="margin-top:20px;background:#f8fafc;border-left:4px solid #facc15;border-radius:0 8px 8px 0;padding:14px 18px"><p style="margin:0;color:#475569;font-size:14px">${data.notes}</p></div>` : ''}
      ${meta ? metaSection(meta) : ''}
    </div>
  </div>
</body>
</html>`

  return withTimeout(getResend().emails.send({
    from: getFromEmail(),
    to: managingEmails,
    subject: `🛒 New Product Inquiry from ${data.name}${data.company ? ` (${data.company})` : ''}`,
    html,
  }), 15000)
}

// ─── Cart Confirmation (to buyer) ─────────────────────────────────────────────

export async function sendCartConfirmation(
  to: string,
  name: string,
  items: Array<{ productName: string; quantity: number }>,
) {
  const itemsList = items.map((i) => `<li style="padding:6px 0;color:#475569">${i.productName} — ${i.quantity} kg</li>`).join('')

  const html = `
<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#f0fdf4;font-family:Inter,Arial,sans-serif">
  <div style="max-width:540px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#15803d,#166534);padding:32px 40px">
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700">🌿 ${COMPANY}</h1>
    </div>
    <div style="padding:40px">
      <h2 style="margin:0 0 16px;color:#0f172a;font-size:20px">Inquiry Received, ${name}!</h2>
      <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7">Thank you for your product inquiry. Our team will review your request and reach out within <strong>1–2 business days</strong>.</p>
      <h3 style="margin:0 0 12px;color:#0f172a;font-size:14px;text-transform:uppercase;letter-spacing:0.5px">Products Requested:</h3>
      <ul style="margin:0 0 24px;padding-left:20px">${itemsList}</ul>
      <p style="margin:0;color:#475569;font-size:14px;line-height:1.7">Questions? Email us at <a href="mailto:info@calendulaherbs.com" style="color:#15803d">info@calendulaherbs.com</a></p>
    </div>
    <div style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0">
      <p style="margin:0;color:#94a3b8;font-size:12px">© ${new Date().getFullYear()} ${COMPANY} For Import &amp; Export</p>
    </div>
  </div>
</body>
</html>`

  return withTimeout(getResend().emails.send({
    from: getFromEmail(),
    to,
    subject: `Your inquiry to ${COMPANY} — Products Requested`,
    html,
  }), 15000)
}

// ─── Sample Request Confirmation (to user) ─────────────────────────────────────

export async function sendSampleConfirmation(to: string, name: string, productName: string) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#f0fdf4;font-family:Inter,Arial,sans-serif">
  <div style="max-width:540px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#15803d,#166534);padding:32px 40px">
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700">🌿 ${COMPANY}</h1>
    </div>
    <div style="padding:40px">
      <h2 style="margin:0 0 16px;color:#0f172a;font-size:20px">Sample Request Received, ${name}!</h2>
      <p style="margin:0 0 12px;color:#475569;font-size:15px;line-height:1.7">We've received your request for a sample of <strong>${productName}</strong>.</p>
      <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7">Our team will review your request and reach out to coordinate shipping details within <strong>1–2 business days</strong>.</p>
      <p style="margin:0;color:#475569;font-size:14px;line-height:1.7">Questions? Email us at <a href="mailto:info@calendulaherbs.com" style="color:#15803d">info@calendulaherbs.com</a></p>
    </div>
    <div style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0">
      <p style="margin:0;color:#94a3b8;font-size:12px">© ${new Date().getFullYear()} ${COMPANY} For Import &amp; Export</p>
    </div>
  </div>
</body>
</html>`

  return withTimeout(getResend().emails.send({
    from: getFromEmail(),
    to,
    subject: `Sample Request Received — ${COMPANY}`,
    html,
  }), 15000)
}

// ─── Sample Request Notification (to admin) ────────────────────────────────────

export async function sendSampleNotification(
  managingEmails: string[],
  data: { name: string; email: string; productName: string; company?: string | null; address?: string | null; shippingBy: string; notes?: string | null },
  meta?: SenderMeta,
) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,Arial,sans-serif">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:#0f172a;padding:24px 40px">
      <h2 style="margin:0;color:#a78bfa;font-size:16px;font-weight:600">📦 New Sample Request</h2>
    </div>
    <div style="padding:32px 40px">
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${row('Product', data.productName)}
        ${row('Name', data.name)}
        ${row('Email', `<a href="mailto:${data.email}" style="color:#15803d">${data.email}</a>`)}
        ${data.company ? row('Company', data.company) : ''}
        ${data.address ? row('Address', data.address) : ''}
        ${row('Shipping', data.shippingBy === 'buyer' ? 'Buyer covers' : 'Calendula covers')}
        ${data.notes ? row('Notes', data.notes) : ''}
      </table>
      ${meta ? metaSection(meta) : ''}
    </div>
  </div>
</body>
</html>`

  return withTimeout(getResend().emails.send({
    from: getFromEmail(),
    to: managingEmails,
    subject: `📦 New Sample Request: ${data.productName} from ${data.name}`,
    html,
  }), 15000)
}

// ─── Product Request Confirmation (to user) ────────────────────────────────────

export async function sendProductRequestConfirmation(to: string, name: string, productName: string) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#f0fdf4;font-family:Inter,Arial,sans-serif">
  <div style="max-width:540px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#15803d,#166534);padding:32px 40px">
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700">🌿 ${COMPANY}</h1>
    </div>
    <div style="padding:40px">
      <h2 style="margin:0 0 16px;color:#0f172a;font-size:20px">Product Request Received, ${name}!</h2>
      <p style="margin:0 0 12px;color:#475569;font-size:15px;line-height:1.7">We've received your request for <strong>${productName}</strong>.</p>
      <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7">Our sourcing team will research the best options and get back to you within <strong>1–2 business days</strong> with a tailored quote.</p>
      <p style="margin:0;color:#475569;font-size:14px;line-height:1.7">Questions? Email us at <a href="mailto:info@calendulaherbs.com" style="color:#15803d">info@calendulaherbs.com</a></p>
    </div>
    <div style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0">
      <p style="margin:0;color:#94a3b8;font-size:12px">© ${new Date().getFullYear()} ${COMPANY} For Import &amp; Export</p>
    </div>
  </div>
</body>
</html>`

  return withTimeout(getResend().emails.send({
    from: getFromEmail(),
    to,
    subject: `Product Request Received — ${COMPANY}`,
    html,
  }), 15000)
}

// ─── Product Request Notification (to admin) ───────────────────────────────────

export async function sendProductRequestNotification(
  managingEmails: string[],
  data: { name: string; email: string; productName: string; productDescription?: string | null; company?: string | null; country?: string | null; phone?: string | null; quantity?: string | null; usage?: string | null; notes?: string | null },
  meta?: SenderMeta,
) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,Arial,sans-serif">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:#0f172a;padding:24px 40px">
      <h2 style="margin:0;color:#60a5fa;font-size:16px;font-weight:600">🔍 New Product Request</h2>
    </div>
    <div style="padding:32px 40px">
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${row('Product', data.productName)}
        ${data.productDescription ? row('Description', data.productDescription) : ''}
        ${data.quantity ? row('Quantity', data.quantity) : ''}
        ${data.usage ? row('Intended Use', data.usage) : ''}
        ${row('Name', data.name)}
        ${row('Email', `<a href="mailto:${data.email}" style="color:#15803d">${data.email}</a>`)}
        ${data.phone ? row('Phone', data.phone) : ''}
        ${data.company ? row('Company', data.company) : ''}
        ${data.country ? row('Country', data.country) : ''}
        ${data.notes ? row('Notes', data.notes) : ''}
      </table>
      ${meta ? metaSection(meta) : ''}
    </div>
  </div>
</body>
</html>`

  return withTimeout(getResend().emails.send({
    from: getFromEmail(),
    to: managingEmails,
    subject: `🔍 New Product Request: ${data.productName} from ${data.name}`,
    html,
  }), 15000)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function metaSection(meta: SenderMeta) {
  const safeUA = meta.userAgent.length > 200 ? meta.userAgent.slice(0, 200) + '…' : meta.userAgent
  return `
      <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e2e8f0">
        <p style="margin:0 0 10px;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600">Sender Metadata</p>
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          ${row('IP Address', meta.ip)}
          ${meta.country ? row('Country (IP)', meta.country) : ''}
          ${row('Browser / OS', safeUA)}
          ${meta.referer ? row('Referrer', meta.referer) : ''}
          ${meta.acceptLanguage ? row('Language', meta.acceptLanguage) : ''}
        </table>
      </div>`
}

function row(label: string, value: string) {
  return `<tr>
    <td style="padding:8px 0;color:#64748b;font-size:13px;width:110px;vertical-align:top">${label}</td>
    <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:500">${value}</td>
  </tr>`
}
