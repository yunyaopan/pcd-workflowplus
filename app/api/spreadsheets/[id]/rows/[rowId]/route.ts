import { NextRequest, NextResponse } from 'next/server';
import { spreadsheetApi } from '@/lib/api/spreadsheets';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; rowId: string }> }
) {
  try {
    const { rowId } = await params;
    await spreadsheetApi.deleteRow(rowId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting row:', error);
    return NextResponse.json(
      { error: 'Failed to delete row' },
      { status: 500 }
    );
  }
}
