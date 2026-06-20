import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { google } from 'googleapis';

export async function POST(request) {
  console.log("POST request received at /api/submit");
  try {
    const formData = await request.formData();
    console.log("Form data parsed successfully. Keys:", Array.from(formData.keys()));
    
    const name = formData.get('name') || formData.get('fullName') || '';
    const email = formData.get('email') || '';
    const imageFile = formData.get('image') || formData.get('photoFile') || formData.get('signatureFile');
    
    console.log("Extracted fields - Name:", name, "Email:", email, "Has Image File:", !!imageFile);

    let imageUrl = '';
    if (imageFile && imageFile.name) {
      console.log("Uploading file to Vercel Blob:", imageFile.name);
      const blob = await put(imageFile.name, imageFile, {
        access: 'private',
        multipart: true,
      });
      imageUrl = blob.url;
      console.log("Vercel Blob upload success. URL:", imageUrl);
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

    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    console.error('Error submitting form in route.js:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
