# Transformations Feature

This document describes the new transformations feature that allows users to save, edit, and delete transformation configurations.

## Overview

The transformations feature enables users to:
- Save their current transformation setup (input tables, input parameters, and output table configuration)
- Load previously saved transformations
- Edit transformation names and descriptions
- Delete transformations they no longer need
- View all their saved transformations in a dedicated page

## Database Schema

### transformations table
- `id`: UUID primary key
- `name`: Transformation name (required)
- `description`: Optional description
- `user_id`: Reference to the user who created the transformation
- `input_tables`: JSONB array of input table configurations
- `input_params`: JSONB array of input parameter configurations
- `output_table`: JSONB object containing output table configuration
- `created_at`: Timestamp when the transformation was created
- `updated_at`: Timestamp when the transformation was last updated

## API Endpoints

### GET /api/transformations
Returns all transformations for the authenticated user.

### POST /api/transformations
Creates a new transformation.

**Request Body:**
```json
{
  "name": "string",
  "description": "string (optional)",
  "input_tables": [...],
  "input_params": [...],
  "output_table": {...}
}
```

### GET /api/transformations/[id]
Returns a specific transformation by ID.

### PUT /api/transformations/[id]
Updates a transformation's name and description.

**Request Body:**
```json
{
  "name": "string (optional)",
  "description": "string (optional)"
}
```

### DELETE /api/transformations/[id]
Deletes a transformation.

## Pages

### /transformations
- Lists all saved transformations
- Shows transformation metadata (name, description, stats)
- Provides actions to load, edit, or delete transformations
- Responsive grid layout

### /logic-generator
- Enhanced with save/load functionality
- Save button opens a modal to enter name and description
- Load functionality via URL parameter (`?load=transformation_id`)
- View Saved button links to transformations page

## Usage

### Saving a Transformation
1. Configure your input tables, input parameters, and output table in the logic generator
2. Click "Save Transformation" button
3. Enter a name and optional description
4. Click "Save"

### Loading a Transformation
1. Go to the transformations page (`/transformations`)
2. Click the load button (folder icon) on any transformation
3. You'll be redirected to the logic generator with the transformation loaded

### Editing a Transformation
1. Go to the transformations page
2. Click the edit button (pencil icon) on any transformation
3. Modify the name and/or description
4. Click "Update"

### Deleting a Transformation
1. Go to the transformations page
2. Click the delete button (trash icon) on any transformation
3. Confirm the deletion in the modal

## Security

- All transformations are protected by Row Level Security (RLS)
- Users can only access their own transformations
- All API endpoints require authentication

## Migration

To apply the database changes, run the migration script:

```sql
-- Run the contents of migration_add_transformations.sql
```

This will create the transformations table with proper RLS policies and indexes.
