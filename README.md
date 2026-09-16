# ICSF Website
A society information page for Imperial Sci-fi Fantasy Society. This is an updated version of the website at https://github.com/ICSF/icsf-website, so you may find additional resources and code in this repo if needed (e.g. an archive of old meeting minutes, and other website history).

## Prerequisites
- Node.js 20.19 or higher ([download](https://nodejs.org))
- Run `node --version` to check your current version

## Getting Started
- Run `npm install` after cloning the repo. 
- To run the website: 
  - `npm run build`. This builds the website
  - `npm run dev`. This will start a development server 
  at http://localhost:5173.

## Project Structure
### Source Code
- The project is structured in a feature-first pattern within the `src/`directory. This means that each page has its own folder in `src/`, in which are all relevant HTML/TypeScript files for that page.
- The homepage layout is at `src/index.html`, and the sitemap is at `src/sitemap.html`.
- There are also web components, including the header, footer, and navigation bar, which are reused on every page. These are located in `src/components`
- CSS styles are in `src/styles`

### Assets and Resources
- All assets are in the public/ directory, as configured in the `publicDir` parameter in the Vite config (`vite.config.ts`) 

## Building the Website
The website is built by running `npm run build`

### Step 1: src/build.ts
This script runs firsts, generating the `gallery` page, and the `publications` page, as these HTML pages are easier to automate than to write by hand.
- Gallery (`src/gallery/gallery.ts`): scans `public/gallery/` for album folders, uses the first image in each album as a thumbnail, and writes `src/gallery/index.html` to display the page. It also generates a `photos.json` inside each album folder, listing all of the photos in an album, which the album page fetches at runtime. This page has been disabled for safeguarding reasons. To re-enable, move the `gallery/` directory into the `public/` directory, uncomment `buildGallery()` in build.ts, and rename `src/gallery/album/album.html`
- Publications (`src/publications/publications.ts`): scans `public/publications/` for PDFs, parses the filename to extract the date, title and editor, and writes `src/publications/index.html` to display the page.
- History (`src/history/history.ts`): looks at `src/history/events.json`, generates HTML for each event, and writes `src/history/index.html`. 

### Step 2: Vite
- Vite then compiles everything in `src/` into `dist/`. This is where the completely built website lives.

## Configuration
### Deployment URL 
- The base URL for the site is defined in vite.config.ts in the `base` parameter. It sets two different base URLs
  depending on whether the project was run with `npm run build` or `npm run dev`. It specifies the base from which
  all relative URLs are calculated. For asset sources in HTML pages (e.g. `<img src=...>`, Vite automatically calulates from this 
  set base URL. When adding your own links in HTML (e.g. with `<a href..>`), use `%BASE_URL%` for relative links. In TypeScript sections,
  such as in the web components, use `import.meta.env.BASE_URL` to get the base url (this will only work during the Vite
  build step, as it gets a Vite environment variable.)
- The rest of the configuration can be found in `tsconfig.json` (for TypeScript configuration) and `vite.config.ts` (for Vite build configuration).


## Adding Content
### Add a Fanzine/Publication
- Name the file following this template: YYYY-MM_title_First-Last.pdf, where 'First' and 'Last' are the first and last names of the editor of the fanzine,
  anad 'title' is either the title of the fanzine, or 'Wyrm' if it is a Wyrmtongue issue.
- Drop it into the folder `public/publications/` and rebuild the website.

### Add New Album in Gallery
- Simply drop a folder into `public/gallery/` and rebuild the website.

### Add a New Timeline Event in History 
- Add a new row to the file `src/history/events.json`, including:
  - the date of the event (MM/YYYY - use MM = 01 if month is unknown)
  - the title of the event
  - an optional link to the event.

### Add a Picocon Page in The History Book
- Take the HTML from the Picocon page, and copy it into `src/history/picocon/picocon(num).html`. Put any assets in a folder `src/history/picocon(num)/` and change the HTML to deal with links properly.
- Copy the styles from the previous Picocon pages:
  - Add a link to `/styles/history.css` in the \<head> section
  - Put the page content into a \<div id="blue-book">
  - Add a 'previous' link to the previous Picocon page 
  - Update the 'next' links in the previous Picocon page 
- Update `src/history/picocon/index.html` to include the link to this Picocon page.

### Add a New Page
- Create a folder in `src/` with the page title, and add an `index.html`.
- Reuse the web components from `src/components/` for the site header, site footer, and navigation bar. This can be done by including them as scripts in the `<head>` section of the HTML, and then simply using them as tags like so: `<site-footer></site-footer>`. See any existing page's `index.html` for examples.
- If the page requires dynamic processing, like the `gallery` page, add a new step to `src/build.ts` to generate HTML in an automated fashion.

## Deployment
- Run `npm run build` and deploy the `dist/` folder.
- The website currently deploys to GitHub Pages through a CI/CD pipeline, 
where the website is built using `npm run build`, the `dist/` folder is uploaded as an artifact, and then deployed to Pages.
