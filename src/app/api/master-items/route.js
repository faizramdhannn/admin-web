import { NextResponse } from 'next/server';
import { readSheet, appendToSheet, generateId, formatDate } from '@/lib/google-sheets';
import { validateSession } from '@/lib/auth';
import { SHEETS } from '@/constants/config';

// GET all master items
export async function GET(request) {
  try {
    const session = validateSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const items = await readSheet(SHEETS.MASTER_ITEMS);
    
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching master items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch master items' },
      { status: 500 }
    );
  }
}

// POST create new master item
export async function POST(request) {
  try {
    const session = validateSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      sku,
      product_variant,
      color_variant,
      size_variant,
      article,
      category,
      grade,
      hpp_unit,
      std_selling,
      hpj_unit,
      image_url,
    } = body;

    // Validation
    if (!sku || !product_variant) {
      return NextResponse.json(
        { error: 'SKU and product variant are required' },
        { status: 400 }
      );
    }

    const id = generateId();
    const now = formatDate();

    const values = [
      id,
      sku,
      product_variant,
      color_variant || '',
      size_variant || '',
      article || '',
      category || '',
      grade || '',
      hpp_unit || '0',
      std_selling || '0',
      hpj_unit || '0',
      image_url || '',
      now,
      now,
    ];

    await appendToSheet(SHEETS.MASTER_ITEMS, values);

    return NextResponse.json({
      message: 'Master item created successfully',
      item: {
        id,
        sku,
        product_variant,
        color_variant,
        size_variant,
        article,
        category,
        grade,
        hpp_unit,
        std_selling,
        hpj_unit,
        image_url,
        created_at: now,
        updated_at: now,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating master item:', error);
    return NextResponse.json(
      { error: 'Failed to create master item' },
      { status: 500 }
    );
  }
}