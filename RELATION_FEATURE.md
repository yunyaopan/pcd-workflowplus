# Relation Feature Documentation

## Overview
The relation feature allows users to create relationships between rows in different spreadsheets, similar to Notion's relation property. This enables users to connect data across multiple spreadsheets and maintain referential integrity.

## How to Use Relations

### 1. Creating a Relation Column
1. Open a spreadsheet
2. Click "Add Column" 
3. Select "Relation" as the data type
4. Choose the target spreadsheet from the dropdown
5. Click "Save"

### 2. Setting Up Relations
1. Click on a relation cell (shows "Select..." initially)
2. A modal will open showing all rows from the target spreadsheet
3. Check the rows you want to relate to this row
4. Click "Save" to establish the relationships

### 3. Viewing Relations
- Relation cells show the number of related items (e.g., "3 related")
- Click on the cell to modify the relationships

## Technical Implementation

### Database Schema
- `spreadsheet_relations` table stores the relationships
- Each relation links a row in one spreadsheet to a row in another spreadsheet
- Relations are stored with `row_id`, `column_id`, and `related_row_id`

### API Endpoints
- `POST /api/spreadsheets/[id]/relations` - Update relations for a row/column
- `GET /api/spreadsheets/[id]/relations` - Get relations for a row/column  
- `GET /api/spreadsheets/[id]/available-rows` - Get available rows for relation

### Frontend Components
- `RelationCell` component handles the relation selection UI
- Updated `ColumnEditor` to support relation column creation
- Enhanced `SpreadsheetEditor` to render relation cells

## Features
- ✅ Create relation columns between spreadsheets
- ✅ Select multiple rows to relate to
- ✅ Visual indication of related items count
- ✅ Modal interface for relation management
- ✅ Real-time updates when relations change

## Future Enhancements
- Two-way relations (automatic reverse relationships)
- Rollup calculations based on relations
- Better visualization of related data
- Relation validation and constraints
- Bulk relation operations
