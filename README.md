# ADL Digihouse

This project is a React landing page for ADL Digihouse.

## Applications page

The site now includes an Applications landing page that lists each application type, and a separate form-only page for each type.

To make submitted forms update a spreadsheet, set `REACT_APP_APPLICATIONS_WEBHOOK_URL` to an endpoint that appends rows to your Excel or Google Sheets workflow. A Google Apps Script web app or a small API endpoint works well for this.