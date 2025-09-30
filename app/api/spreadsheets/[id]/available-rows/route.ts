import { NextRequest, NextResponse } from 'next/server';
import { spreadsheetApi } from '@/lib/api/spreadsheets';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const excludeRowId = searchParams.get('excludeRowId');
    
    const rows = await spreadsheetApi.getAvailableRowsForRelation(
      id, 
      excludeRowId || undefined
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching available rows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available rows' },
      { status: 500 }
    );
  }
}
