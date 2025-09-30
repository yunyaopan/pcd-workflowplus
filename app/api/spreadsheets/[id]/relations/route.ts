import { NextRequest, NextResponse } from 'next/server';
import { spreadsheetApi } from '@/lib/api/spreadsheets';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { rowId, columnId, relatedRowIds } = body;
    
    await spreadsheetApi.upsertRelations(rowId, columnId, { relatedRowIds });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating relations:', error);
    return NextResponse.json(
      { error: 'Failed to update relations' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const rowId = searchParams.get('rowId');
    const columnId = searchParams.get('columnId');
    
    if (!rowId || !columnId) {
      return NextResponse.json(
        { error: 'rowId and columnId are required' },
        { status: 400 }
      );
    }
    
    const relations = await spreadsheetApi.getRelatedRows(rowId, columnId);
    return NextResponse.json(relations);
  } catch (error) {
    console.error('Error fetching relations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch relations' },
      { status: 500 }
    );
  }
}
