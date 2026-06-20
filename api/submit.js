const { put } = require('@vercel/blob');
const { google } = require('googleapis');
const formidable = require('formidable');
const fs = require('fs');

// Disable Vercel's default body parser so formidable can handle the multipart/form-data stream
module.exports.config = {
  api: {
    bodyParser: false,
  },
};

module.exports = async function handler(req, res) {
  console.log("POST request received at Vercel Function: /api/submit");

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable.formidable({});

  try {
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error("Formidable parsing error:", err);
          reject(err);
        }
        resolve([fields, files]);
      });
    });

    console.log("Parsed fields:", fields);

    // Formidable v3 parses fields as arrays. Normalize to get string values
    const getField = (name) => {
      const val = fields[name];
      if (Array.isArray(val)) return val[0];
      return val || '';
    };

    const name = getField('name') || getField('fullName') || getField('nameWithInitials') || '';
    const email = getField('email') || '';

    // Extract any uploaded file
    const fileKeys = Object.keys(files);
    let imageUrl = '';

    if (fileKeys.length > 0) {
      const fileKey = fileKeys[0];
      const imageFile = Array.isArray(files[fileKey]) ? files[fileKey][0] : files[fileKey];

      if (imageFile && imageFile.originalFilename) {
        console.log("Uploading file to Vercel Blob:", imageFile.originalFilename);
        const fileBuffer = fs.readFileSync(imageFile.filepath);
        const blob = await put(imageFile.originalFilename, fileBuffer, {
          access: 'private',
        });
        imageUrl = blob.url;
        console.log("Vercel Blob upload success. URL:", imageUrl);
      }
    }

    console.log("Initializing Google Sheets Auth...");
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
    if (privateKey) {
      privateKey = privateKey.trim();
      if (privateKey.startsWith('"')) {
        privateKey = privateKey.substring(1);
      }
      if (privateKey.endsWith(',')) {
        privateKey = privateKey.substring(0, privateKey.length - 1).trim();
      }
      if (privateKey.endsWith('"')) {
        privateKey = privateKey.substring(0, privateKey.length - 1);
      }
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || process.env.GOOGLE_SHEET_ID;
    const range = 'Sheet1!A:D';

    console.log("Appending row to Google Sheet ID:", spreadsheetId);
    const result = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [name, email, imageUrl, new Date().toLocaleString()]
        ],
      },
    });
    console.log("Google Sheets append success status:", result.status);

    return res.status(200).json({ success: true, imageUrl });
  } catch (error) {
    console.error('Error submitting form in /api/submit serverless function:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
