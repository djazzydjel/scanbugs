import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/insects?category=&risk_level=&search=
 * Retrieve pest database with filters
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const riskLevel = searchParams.get('risk_level');
    const search = searchParams.get('search');

    let query = supabase
      .from('insects')
      .select('*')
      .order('common_name_fr', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    if (riskLevel) {
      query = query.eq('risk_level', riskLevel);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Client-side search if needed
    let filtered = data || [];
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (insect) =>
          insect.common_name_fr?.toLowerCase().includes(searchLower) ||
          insect.scientific_name?.toLowerCase().includes(searchLower) ||
          insect.description_fr?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      data: filtered,
      count: filtered.length,
    });
  } catch (error) {
    console.error('GET insects error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve insects database' },
      { status: 500 }
    );
  }
}
