import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { google } from 'googleapis';

export async function POST(request) {
  console.log("POST request received at /api/submit");
  try {
    const formData = await request.formData();
    console.log("Form data parsed successfully. Keys:", Array.from(formData.keys()));
    
    const getField = (name) => formData.get(name) || '';

    // Helper function to extract file extension
    const getExtension = (filename) => {
      const parts = filename.split('.');
      return parts.length > 1 ? `.${parts.pop()}` : '';
    };

    const applicationNumber = getField('applicationNumber') || 'unknown';

    const uploadFile = async (fieldKey, suffix) => {
      const file = formData.get(fieldKey);
      if (file && file.name) {
        const ext = getExtension(file.name);
        const newFilename = `${applicationNumber}_${suffix}${ext}`;
        console.log(`Uploading file ${fieldKey} to Vercel Blob as ${newFilename}`);
        const blob = await put(newFilename, file, {
          access: 'private',
          multipart: true,
          addRandomSuffix: true,
        });
        console.log(`Vercel Blob upload success for ${fieldKey}. URL:`, blob.url);
        return blob.url;
      }
      return '';
    };

    const signatureUrl = await uploadFile('signatureFile', 'sig');
    const photoUrl = await uploadFile('photoFile', 'passport');
    const genericImageUrl = await uploadFile('image', 'img');

    const applicationType = getField('applicationType');
    const applicationTitle = getField('applicationTitle');
    const submittedAt = getField('submittedAt') || new Date().toLocaleString();
    const name = getField('nameWithInitials') || getField('fullName') || getField('name') || '';
    const nic = getField('nic');
    const gender = getField('gender');
    const age = getField('age');
    const birthday = getField('birthday');
    const designation = getField('designation') || getField('position') || '';
    const divisionWard = getField('divisionWard');
    const employeeNo = getField('employeeNo');
    const department = getField('department');
    const companyName = getField('companyName');
    const experienceYears = getField('experienceYears');
    const skills = getField('skills');
    const address = getField('address');
    const phone = getField('mobileNumber') || getField('phone') || '';
    const email = getField('email') || '';
    const signatureImageUrl = signatureUrl || genericImageUrl || '';
    const photoImageUrl = photoUrl || '';
    const studioPhotoNo = getField('studioPhotoNo');
    const referenceNo = getField('referenceNo');

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
    const range = 'Sheet1!A:W';

    const row = [
      applicationNumber,
      applicationType,
      applicationTitle,
      submittedAt,
      name,
      nic,
      gender,
      age,
      birthday,
      designation,
      divisionWard,
      employeeNo,
      department,
      companyName,
      experienceYears,
      skills,
      address,
      phone,
      email,
      signatureImageUrl,
      photoImageUrl,
      studioPhotoNo,
      referenceNo
    ];

    console.log("Appending row to Google Sheet ID:", spreadsheetId);
    const result = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });
    console.log("Google Sheets append success status:", result.status);

    return NextResponse.json({ success: true, imageUrl: signatureImageUrl || photoImageUrl });
  } catch (error) {
    console.error('Error submitting form in route.js:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
