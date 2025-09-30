import { NextRequest, NextResponse } from 'next/server';
import { spreadsheetApi } from '@/lib/api/spreadsheets';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; columnId: string }> }
) {
  try {
    const { columnId } = await params;
    const body = await request.json();
    const column = await spreadsheetApi.updateColumn(columnId, body);
    return NextResponse.json(column);
  } catch (error) {
    console.error('Error updating column:', error);
    return NextResponse.json(
      { error: 'Failed to update column' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; columnId: string }> }
) {
  try {
    const { columnId } = await params;
    await spreadsheetApi.deleteColumn(columnId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting column:', error);
    return NextResponse.json(
      { error: 'Failed to delete column' },
      { status: 500 }
    );
  }
}
