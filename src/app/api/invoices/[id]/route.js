import { NextResponse } from 'next/server';
import { readSheet, updateSheet, deleteRow, findRowIndexById, formatDate } from '@/lib/google-sheets';
import { validateSession } from '@/lib/auth';
import { SHEETS, MAX_INVOICE_ITEMS } from '@/constants/config';

// GET single invoice
export async function GET(request, { params }) {
  try {
    const session = validateSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ FIXED: Await params in Next.js 15+
    const { id } = await params;
    
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
        items.push({ name, qty: parseFloat(qty) || 0, value: parseFloat(value) || 0 });
      }
    }

    return NextResponse.json({ 
      invoice: {
        ...invoice,
        items,
      }
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

// PUT update invoice
export async function PUT(request, { params }) {
  try {
    const session = validateSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ FIXED: Await params in Next.js 15+
    const { id } = await params;
    const body = await request.json();

    const rowIndex = await findRowIndexById(SHEETS.INVOICES, id);
    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const invoices = await readSheet(SHEETS.INVOICES);
    const existingInvoice = invoices.find(inv => inv.id === id);

    const items = body.items || [];
    const subtotal = items.reduce((sum, item) => sum + (item.qty * item.value), 0);
    const use_ppn = body.use_ppn !== undefined ? body.use_ppn : existingInvoice.use_ppn === 'true';
    const ppn_amount = use_ppn ? subtotal * 0.11 : 0;
    const total = subtotal + ppn_amount;

    // Prepare items data
    const itemsData = [];
    for (let i = 0; i < MAX_INVOICE_ITEMS; i++) {
      const item = items[i] || {};
      itemsData.push(item.name || '');
      itemsData.push(item.qty || '');
      itemsData.push(item.value || '');
    }

    const values = [
      id,
      body.invoice_number || existingInvoice.invoice_number,
      body.date || existingInvoice.date,
      body.so_number || existingInvoice.so_number,
      body.customer_name || existingInvoice.customer_name,
      body.customer_address || existingInvoice.customer_address,
      ...itemsData,
      subtotal,
      ppn_amount,
      total,
      body.use_signature !== undefined ? (body.use_signature ? 'true' : 'false') : existingInvoice.use_signature,
      use_ppn ? 'true' : 'false',
      body.status || existingInvoice.status,
      existingInvoice.created_by,
      existingInvoice.created_at,
      formatDate(),
    ];

    await updateSheet(SHEETS.INVOICES, rowIndex, values);

    return NextResponse.json({
      message: 'Invoice updated successfully',
    });

  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

// DELETE invoice
export async function DELETE(request, { params }) {
  try {
    const session = validateSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ FIXED: Await params in Next.js 15+
    const { id } = await params;
    const rowIndex = await findRowIndexById(SHEETS.INVOICES, id);
    
    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    await deleteRow(SHEETS.INVOICES, rowIndex);

    return NextResponse.json({
      message: 'Invoice deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}