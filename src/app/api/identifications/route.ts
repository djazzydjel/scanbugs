import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'user_id requis' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('identifications')
      .select('*, insects(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: unknown) {
    console.error('GET identifications error:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, image_url, confidence, analysis_details } = body;

    if (!user_id || !image_url) {
      return NextResponse.json({ error: 'Données incomplètes' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('identifications')
      .insert({ user_id, image_url, confidence, analysis_details })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error('POST identifications error:', error);
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 });
  }
}
