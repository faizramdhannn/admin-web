import { NextResponse } from 'next/server';
import { readSheet, appendToSheet, updateSheet, findRowIndexById, generateId, formatDate } from '@/lib/google-sheets';
import { validateSession } from '@/lib/auth';
import { SHEETS } from '@/constants/config';

// GET settings
export async function GET(request) {
  try {
    const session = validateSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await readSheet(SHEETS.INVOICE_SETTINGS);
    
    return NextResponse.json({ 
      settings: settings.length > 0 ? settings[0] : null 
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// POST/UPDATE settings
export async function POST(request) {
  try {
    const session = validateSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      company_name,
      company_address,
      company_phone,
      company_email,
      invoice_prefix,
      next_invoice_number,
      ppn_percentage,
      default_use_signature,
      default_use_ppn,
      header_image_url,
      signature_image_url,
    } = body;

    const now = formatDate();
    
    // Check if settings already exist
    const existingSettings = await readSheet(SHEETS.INVOICE_SETTINGS);
    
    const values = [
      existingSettings.length > 0 ? existingSettings[0].id : generateId(),
      header_image_url || '',
      company_name || '',
      company_address || '',
      company_phone || '',
      company_email || '',
      signature_image_url || '',
      default_use_signature ? 'true' : 'false',
      default_use_ppn ? 'true' : 'false',
      ppn_percentage || '11',
      invoice_prefix || 'INV',
      next_invoice_number || '1',
      session.id,
      now,
    ];

    if (existingSettings.length > 0) {
      // Update existing settings
      const rowIndex = await findRowIndexById(SHEETS.INVOICE_SETTINGS, existingSettings[0].id);
      await updateSheet(SHEETS.INVOICE_SETTINGS, rowIndex, values);
    } else {
      // Create new settings
      await appendToSheet(SHEETS.INVOICE_SETTINGS, values);
    }

    return NextResponse.json({
      message: 'Settings saved successfully',
    });

  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}