# Pearl Pets & Aquarium

A responsive, installable pet shop catalog that runs as a static website. It uses plain HTML, CSS, JavaScript and a JSON catalog, with no build step or backend.

## Preview locally

Because the page fetches `products.json` and registers a service worker, serve this folder over HTTP instead of opening `index.html` directly. For example, with PHP installed:

```sh
php -S localhost:8000
```

Then visit `http://localhost:8000`.

## Edit the catalog

Update `products.json` in the website's root folder (next to `index.html`). Each product has a unique `id`, display `title`, `category`, `description`, external `link`, and a unique `sectionId`. The `sectionId` is the product card's in-page anchor and the fragment used by its direct link, for example `https://your-name.github.io/your-repo/#aquarium-fish-food`. Each product card's **Copy QR link** button copies that complete product URL, ready to paste into a QR-code generator after publishing. A valid product QR link opens a focused view with only that product between the shared website header and footer. Ordinary visits without a product fragment still show the full catalog. Optional `emoji`, `color`, and `tag` fields control display. Use lowercase hyphenated IDs, keep section IDs unique, and use HTTPS links.

The shop logo is `assets/pearl-logo.png` and is used in the header and footer.

## Publish to GitHub Pages

Push the contents of this folder to a GitHub repository, then in **Settings → Pages**, select **Deploy from a branch**, choose the branch and `/ (root)` folder, and save. The site uses relative asset/data paths and works from a repository subpath. GitHub Pages serves it over HTTPS, which is required for service workers and PWA installation. The service worker caches the app shell and catalog for repeat/offline visits; bump `CACHE_NAME` in `service-worker.js` when shipping cache-worthy changes.

## Mobile app use

The manifest and service worker make the site installable on supported mobile browsers. The JSON file is served as a same-origin public asset, so another app can also read it at `products.json` relative to the deployed site URL. Product illustrations use emoji placeholders and can be replaced with real product photos as the catalog grows.
