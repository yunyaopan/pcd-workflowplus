import { NextRequest, NextResponse } from 'next/server';
import { spreadsheetApi } from '@/lib/api/spreadsheets';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const spreadsheet = await spreadsheetApi.getSpreadsheetWithData(id);
    if (!spreadsheet) {
      return NextResponse.json(
        { error: 'Spreadsheet not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(spreadsheet);
  } catch (error) {
    console.error('Error fetching spreadsheet data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spreadsheet data' },
      { status: 500 }
    );
  }
}
