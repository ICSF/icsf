interface NavLink {
  href: string;
  label: string;
}

class SiteNav extends HTMLElement {
  connectedCallback() {
    const path = window.location.pathname;
    const extraLinks = JSON.parse(this.getAttribute('extra-links') ?? '[]') as NavLink[];
    const submenuParent = this.getAttribute('submenu-parent') ?? '';

    const navItems = [
      {href: '', label: 'Home'},
      {href: 'events/', label: 'Events'},
      {href: 'library/', label: 'Library'},
      {href: 'committee/', label: 'Committee'},
      {href: 'publications/', label: 'Publications'},
      {href: 'picocon/', label: 'Picocon'},
      {href: 'quotes/', label: 'Quotes'},
      //{ href: 'gallery/', label: 'Gallery' },
      {href: 'history/', label: 'History'},
    ];

    this.innerHTML = `
      <nav>
        ${
        navItems
            .map(
                item => `
          ${this.link(item.href, item.label, path)}
          ${
                    item.href === submenuParent && extraLinks.length > 0 ?
                        extraLinks.map(l => this.sublink(l.href, l.label, path)).join('') :
                        ''}
        `).join('')}
      </nav>
    `;
  }

  private link(href: string, label: string, currentPath: string): string {
    // Add the BASE_URL from Vite env to every url
    const base = import.meta.env.BASE_URL;
    const fullHref = `${base}${href}`;
    const isActive = currentPath === fullHref;
    return `<a href="${fullHref}" ${isActive ? 'class="active"' : ''}>${label}</a>`;
  }

  private sublink(href: string, label: string, currentPath: string): string {
    const base = import.meta.env.BASE_URL;
    const fullHref = `${base}${href}`;
    const isActive = currentPath === fullHref;
    return `<a href="${fullHref}" class="subnav${isActive ? ' active' : ''}">${label}</a>`;
  }
}

customElements.define('site-nav', SiteNav);