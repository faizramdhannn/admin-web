import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Initialize Google Sheets API
export async function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  
  return sheets;
}

// Get spreadsheet ID from environment
export function getSpreadsheetId() {
  return process.env.SPREADSHEET_ID;
}

// Read data from a sheet
export async function readSheet(sheetName, range = 'A:Z') {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = getSpreadsheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!${range}`,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) return [];

    // Convert to array of objects
    const headers = rows[0];
    return rows.slice(1).map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
  } catch (error) {
    console.error('Error reading sheet:', error);
    throw error;
  }
}

// Append data to a sheet
export async function appendToSheet(sheetName, values) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = getSpreadsheetId();

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [values],
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error appending to sheet:', error);
    throw error;
  }
}

// Update a row in a sheet
export async function updateSheet(sheetName, rowIndex, values) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = getSpreadsheetId();

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A${rowIndex}:Z${rowIndex}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [values],
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error updating sheet:', error);
    throw error;
  }
}

// Delete a row from a sheet
export async function deleteRow(sheetName, rowIndex) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = getSpreadsheetId();

    // Get sheet ID
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = spreadsheet.data.sheets.find(
      (s) => s.properties.title === sheetName
    );
    
    if (!sheet) throw new Error(`Sheet ${sheetName} not found`);
    const sheetId = sheet.properties.sheetId;

    // Delete the row
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: 'ROWS',
                startIndex: rowIndex - 1,
                endIndex: rowIndex,
              },
            },
          },
        ],
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting row:', error);
    throw error;
  }
}

// Find row index by ID
export async function findRowIndexById(sheetName, id) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = getSpreadsheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:A`,
    });

    const rows = response.data.values || [];
    const index = rows.findIndex((row) => row[0] === id.toString());
    
    return index >= 0 ? index + 1 : -1; // +1 because sheets are 1-indexed
  } catch (error) {
    console.error('Error finding row:', error);
    throw error;
  }
}

// Generate unique ID
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Format date for sheets
export function formatDate(date = new Date()) {
  return date.toISOString();
}