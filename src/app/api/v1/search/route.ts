import { NextRequest, NextResponse } from 'next/server';
import { getPublishedContents } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const contentType = searchParams.get('contentType') || '';
    const year = searchParams.get('year') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const results = await getPublishedContents({
      search: q || undefined,
      categorySlug: category || undefined,
      contentType: contentType || undefined,
      year: year ? parseInt(year, 10) : undefined,
      limit: Math.min(limit, 50),
      offset: (page - 1) * limit,
    });

    return NextResponse.json({
      items: results,
      total: results.length,
      page,
      limit,
    });
  } catch (error) {
    return NextResponse.json({ items: [], total: 0, page: 1, limit: 20 });
  }
}
