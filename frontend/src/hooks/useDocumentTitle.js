import { useEffect } from 'react';

export const SITE_NAME = 'Northwind Park';

// Sets the tab title to "<page> · Northwind Park" (or just the site name).
export function useDocumentTitle(page) {
  useEffect(() => {
    document.title = page ? `${page} · ${SITE_NAME}` : SITE_NAME;
  }, [page]);
}
