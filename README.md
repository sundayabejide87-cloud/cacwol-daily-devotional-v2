# CACWOL Daily Devotional

Official source code for CACWOL Daily Devotional v2.0.

## Build for GoDaddy shared hosting

This is a React + Vite static website. It can be hosted on GoDaddy Linux/shared hosting with no Node.js server running after the build.

1. Open the repository's **Actions** tab and run or open **Build CACWOL Devotional for GoDaddy**.
2. In the successful workflow run, download the artifact named **cacwol-godaddy-site**. GitHub provides it as a ZIP archive.
3. Extract the ZIP on your computer or phone. Upload the *contents* of the extracted folder (including `index.html`, the `assets` folder, and `.htaccess`) into the website's document root, usually `public_html/`, using GoDaddy cPanel File Manager or FTP.
4. If replacing an existing website, back up the current document root first. Do not upload the source files or the `src` folder; upload the built files from the artifact.
5. Visit the domain over HTTPS and test the home page, devotional day navigation, search, bookmarks, and mobile layout.

The workflow artifact contains the production build. The `.htaccess` file provides an Apache fallback for app routes. Vite uses relative asset paths so the same build can work at a domain root and on GitHub Pages.

## Important content note

In `src/data/devotionalData.js`, days 1–10 are authored prototype entries; days 11–365 are generated placeholders pending the ministry team's editorial review. Review and complete the devotional content before announcing the app as a finished 365-day devotional.
