const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function test() {
  const to = `${process.env.PHONE_NUMBER}@${process.env.CARRIER_GATEWAY}`;
  console.log("Sending test SMS to:", to);
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject: "",
      text: "Test: Vapi SMS Notifier is working!",
    });
    console.log("SUCCESS - check your phone");
  } catch (err) {
    console.error("FAILED:", err.message);
  }
}

test();
