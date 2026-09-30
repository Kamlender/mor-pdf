import { NextRequest, NextResponse } from 'next/server';
import { getPublishedContents, getContentBySlug } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const exam = searchParams.get('exam') || '';
    const contentType = searchParams.get('contentType') || '';
    const year = searchParams.get('year') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const q = searchParams.get('q') || '';

    const results = await getPublishedContents({
      search: q || undefined,
      categorySlug: category || undefined,
      contentType: contentType || undefined,
      year: year ? parseInt(year, 10) : undefined,
      limit: Math.min(limit, 50),
      offset: (page - 1) * limit,
    });

    return NextResponse.json({
      success: true,
      items: results,
      total: results.length,
      page,
      limit,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch contents' } }, { status: 500 });
  }
}
