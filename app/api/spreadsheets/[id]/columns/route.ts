import { NextRequest, NextResponse } from 'next/server';
import { spreadsheetApi } from '@/lib/api/spreadsheets';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const columns = await spreadsheetApi.getColumns(id);
    return NextResponse.json(columns);
  } catch (error) {
    console.error('Error fetching columns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch columns' },
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
    const column = await spreadsheetApi.createColumn(id, body);
    return NextResponse.json(column, { status: 201 });
  } catch (error) {
    console.error('Error creating column:', error);
    return NextResponse.json(
      { error: 'Failed to create column' },
      { status: 500 }
    );
  }
}
