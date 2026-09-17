const API_BASE = 'https://library-database-system-nine.vercel.app'

type CatalogueRow = {
    title: string;
    series: string | null;
    series_num: string | null;
    author_name: string | null;
    isbn: string | null;
}

let allItems: CatalogueRow[] = [];

const searchInput = document.getElementById('catalogue-search-input') as HTMLInputElement | null;
const statusEl = document.getElementById('catalogue-status');
const resultsEl = document.getElementById('catalogue-results');


function escapeHtml(value: string): string {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

function renderItems(items: CatalogueRow[]): void {
  if (!resultsEl) return;

  if (items.length === 0) {
    resultsEl.innerHTML = '<li class="catalogue-empty">No items match your search.</li>';
    return;
  }

  resultsEl.innerHTML = items
    .map((item) => {
      const seriesPart =
        item.series != null
          ? ` — <em>${escapeHtml(item.series)}${item.series_num != null ? ` #${item.series_num}` : ''}</em>`
          : '';
      const authorPart = item.author_name ? ` by ${escapeHtml(item.author_name)}` : '';
      const isbnPart = item.isbn ? ` <span class="catalogue-isbn">ISBN: ${escapeHtml(item.isbn)}</span>` : '';

      return `<li class="catalogue-item">
        <span class="catalogue-title">${escapeHtml(item.title)}</span>${seriesPart}${authorPart}${isbnPart}
      </li>`;
    })
    .join('');
}

function filterCatalogue(query: string): CatalogueRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return allItems;

  return allItems.filter((item) => {
    return (
      item.title.toLowerCase().includes(q) ||
      (item.author_name?.toLowerCase().includes(q) ?? false) ||
      (item.series?.toLowerCase().includes(q) ?? false)
    );
  });
}

async function loadCatalogue(): Promise<void> {
  if (!statusEl) return;

  try {
    // A GET query with no input still needs the `?input=` param present
    // per tRPC's HTTP spec, so we pass an empty object.
    const response = await fetch(`${API_BASE}/api/catalogueList?input=${encodeURIComponent('{}')}`);

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const data = (await response.json()) as {result?: {data?: CatalogueRow[]}};

    allItems = data.result?.data ?? [];

    statusEl.textContent = `${allItems.length} item${allItems.length === 1 ? '' : 's'} in the catalogue.`;
    renderItems(allItems);
  } catch (err) {
    console.error('[catalogue-search] failed to load catalogue:', err);
    statusEl.textContent = 'Unable to load the catalogue right now. Please try again later.';
  }
}


searchInput?.addEventListener('input', () => {
  const filtered = filterCatalogue(searchInput.value);
  renderItems(filtered);

  if (statusEl) {
    statusEl.textContent = `${filtered.length} item${filtered.length === 1 ? '' : 's'} match.`;
  }
});

void loadCatalogue();