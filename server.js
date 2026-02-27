const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendSMS(text) {
  const to = `${process.env.PHONE_NUMBER}@${process.env.CARRIER_GATEWAY}`;
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject: "",
    text,
  });
  console.log("SMS sent to", to);
}

app.post("/webhook", async (req, res) => {
  try {
    const message = req.body?.message || req.body;
    const type = message?.type;

    console.log("Webhook received:", type);

    if (type !== "end-of-call-report") {
      return res.json({ ok: true });
    }

    const call = message.call || {};
    const caller = call.customer?.number || "Unknown";
    const duration = message.durationSeconds
      ? `${Math.round(message.durationSeconds)}s`
      : "N/A";
    const cost = call.cost != null ? `$${Number(call.cost).toFixed(4)}` : "N/A";
    const transcript = message.artifact?.transcript || message.transcript || "No transcript";
    const recording = message.artifact?.recordingUrl || message.recordingUrl || "No recording";

    // SMS has a ~160 char limit per segment — keep it concise
    const shortTranscript =
      transcript.length > 300 ? transcript.substring(0, 297) + "..." : transcript;

    const smsText =
      `Vapi Call\n` +
      `From: ${caller}\n` +
      `Duration: ${duration} | Cost: ${cost}\n` +
      `Recording: ${recording}\n\n` +
      `Transcript:\n${shortTranscript}`;

    await sendSMS(smsText);
    res.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => res.send("Vapi SMS Notifier is running."));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
