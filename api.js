import { google } from "googleapis";

export default async function handler(req, res) {
  return res.status(200).json({ ok: true });
}

export async function connectSheet() {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  return sheets;
}
