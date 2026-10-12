// Email templates for the contact form. Inline styles and tables only: email clients
// ignore stylesheets. Every visitor-provided value goes through esc().

const ACCENT = "#3b7a85";
const TEXT = "#10282e";
const MUTED = "#4a6a70";
const BORDER = "#d5e6e9";
const SURFACE = "#eff6f7";
const SITE_URL = "https://paulpera.ch";
const LINKEDIN_URL = "https://www.linkedin.com/in/paulpera/";

const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const multiline = (value) => esc(value).replace(/\r?\n/g, "<br>");

const TOPICS = {
  pro: { fr: "Opportunité professionnelle", en: "Professional opportunity" },
  project: { fr: "Projet", en: "Project" },
};

function layout(title, body) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${SURFACE};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SURFACE};padding:32px 12px;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${BORDER};border-radius:12px;overflow:hidden;font-family:'DM Sans',Segoe UI,Helvetica,Arial,sans-serif;color:${TEXT};">
      <tr><td style="height:4px;background:${ACCENT};font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="padding:28px 32px 8px;font-size:18px;font-weight:700;">Paul <span style="color:${ACCENT};">Pera</span></td></tr>
      <tr><td style="padding:8px 32px 32px;font-size:15px;line-height:1.6;">${body}</td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function detailsTable(rows) {
  const cells = rows
    .filter(([, value]) => value)
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:6px 12px 6px 0;color:${MUTED};font-size:13px;white-space:nowrap;vertical-align:top;">${esc(label)}</td>
        <td style="padding:6px 0;font-size:14px;">${value}</td>
      </tr>`,
    )
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;">${cells}</table>`;
}

function messageBlock(message) {
  return `<div style="margin:8px 0 0;padding:16px;background:${SURFACE};border-left:3px solid ${ACCENT};border-radius:6px;font-size:14px;line-height:1.6;">${multiline(message)}</div>`;
}

/** Notification to me — always in French. Reply-To is the visitor. */
exports.notificationEmail = (form) => {
  const fullName = `${form.firstName} ${form.lastName}`;
  const topic = TOPICS[form.topic].fr;
  const subject = `[paulpera.ch] ${topic} — ${fullName}${form.company ? ` · ${form.company}` : ""}`;

  const html = layout(
    subject,
    `
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${ACCENT};">${esc(topic)}</p>
    <p style="margin:0 0 8px;font-size:20px;font-weight:700;">Nouveau message de ${esc(fullName)}</p>
    ${detailsTable([
      ["Nom", esc(fullName)],
      [
        "Email",
        `<a href="mailto:${esc(form.email)}" style="color:${ACCENT};">${esc(form.email)}</a>`,
      ],
      ["Entreprise", form.company && esc(form.company)],
      ["Langue", form.lang === "en" ? "Anglais" : "Français"],
    ])}
    ${messageBlock(form.message)}
    <p style="margin:24px 0 0;font-size:13px;color:${MUTED};">Répondez directement à ce mail pour écrire à ${esc(form.firstName)}.</p>`,
  );

  const text = [
    `${topic} — nouveau message de ${fullName}`,
    `Email : ${form.email}`,
    form.company && `Entreprise : ${form.company}`,
    "",
    form.message,
  ]
    .filter((line) => line !== undefined && line !== "")
    .join("\n");

  return { subject, html, text };
};

/** Automatic acknowledgement to the visitor, in their language, with a recap of what they sent. */
exports.acknowledgementEmail = (form) => {
  const fr = form.lang !== "en";
  const t = fr
    ? {
        subject: `Merci pour votre message, ${form.firstName} !`,
        hello: `Bonjour ${form.firstName},`,
        thanks: `Merci ${form.firstName} pour votre message ! Je me réjouis de prendre connaissance de votre projet.`,
        looking: "Je reviens vers vous le plus rapidement possible.",
        recap: "Pour rappel, voici votre message :",
        name: "Nom",
        company: "Entreprise",
        topic: "Sujet",
        automatic:
          "Ceci est un accusé de réception automatique. Vous pouvez répondre directement à ce mail.",
      }
    : {
        subject: `Thank you for your message, ${form.firstName}!`,
        hello: `Hello ${form.firstName},`,
        thanks: `Thank you ${form.firstName} for your message! I'm looking forward to know more about your project.`,
        looking: "I'll get back to you as soon as possible.",
        recap: "For reference, here is your message:",
        name: "Name",
        company: "Company",
        topic: "Topic",
        automatic:
          "This is an automatic acknowledgement. You can reply directly to this email.",
      };
  const lang = fr ? "fr" : "en";
  const fullName = `${form.firstName} ${form.lastName}`;

  const html = layout(
    t.subject,
    `
    <p style="margin:0 0 16px;">${esc(t.hello)}</p>
    <p style="margin:0 0 8px;">${esc(t.thanks)}</p>
    <p style="margin:0 0 24px;">${esc(t.looking)}</p>
    <p style="margin:0;font-size:13px;color:${MUTED};">${esc(t.recap)}</p>
    ${detailsTable([
      [t.name, esc(fullName)],
      [t.company, form.company && esc(form.company)],
      [t.topic, esc(TOPICS[form.topic][lang])],
    ])}
    ${messageBlock(form.message)}
    <p style="margin:28px 0 0;">Paul Pera<br>
      <span style="font-size:13px;color:${MUTED};">Lead Software Engineer &amp; Architect</span><br>
      <a href="${SITE_URL}" style="font-size:13px;color:${ACCENT};text-decoration:none;">paulpera.ch</a>
      <span style="font-size:13px;color:${MUTED};"> · </span>
      <a href="${LINKEDIN_URL}" style="font-size:13px;color:${ACCENT};text-decoration:none;">LinkedIn</a>
    </p>
    <p style="margin:24px 0 0;padding-top:16px;border-top:1px solid ${BORDER};font-size:12px;color:${MUTED};">${esc(t.automatic)}</p>`,
  );

  const text = [
    t.hello,
    "",
    t.thanks,
    t.looking,
    "",
    t.recap,
    "",
    form.message,
    "",
    "Paul Pera — Lead Software Engineer & Architect",
    SITE_URL,
    "",
    t.automatic,
  ].join("\n");

  return { subject: t.subject, html, text };
};
