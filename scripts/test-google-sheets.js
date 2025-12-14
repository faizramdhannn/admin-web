// scripts/test-google-sheets.js
require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function testConnection() {
  console.log('🧪 Testing Google Sheets Connection...\n');

  try {
    // Check env vars
    console.log('📋 Checking environment variables:');
    console.log('SPREADSHEET_ID:', process.env.SPREADSHEET_ID ? '✅ Set' : '❌ Missing');
    console.log('GOOGLE_SHEETS_CLIENT_EMAIL:', process.env.GOOGLE_SHEETS_CLIENT_EMAIL ? '✅ Set' : '❌ Missing');
    console.log('GOOGLE_SHEETS_PRIVATE_KEY:', process.env.GOOGLE_SHEETS_PRIVATE_KEY ? '✅ Set' : '❌ Missing');
    console.log('');

    // Initialize auth
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    // Test reading users sheet
    console.log('📖 Reading users sheet...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'users!A:J',
    });

    const rows = response.data.values || [];
    console.log(`✅ Found ${rows.length} rows (including header)\n`);

    if (rows.length > 0) {
      console.log('Headers:', rows[0].join(' | '));
      
      if (rows.length > 1) {
        console.log('\n👥 Users found:');
        rows.slice(1).forEach((row, index) => {
          console.log(`${index + 1}. Username: ${row[1]}, Email: ${row[2]}, Role: ${row[5]}`);
        });
      }
    }

    console.log('\n✅ Google Sheets connection successful!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Check if service account email has access to spreadsheet');
    console.log('2. Verify SPREADSHEET_ID is correct');
    console.log('3. Check GOOGLE_SHEETS_PRIVATE_KEY format (should include \\n)');
    console.log('4. Make sure Google Sheets API is enabled\n');
  }
}

testConnection();