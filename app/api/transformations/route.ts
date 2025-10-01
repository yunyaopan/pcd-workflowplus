import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CreateTransformationRequest } from '@/lib/database/types';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: transformations, error } = await supabase
      .from('transformations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching transformations:', error);
      return NextResponse.json({ error: 'Failed to fetch transformations' }, { status: 500 });
    }

    return NextResponse.json({ transformations });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateTransformationRequest = await request.json();
    
    if (!body.name || !body.input_tables || !body.input_params || !body.output_table) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: transformation, error } = await supabase
      .from('transformations')
      .insert({
        name: body.name,
        description: body.description,
        user_id: user.id,
        input_tables: body.input_tables,
        input_params: body.input_params,
        output_table: body.output_table,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating transformation:', error);
      return NextResponse.json({ error: 'Failed to create transformation' }, { status: 500 });
    }

    return NextResponse.json({ transformation }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
