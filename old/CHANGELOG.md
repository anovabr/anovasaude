# Changelog - Landing Page Updates

## Changes Made:

### 1. ✅ Removed Hero Section
- Deleted the large hero banner with "Avaliações Psicológicas com Interpretação Profissional"
- Now shows "Catálogo de Testes" immediately as first content

### 2. ✅ Extracted CSS to Separate File
- Created `/css/landing.css` with all landing page styles
- Removed inline `<style>` block from `index.html`
- Cleaner HTML structure, better performance, easier maintenance

### 3. 📁 New File Structure:
```
anovasaude/
├── index.html              (cleaner, links to landing.css)
├── css/
│   ├── landing.css         (NEW - landing page styles)
│   └── style.css           (existing - test pages styles)
```

## Benefits:

✅ **Faster Load**: Browser can cache CSS separately
✅ **Cleaner Code**: HTML is much smaller and readable
✅ **Better UX**: Catalog shows immediately
✅ **Easier Updates**: Change styles in one place

## Testing:

1. Save all files
2. Refresh browser (Ctrl+F5 to clear cache)
3. Should see "Catálogo de Testes" at top
4. Styling should look identical

## Note:
If styles don't load, make sure:
- `css/landing.css` file exists
- File path is correct: `<link rel="stylesheet" href="css/landing.css">`
- Hard refresh with Ctrl+F5
