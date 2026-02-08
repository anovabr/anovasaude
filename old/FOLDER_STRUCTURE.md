# Updated Folder Structure

## ✅ New Organization

```
anovasaude/
├── index.html              # Landing page
├── resultado.html          # Results page
├── logo.png               # Your logo
│
├── tests/                 # 🆕 All test pages here
│   ├── teste-bdi-pc.html
│   └── teste-gad7.html
│
├── css/
│   ├── landing.css        # Landing page styles
│   └── style.css          # Test pages styles
│
├── js/
│   ├── storage.js         # LocalStorage utilities
│   ├── scoring.js         # Scoring algorithms
│   └── tests/
│       ├── bdi-pc.js      # BDI-PC logic
│       └── gad7.js        # GAD-7 logic
│
└── data/
    ├── bdi-pc.json        # BDI-PC questions
    └── gad7.json          # GAD-7 questions
```

## What Changed

### Before:
```
anovasaude/
├── index.html
├── teste-bdi-pc.html      ❌ Root folder
├── teste-gad7.html        ❌ Root folder
├── resultado.html
```

### After:
```
anovasaude/
├── index.html
├── resultado.html
├── tests/                 ✅ Organized!
│   ├── teste-bdi-pc.html
│   └── teste-gad7.html
```

## Path Updates

All paths were updated automatically:

### In test HTML files (`tests/teste-*.html`):
- CSS: `css/style.css` → `../css/style.css`
- Logo: `logo.png` → `../logo.png`
- Scripts: `js/xxx.js` → `../js/xxx.js`
- Links: `index.html` → `../index.html`

### In test JS files (`js/tests/*.js`):
- JSON: `data/xxx.json` → `../data/xxx.json`
- Redirect: `resultado.html` → `../resultado.html`

### In index.html:
- Links: `teste-bdi-pc.html` → `tests/teste-bdi-pc.html`

## Benefits

✅ **Cleaner root** - Only main pages in root
✅ **Scalable** - Easy to add 10+ tests without cluttering
✅ **Organized** - Tests grouped together
✅ **Professional** - Better project structure

## Testing

1. Click a test from landing page → Should load test
2. Complete test → Should show results
3. All links should work

If you see blank pages, check browser console (F12) for path errors.
