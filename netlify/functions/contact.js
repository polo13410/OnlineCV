const { corsHeaders } = require('./lib/cors');
const { notificationEmail, acknowledgementEmail } = require('./lib/contact-templates');

const CONTACT_EMAIL = 'contact@paulpera.ch';
const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';
// A human needs a few seconds to fill the form; faster submissions are bots.
const MIN_FILL_MS = 3000;

const SINGLE_LINE = /^[^\r\n<>]+$/;
const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

/** Returns the cleaned form, or null when a field is missing or invalid. */
function validate(body) {
  const str = (value) => (typeof value === 'string' ? value.trim() : '');
  const form = {
    firstName: str(body.firstName),
    lastName: str(body.lastName),
    email: str(body.email),
    company: str(body.company),
    message: str(body.message),
    topic: body.topic === 'project' ? 'project' : 'pro',
    lang: body.lang === 'en' ? 'en' : 'fr',
  };

  const ok =
    form.firstName.length <= 80 && SINGLE_LINE.test(form.firstName) &&
    form.lastName.length <= 80 && SINGLE_LINE.test(form.lastName) &&
    form.email.length <= 254 && EMAIL.test(form.email) &&
    (form.company === '' || (form.company.length <= 120 && SINGLE_LINE.test(form.company))) &&
    form.message.length >= 10 && form.message.length <= 5000;

  return ok ? form : null;
}

async function send(apiKey, payload) {
  const res = await fetch(BREVO_URL, {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${await res.text()}`);
}

exports.handler = async (event) => {
  const CORS_HEADERS = corsHeaders(event);
  const reply = (statusCode, body) => ({ statusCode, headers: CORS_HEADERS, body: JSON.stringify(body) });

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: { ...CORS_HEADERS, 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' },
      body: '',
    };
  }
  if (event.httpMethod !== 'POST') return reply(405, { error: 'Method not allowed' });

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return reply(400, { error: 'Invalid JSON' });
  }

  // Bots: honeypot filled or form submitted too fast → pretend success, send nothing
  const elapsed = Date.now() - Number(body.startedAt);
  if (body.website || !(elapsed >= MIN_FILL_MS)) return reply(200, { ok: true });

  const form = validate(body);
  if (!form) return reply(400, { error: 'Invalid form' });

  const { BREVO_API_KEY } = process.env;
  if (!BREVO_API_KEY) return reply(500, { error: 'Server misconfiguration' });

  const fullName = `${form.firstName} ${form.lastName}`;
  const notification = notificationEmail(form);
  try {
    await send(BREVO_API_KEY, {
      sender: { name: `${fullName} via paulpera.ch`, email: CONTACT_EMAIL },
      to: [{ email: CONTACT_EMAIL, name: 'Paul Pera' }],
      replyTo: { email: form.email, name: fullName },
      subject: notification.subject,
      htmlContent: notification.html,
      textContent: notification.text,
    });
  } catch (err) {
    console.error('contact: notification failed', err.message);
    return reply(502, { error: 'Send failed' });
  }

  // The message reached me: a failed acknowledgement must not report an error to the visitor
  const ack = acknowledgementEmail(form);
  try {
    await send(BREVO_API_KEY, {
      sender: { name: 'Paul Pera', email: CONTACT_EMAIL },
      to: [{ email: form.email, name: fullName }],
      replyTo: { email: CONTACT_EMAIL, name: 'Paul Pera' },
      subject: ack.subject,
      htmlContent: ack.html,
      textContent: ack.text,
    });
  } catch (err) {
    console.error('contact: acknowledgement failed', err.message);
  }

  return reply(200, { ok: true });
};
