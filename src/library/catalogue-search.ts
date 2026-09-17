const API_BASE = 'https://library-database-system-nine.vercel.app'

const MAX_RENDERED_ITEMS = 200;

// typing delay to avoid excessive re-rendering while the user is typing
const DEBOUNCE_MS = 120;

// some author names are put as these formats in the db
const FORMATS = ['dvd', 'video', 'magazine', 'comics', 'bluray', 'dc: comics'];

type CatalogueRow = {
    title: string;
    series: string | null;
    series_num: string | null;
    author_name: string | null;
    isbn: string | null;
}

// raw row + precomputed lowercase search blob
type SearchableCatalogueRow = CatalogueRow & {
  _searchBlob: string;
};

let allItems: SearchableCatalogueRow[] = [];
let debounceHandle: ReturnType<typeof setTimeout> | null = null 

const searchInput = document.getElementById('catalogue-search-input') as HTMLInputElement | null;
const statusEl = document.getElementById('catalogue-status');
const resultsEl = document.getElementById('catalogue-results');

const HTML_ESCAPE_LOOKUP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPE_LOOKUP[char] ?? char);
}

function buildSearchBlob(item: CatalogueRow): string {
  return [item.title, item.author_name ?? '', item.series ?? '']
    .join(' ')
    .toLowerCase();
}

function renderItems(items: SearchableCatalogueRow[], totalMatchCount: number): void {
  if (!resultsEl) return;

  if (items.length === 0) {
    resultsEl.innerHTML = '<li class="catalogue-empty">No items match your search.</li>';
    return;
  }

  const visible = items.slice(0, MAX_RENDERED_ITEMS);  

  const rows = visible
    .map((item) => {
      const seriesPart =
        item.series != null
          ? ` — <em>${escapeHtml(item.series)}${item.series_num != null || item.series_num != '' ? ` #${item.series_num}` : ''}</em>`
          : '';
    
      // display names like "DVD" or "Video" without the "by" prefix
      const authorPart = item.author_name ? 
        (FORMATS.includes(item.author_name.toLocaleLowerCase()) ? ' —' : ' by ') + 
        `${escapeHtml(item.author_name)}` 
        : '';
      const isbnPart = item.isbn ? ` <span class="catalogue-isbn">ISBN: ${escapeHtml(item.isbn)}</span>` : '';

      return `<li class="catalogue-item">
        <span class="catalogue-title">${escapeHtml(item.title)}</span>${seriesPart}${authorPart}${isbnPart}
      </li>`;
    })
    .join('');

    const overflowNotice =
    totalMatchCount > MAX_RENDERED_ITEMS
      ? `<li class="catalogue-more-notice">Showing first ${MAX_RENDERED_ITEMS} of ${totalMatchCount} matches — refine your search to narrow results.</li>`
      : '';

    resultsEl.innerHTML = rows + overflowNotice;
}

function filterCatalogue(query: string): SearchableCatalogueRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return allItems;

  return allItems.filter((item) => item._searchBlob.includes(q));
}

function runFilterAndRender(query: string): void {
  const filtered = filterCatalogue(query);
  renderItems(filtered, filtered.length);

  if (statusEl) {
    statusEl.textContent =
      filtered.length > MAX_RENDERED_ITEMS
        ? `${filtered.length} items match (showing first ${MAX_RENDERED_ITEMS}).`
        : `${filtered.length} item${filtered.length === 1 ? '' : 's'} match.`;
  }
}

async function loadCatalogue(): Promise<void> {
  if (!statusEl) return;

  try {
    // A GET query with no input still needs the `?input=` param present
    // per tRPC's HTTP spec, so we pass an empty object.
    //TODO: try without this
    const response = await fetch(`${API_BASE}/api/catalogueList?input=${encodeURIComponent('{}')}`);

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const data = (await response.json()) as {result?: {data?: CatalogueRow[]}};

    const rawItems = data.result?.data ?? [];

    allItems = rawItems.map((item) => ({
      ...item,
      _searchBlob: buildSearchBlob(item),
    }));

    statusEl.textContent = `${allItems.length} item${allItems.length === 1 ? '' : 's'} in the catalogue.`;
    renderItems(allItems, allItems.length);
  } catch (err) {
    console.error('[catalogue-search] failed to load catalogue:', err);
    statusEl.textContent = 'Unable to load the catalogue right now. Please try again later.';
  }
}


searchInput?.addEventListener('input', () => {
  if (debounceHandle !== null) {
    clearTimeout(debounceHandle);
  }

  debounceHandle = setTimeout(() => {
    runFilterAndRender(searchInput.value);
  }, DEBOUNCE_MS);
});

void loadCatalogue();