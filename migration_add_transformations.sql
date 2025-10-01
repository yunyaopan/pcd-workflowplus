-- Migration: Add transformations table
-- This migration adds the transformations table to support saving and loading transformation configurations

-- Create transformations table
CREATE TABLE IF NOT EXISTS transformations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  input_tables JSONB NOT NULL DEFAULT '[]',
  input_params JSONB NOT NULL DEFAULT '[]',
  output_table JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on transformations table
ALTER TABLE transformations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for transformations
CREATE POLICY "Users can view their own transformations" ON transformations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transformations" ON transformations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transformations" ON transformations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transformations" ON transformations
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_transformations_user_id ON transformations(user_id);
