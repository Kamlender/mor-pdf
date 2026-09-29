'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Configure PDF.js worker - use CDN for reliability with Next.js Turbopack
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

interface Props {
  contentId: string;
  title: string;
  isBook: boolean;
  onClose: () => void;
}

export default function PDFReader({ contentId, title, isBook, onClose }: Props) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageInputValue, setPageInputValue] = useState('1');
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Double-buffer: track which page is currently "visible" (fully rendered)
  const [visiblePage, setVisiblePage] = useState<number>(1);
  const [pendingPage, setPendingPage] = useState<number | null>(null);

  // Get PDF URL from API
  const pdfUrl = `/api/v1/contents/${contentId}/pdf`;

  // Restore page from session
  useEffect(() => {
    const savedPage = sessionStorage.getItem(`pdfxpress-page-${contentId}`);
    if (savedPage) {
      const page = parseInt(savedPage, 10);
      if (page > 0) {
        setPageNumber(page);
        setVisiblePage(page);
        setPageInputValue(String(page));
      }
    }
  }, [contentId]);

  // Save page to session
  useEffect(() => {
    sessionStorage.setItem(`pdfxpress-page-${contentId}`, String(pageNumber));
    setPageInputValue(String(pageNumber));
  }, [pageNumber, contentId]);

  // When pageNumber changes, mark it as pending (waiting for render)
  useEffect(() => {
    if (pageNumber !== visiblePage) {
      setPendingPage(pageNumber);
    }
  }, [pageNumber, visiblePage]);

  // When the pending page finishes rendering, swap it to visible
  const onPendingPageRendered = useCallback(() => {
    if (pendingPage !== null) {
      setVisiblePage(pendingPage);
      setPendingPage(null);
      // Scroll to top after swap
      if (viewportRef.current) {
        viewportRef.current.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }
    }
  }, [pendingPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in the page input
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          goToNextPage();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          goToPrevPage();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case '+':
        case '=':
          if (e.ctrlKey) { e.preventDefault(); zoomIn(); }
          break;
        case '-':
          if (e.ctrlKey) { e.preventDefault(); zoomOut(); }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [numPages, pageNumber]);

  // Touch swipe navigation
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let touchStartX = 0;
    let touchStartY = 0;

    const onTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;

      // Only handle horizontal swipes that are larger than vertical
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          goToNextPage(); // Swipe left = next page
        } else {
          goToPrevPage(); // Swipe right = prev page
        }
      }
    };

    viewport.addEventListener('touchstart', onTouchStart, { passive: true });
    viewport.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      viewport.removeEventListener('touchstart', onTouchStart);
      viewport.removeEventListener('touchend', onTouchEnd);
    };
  }, [numPages, pageNumber]);

  function onDocumentLoadSuccess({ numPages: total }: { numPages: number }) {
    setNumPages(total);
    setIsLoading(false);
  }

  function onDocumentLoadError(err: Error) {
    setError('PDF load करने में error हुआ। कृपया दोबारा try करें।');
    setIsLoading(false);
  }

  const goToNextPage = useCallback(() => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
  }, [numPages]);

  const goToPrevPage = useCallback(() => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  }, []);

  function goToPage(page: number) {
    const p = Math.max(1, Math.min(page, numPages));
    setPageNumber(p);
  }

  function handlePageInput(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const page = parseInt(pageInputValue, 10);
      if (!isNaN(page)) goToPage(page);
    }
  }

  function zoomIn() {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  }

  function zoomOut() {
    setScale(prev => Math.max(prev - 0.2, 0.4));
  }

  function fitToScreen() {
    setScale(1.0);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }

  // Determine which pages to render:
  // Always render visiblePage. If there's a pendingPage, also render it offscreen.
  const pagesToRender: number[] = [visiblePage];
  if (pendingPage !== null && pendingPage !== visiblePage) {
    pagesToRender.push(pendingPage);
  }

  return (
    <div className="reader-container" ref={containerRef} id="pdf-reader">
      {/* Toolbar */}
      <div className="reader-toolbar" id="reader-toolbar">
        <div className="reader-toolbar-group">
          <button className="reader-toolbar-btn" onClick={onClose} title="Close (Esc)" id="reader-close-btn">
            ✕
          </button>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {title}
          </span>
        </div>

        <div className="reader-toolbar-group">
          <button className="reader-toolbar-btn" onClick={goToPrevPage} disabled={pageNumber <= 1} title="Previous Page" id="reader-prev-btn">
            ◀
          </button>

          <div className="reader-page-info">
            <input
              className="reader-page-input"
              type="number"
              value={pageInputValue}
              onChange={(e) => setPageInputValue(e.target.value)}
              onKeyDown={handlePageInput}
              min={1}
              max={numPages}
              id="reader-page-input"
            />
            <span>/ {numPages || '...'}</span>
          </div>

          <button className="reader-toolbar-btn" onClick={goToNextPage} disabled={pageNumber >= numPages} title="Next Page" id="reader-next-btn">
            ▶
          </button>
        </div>

        <div className="reader-toolbar-group">
          <button className="reader-toolbar-btn" onClick={zoomOut} title="Zoom Out" id="reader-zoom-out">−</button>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', minWidth: '40px', textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </span>
          <button className="reader-toolbar-btn" onClick={zoomIn} title="Zoom In" id="reader-zoom-in">+</button>
          <button className="reader-toolbar-btn" onClick={fitToScreen} title="Fit to Screen" id="reader-fit">⊡</button>
          <button className="reader-toolbar-btn" onClick={toggleFullscreen} title="Fullscreen" id="reader-fullscreen">
            {isFullscreen ? '⊠' : '⛶'}
          </button>
        </div>
      </div>

      {/* Viewport */}
      <div className="reader-viewport" ref={viewportRef} id="reader-viewport">
        {error ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ fontSize: '3rem', opacity: 0.5 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h3 className="empty-state-title">Error</h3>
            <p className="empty-state-desc">{error}</p>
            <button className="btn btn-primary" onClick={onClose} style={{ marginTop: '1rem' }}>Close</button>
          </div>
        ) : (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '4rem' }}>
                <div className="spinner spinner-lg"></div>
                <p style={{ color: 'var(--color-text-muted)' }}>Loading PDF...</p>
              </div>
            }
          >
            <div style={{ position: 'relative', width: '100%', minHeight: '600px' }}>
              {pagesToRender.map((p) => {
                const isCurrent = p === visiblePage;
                const isPending = p === pendingPage;

                return (
                  <div
                    key={`page-slot-${p}`}
                    style={{
                      // Current visible page: show normally
                      // Pending page: render offscreen (hidden but in DOM)
                      position: isPending && !isCurrent ? 'absolute' : 'relative',
                      top: 0,
                      left: 0,
                      right: 0,
                      display: 'flex',
                      justifyContent: 'center',
                      // Pending page is invisible until it finishes rendering
                      visibility: isCurrent ? 'visible' : 'hidden',
                      zIndex: isCurrent ? 10 : 1,
                      // Ensure pending pages don't affect layout
                      pointerEvents: isCurrent ? 'auto' : 'none',
                    }}
                  >
                    <Page
                      pageNumber={p}
                      scale={scale}
                      className="reader-page"
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      loading={null}
                      // When the pending page finishes rendering, swap it in
                      onRenderSuccess={isPending && !isCurrent ? onPendingPageRendered : undefined}
                    />
                  </div>
                );
              })}
            </div>
          </Document>
        )}
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(10, 15, 28, 0.9)',
          zIndex: 10,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner spinner-lg" style={{ margin: '0 auto 1rem' }}></div>
            <p style={{ color: 'var(--color-text-muted)' }}>Loading PDF...</p>
          </div>
        </div>
      )}
    </div>
  );
}
