import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { google } from 'googleapis';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') || formData.get('fullName') || '';
    const email = formData.get('email') || '';
    const imageFile = formData.get('image') || formData.get('photoFile') || formData.get('signatureFile');

    let imageUrl = '';
    if (imageFile && imageFile.name) {
      const blob = await put(imageFile.name, imageFile, {
        access: 'public',
        multipart: true,
      });
      imageUrl = blob.url;
    }

    // Google Sheets authentication
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || process.env.GOOGLE_SHEET_ID;
    const range = 'Sheet1!A:D';

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [name, email, imageUrl, new Date().toLocaleString()]
        ],
      },
    });

    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    console.error('Error submitting form:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
