import { NextRequest, NextResponse } from 'next/server';
import { spreadsheetApi } from '@/lib/api/spreadsheets';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rowId, columnId, value } = body;
    
    if (!rowId || !columnId) {
      return NextResponse.json(
        { error: 'rowId and columnId are required' },
        { status: 400 }
      );
    }

    const cell = await spreadsheetApi.upsertCell(rowId, columnId, { value });
    return NextResponse.json(cell, { status: 201 });
  } catch (error) {
    console.error('Error upserting cell:', error);
    return NextResponse.json(
      { error: 'Failed to upsert cell' },
      { status: 500 }
    );
  }
}
