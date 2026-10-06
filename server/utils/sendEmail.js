// Sends an email through Brevo's web API. This works on Render's free plan,
// which blocks normal email ports. Without a Brevo key, it prints the
// message in the server terminal instead, so you can still test everything.
const sendEmail = async ({ to, subject, text }) => {
  if (!process.env.BREVO_API_KEY || !process.env.EMAIL_FROM) {
    console.log("\n========== EMAIL (not sent: no Brevo key set up) ==========");
    console.log(`To: ${to}\nSubject: ${subject}\n\n${text}`);
    console.log("===========================================================\n");
    return { sent: false };
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: "ExamPrep AI", email: process.env.EMAIL_FROM },
      to: [{ email: to }],
      subject,
      textContent: text,
    }),
    signal: AbortSignal.timeout(10000), // give up after 10 seconds
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Brevo error ${res.status}: ${detail}`);
  }
  return { sent: true };
};

module.exports = sendEmail;