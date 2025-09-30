# Spreadsheet System Setup

This document explains how to set up the database schema for the spreadsheet system.

## Database Setup

1. **Run the SQL Schema**: Execute the SQL commands in `/lib/database/schema.sql` in your Supabase SQL editor to create the necessary tables and policies.

2. **Tables Created**:
   - `spreadsheets`: Stores spreadsheet metadata
   - `spreadsheet_columns`: Stores column definitions with data types
   - `spreadsheet_rows`: Stores row metadata
   - `spreadsheet_cells`: Stores individual cell values

3. **Row Level Security**: All tables have RLS enabled with policies that ensure users can only access their own spreadsheets.

## Features Implemented

### ✅ Basic Functions (Completed)
- **0) Spreadsheet Management**: Users can create spreadsheets and see a list of all their spreadsheets
- **1) Column Data Types**: Users can specify data types for each column (text, number, date, select, checkbox)
- **2) Add Columns**: Users can add new columns to existing spreadsheets

### 🎯 Additional Features
- **Real-time Editing**: Cells update immediately as you type
- **Column Management**: Edit column names, types, and options
- **Row Management**: Add and delete rows
- **Data Persistence**: All changes are saved to the database
- **Responsive Design**: Works on desktop and mobile devices

## Usage

1. **Access Spreadsheets**: Navigate to `/spreadsheets` to see your spreadsheet list
2. **Create Spreadsheet**: Click "New Spreadsheet" to create a new one
3. **Edit Spreadsheet**: Click on any spreadsheet to open the editor
4. **Add Columns**: Click "Add Column" in the spreadsheet editor
5. **Add Rows**: Click "Add Row" to add new data rows
6. **Edit Cells**: Click on any cell to edit its value

## Data Types Supported

- **Text**: Free-form text input
- **Number**: Numeric input with validation
- **Date**: Date picker
- **Select**: Dropdown with custom options
- **Checkbox**: Boolean true/false values

## API Endpoints

- `GET /api/spreadsheets` - List all spreadsheets
- `POST /api/spreadsheets` - Create new spreadsheet
- `GET /api/spreadsheets/[id]` - Get spreadsheet details
- `PUT /api/spreadsheets/[id]` - Update spreadsheet
- `DELETE /api/spreadsheets/[id]` - Delete spreadsheet
- `GET /api/spreadsheets/[id]/data` - Get spreadsheet with all data
- `POST /api/spreadsheets/[id]/columns` - Add new column
- `PUT /api/spreadsheets/[id]/columns/[columnId]` - Update column
- `DELETE /api/spreadsheets/[id]/columns/[columnId]` - Delete column
- `POST /api/spreadsheets/[id]/rows` - Add new row
- `DELETE /api/spreadsheets/[id]/rows/[rowId]` - Delete row
- `POST /api/spreadsheets/[id]/cells` - Update cell value

## Security

- All operations require authentication
- Row Level Security ensures users can only access their own data
- All API endpoints validate user permissions through Supabase RLS
