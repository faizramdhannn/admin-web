import { NextResponse } from 'next/server';
import { readSheet, updateSheet, deleteRow, findRowIndexById, formatDate } from '@/lib/google-sheets';
import { validateSession } from '@/lib/auth';
import { SHEETS } from '@/constants/config';

// GET single master item
export async function GET(request, { params }) {
  try {
    const session = validateSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const items = await readSheet(SHEETS.MASTER_ITEMS);
    const item = items.find(i => i.id === id);

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error fetching master item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch master item' },
      { status: 500 }
    );
  }
}

// PUT update master item
export async function PUT(request, { params }) {
  try {
    const session = validateSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    const rowIndex = await findRowIndexById(SHEETS.MASTER_ITEMS, id);
    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const items = await readSheet(SHEETS.MASTER_ITEMS);
    const existingItem = items.find(i => i.id === id);

    const values = [
      id,
      body.sku || existingItem.sku,
      body.product_variant || existingItem.product_variant,
      body.color_variant || existingItem.color_variant,
      body.size_variant || existingItem.size_variant,
      body.article || existingItem.article,
      body.category || existingItem.category,
      body.grade || existingItem.grade,
      body.hpp_unit || existingItem.hpp_unit,
      body.std_selling || existingItem.std_selling,
      body.hpj_unit || existingItem.hpj_unit,
      body.image_url || existingItem.image_url,
      existingItem.created_at,
      formatDate(),
    ];

    await updateSheet(SHEETS.MASTER_ITEMS, rowIndex, values);

    return NextResponse.json({
      message: 'Master item updated successfully',
      item: {
        id,
        ...body,
        updated_at: formatDate(),
      },
    });

  } catch (error) {
    console.error('Error updating master item:', error);
    return NextResponse.json(
      { error: 'Failed to update master item' },
      { status: 500 }
    );
  }
}

// DELETE master item
export async function DELETE(request, { params }) {
  try {
    const session = validateSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const rowIndex = await findRowIndexById(SHEETS.MASTER_ITEMS, id);
    
    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    await deleteRow(SHEETS.MASTER_ITEMS, rowIndex);

    return NextResponse.json({
      message: 'Master item deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting master item:', error);
    return NextResponse.json(
      { error: 'Failed to delete master item' },
      { status: 500 }
    );
  }
}