import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { contents, files } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

type Props = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    
    // Find the content
    const content = db.select().from(contents).where(
      and(eq(contents.id, id), eq(contents.status, 'PUBLISHED'))
    ).all();

    if (content.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'CONTENT_NOT_FOUND', message: 'Content not found' } },
        { status: 404 }
      );
    }

    // Get the PDF file
    const pdfFile = db.select().from(files)
      .where(eq(files.id, content[0].pdfFileId))
      .all();

    if (pdfFile.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'FILE_NOT_FOUND', message: 'PDF file not found' } },
        { status: 404 }
      );
    }

    // Build file path
    const filePath = path.join(process.cwd(), 'public', pdfFile[0].storageKey);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: { code: 'FILE_MISSING', message: 'PDF file is missing from storage' } },
        { status: 404 }
      );
    }

    // Get file stats
    const stats = fs.statSync(filePath);

    // Handle Range requests for partial content (needed by PDF.js)
    const rangeHeader = request.headers.get('range');
    
    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = match[2] ? parseInt(match[2], 10) : stats.size - 1;
        const chunkSize = end - start + 1;

        const stream = fs.createReadStream(filePath, { start, end });
        const readable = new ReadableStream({
          start(controller) {
            stream.on('data', (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)));
            stream.on('end', () => controller.close());
            stream.on('error', (err) => controller.error(err));
          },
        });

        return new Response(readable, {
          status: 206,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Length': String(chunkSize),
            'Content-Range': `bytes ${start}-${end}/${stats.size}`,
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }
    }

    // Stream the full file instead of reading entire buffer into memory
    const stream = fs.createReadStream(filePath);
    const readable = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)));
        stream.on('end', () => controller.close());
        stream.on('error', (err) => controller.error(err));
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': String(stats.size),
        'Content-Disposition': `inline; filename="${encodeURIComponent(pdfFile[0].originalName)}"`,
        'Cache-Control': 'public, max-age=3600',
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error) {
    console.error('PDF serve error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to serve PDF' } },
      { status: 500 }
    );
  }
}
