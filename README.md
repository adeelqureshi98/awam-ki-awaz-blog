# Khari Baat — blog website

Static site, no build step. Open `index.html` or serve the folder.

## Add a new column (5 steps)
1. Copy `posts/governor-rule-fools-paradise.html` to `posts/<new-slug>.html`.
2. Replace title, date, meta description and both language bodies (Urdu inside `#col-ur`, English inside `#col-en`). Keep the language toggle buttons as-is.
3. Add a row for it in the "All Columns" list in `index.html` and point the "Latest Column" feature card at it.
4. Add a `<url>` entry in `sitemap.xml`.
5. Commit + push — GitHub Pages updates automatically.

## Notes
- Urdu text must stay real text (never images), `dir="rtl"`, Noto Nastaliq Urdu.
- Portrait: `assets/img/adeel-portrait.jpg` (drop-in replaceable with a larger photo, same filename).
