import { NextRequest, NextResponse } from 'next/server';
import { spreadsheetApi } from '@/lib/api/spreadsheets';

export async function GET() {
  try {
    const spreadsheets = await spreadsheetApi.getSpreadsheets();
    return NextResponse.json(spreadsheets);
  } catch (error) {
    console.error('Error fetching spreadsheets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spreadsheets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const spreadsheet = await spreadsheetApi.createSpreadsheet(body);
    return NextResponse.json(spreadsheet, { status: 201 });
  } catch (error) {
    console.error('Error creating spreadsheet:', error);
    return NextResponse.json(
      { error: 'Failed to create spreadsheet' },
      { status: 500 }
    );
  }
}
