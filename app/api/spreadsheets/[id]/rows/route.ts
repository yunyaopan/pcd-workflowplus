import { NextRequest, NextResponse } from 'next/server';
import { spreadsheetApi } from '@/lib/api/spreadsheets';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rows = await spreadsheetApi.getRows(id);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching rows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rows' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const row = await spreadsheetApi.createRow(id, body);
    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    console.error('Error creating row:', error);
    return NextResponse.json(
      { error: 'Failed to create row' },
      { status: 500 }
    );
  }
}
