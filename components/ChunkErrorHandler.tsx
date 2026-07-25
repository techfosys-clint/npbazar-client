'use client';

import { useEffect } from 'react';

// After a new deploy, the browser may still hold references to old chunk
// hashes that no longer exist on the server — navigating then throws
// ChunkLoadError and Next.js shows "This page couldn't load". A single
// reload fetches the current HTML/JS and clears the stale reference.
const RELOAD_KEY = 'chunk-reload-at';
const RELOAD_COOLDOWN_MS = 10_000;

function isChunkError(message: string) {
  return /loading chunk|failed to load chunk|chunkloaderror/i.test(message);
}

export default function ChunkErrorHandler() {
  useEffect(() => {
    const reloadOnce = () => {
      const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
      if (Date.now() - last < RELOAD_COOLDOWN_MS) return; // avoid a loop if it keeps failing
      sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
      window.location.reload();
    };

    const onError = (event: ErrorEvent) => {
      if (isChunkError(event.message || '') || event.error?.name === 'ChunkLoadError') reloadOnce();
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = typeof reason === 'string' ? reason : reason?.message || '';
      if (isChunkError(message) || reason?.name === 'ChunkLoadError') reloadOnce();
    };
    // Resource load failures (a <script>/<link> chunk that 404s or hits a
    // network error like ERR_QUIC_PROTOCOL_ERROR) don't bubble and never reach
    // `onError` above — they only fire in the capture phase.
    const onResourceError = (event: Event) => {
      const target = event.target as HTMLScriptElement | HTMLLinkElement | null;
      if (!target || (target.tagName !== 'SCRIPT' && target.tagName !== 'LINK')) return;
      const src = (target as HTMLScriptElement).src || (target as HTMLLinkElement).href || '';
      if (src.includes('/_next/static/')) reloadOnce();
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    window.addEventListener('error', onResourceError, true);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
      window.removeEventListener('error', onResourceError, true);
    };
  }, []);

  return null;
}
