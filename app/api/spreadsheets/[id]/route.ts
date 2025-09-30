import { NextRequest, NextResponse } from 'next/server';
import { spreadsheetApi } from '@/lib/api/spreadsheets';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const spreadsheet = await spreadsheetApi.getSpreadsheet(id);
    if (!spreadsheet) {
      return NextResponse.json(
        { error: 'Spreadsheet not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(spreadsheet);
  } catch (error) {
    console.error('Error fetching spreadsheet:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spreadsheet' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const spreadsheet = await spreadsheetApi.updateSpreadsheet(id, body);
    return NextResponse.json(spreadsheet);
  } catch (error) {
    console.error('Error updating spreadsheet:', error);
    return NextResponse.json(
      { error: 'Failed to update spreadsheet' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await spreadsheetApi.deleteSpreadsheet(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting spreadsheet:', error);
    return NextResponse.json(
      { error: 'Failed to delete spreadsheet' },
      { status: 500 }
    );
  }
}
