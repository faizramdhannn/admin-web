import { NextResponse } from 'next/server';
import { readSheet, appendToSheet, generateId, formatDate } from '@/lib/google-sheets';
import { validateSession } from '@/lib/auth';
import { SHEETS, MAX_INVOICE_ITEMS } from '@/constants/config';

// GET all invoices
export async function GET(request) {
  try {
    const session = validateSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invoices = await readSheet(SHEETS.INVOICES);
    
    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// POST create new invoice
export async function POST(request) {
  try {
    const session = validateSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      invoice_number,
      date,
      so_number,
      customer_name,
      customer_address,
      items, // Array of {name, qty, value}
      use_signature,
      use_ppn,
      status,
    } = body;

    // Validation
    if (!invoice_number || !customer_name || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Invoice number, customer name, and items are required' },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.qty * item.value), 0);
    const ppn_amount = use_ppn ? subtotal * 0.11 : 0;
    const total = subtotal + ppn_amount;

    const id = generateId();
    const now = formatDate();

    // Prepare items data (max 5 items)
    const itemsData = [];
    for (let i = 0; i < MAX_INVOICE_ITEMS; i++) {
      const item = items[i] || {};
      itemsData.push(item.name || '');
      itemsData.push(item.qty || '');
      itemsData.push(item.value || '');
    }

    const values = [
      id,
      invoice_number,
      date || now,
      so_number || '',
      customer_name,
      customer_address || '',
      ...itemsData,
      subtotal,
      ppn_amount,
      total,
      use_signature ? 'true' : 'false',
      use_ppn ? 'true' : 'false',
      status || 'draft',
      session.id,
      now,
      now,
    ];

    await appendToSheet(SHEETS.INVOICES, values);

    return NextResponse.json({
      message: 'Invoice created successfully',
      invoice: {
        id,
        invoice_number,
        date,
        so_number,
        customer_name,
        customer_address,
        items,
        subtotal,
        ppn_amount,
        total,
        use_signature,
        use_ppn,
        status: status || 'draft',
        created_by: session.id,
        created_at: now,
        updated_at: now,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}