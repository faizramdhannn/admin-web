import { NextResponse } from 'next/server';
import { readSheet } from '@/lib/google-sheets';
import { getInvoicePDFBlob } from '@/lib/pdf-generator';
import { validateSession } from '@/lib/auth';
import { SHEETS, MAX_INVOICE_ITEMS } from '@/constants/config';

export async function GET(request, { params }) {
  try {
    const session = validateSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const invoices = await readSheet(SHEETS.INVOICES);
    const invoice = invoices.find(inv => inv.id === id);

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Parse items
    const items = [];
    for (let i = 1; i <= MAX_INVOICE_ITEMS; i++) {
      const name = invoice[`item_name_${i}`];
      const qty = invoice[`item_qty_${i}`];
      const value = invoice[`item_value_${i}`];
      
      if (name) {
        items.push({ 
          name, 
          qty: parseFloat(qty) || 0, 
          value: parseFloat(value) || 0 
        });
      }
    }

    const invoiceData = {
      ...invoice,
      items,
    };

    // Get settings (optional)
    let settings = {};
    try {
      const settingsData = await readSheet(SHEETS.INVOICE_SETTINGS);
      if (settingsData.length > 0) {
        settings = settingsData[0];
      }
    } catch (error) {
      console.log('No settings found, using defaults');
    }

    // Generate PDF
    const pdfBlob = getInvoicePDFBlob(invoiceData, settings);
    
    // Convert blob to buffer
    const buffer = await pdfBlob.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice-${invoice.invoice_number}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error exporting invoice:', error);
    return NextResponse.json(
      { error: 'Failed to export invoice' },
      { status: 500 }
    );
  }
}