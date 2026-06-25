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

    // Helper function to extract file extension
    const getExtension = (filename) => {
      const parts = filename.split('.');
      return parts.length > 1 ? `.${parts.pop()}` : '';
    };

    const applicationNumber = getField('applicationNumber') || 'unknown';

    // Helper function to upload file to Vercel Blob
    const uploadFile = async (fieldKey, suffix) => {
      const fileData = files[fieldKey];
      if (!fileData) return '';
      const imageFile = Array.isArray(fileData) ? fileData[0] : fileData;
      if (imageFile && imageFile.originalFilename) {
        const ext = getExtension(imageFile.originalFilename);
        const newFilename = `${applicationNumber}_${suffix}${ext}`;
        console.log(`Uploading file ${fieldKey} to Vercel Blob as ${newFilename}`);
        const fileBuffer = fs.readFileSync(imageFile.filepath);
        const blob = await put(newFilename, fileBuffer, {
          access: 'private',
          addRandomSuffix: true,
        });
        console.log(`Vercel Blob upload success for ${fieldKey}. URL:`, blob.url);
        return blob.url;
      }
      return '';
    };

    const signatureUrl = await uploadFile('signatureFile', 'sig');
    const photoUrl = await uploadFile('photoFile', 'passport');
    const genericImageUrl = await uploadFile('image', 'img'); // Support fallback/legacy single image if present

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

    return res.status(200).json({ success: true, imageUrl: signatureImageUrl || photoImageUrl });
  } catch (error) {
    console.error('Error submitting form in /api/submit serverless function:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
