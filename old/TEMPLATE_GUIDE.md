# Test Template Guide

This guide shows you how to add new psychological tests to the system.

## Two Test Formats Supported:

### Format 1: Beck-Style (BDI-PC style)
- Each question has its own 4 options (0-3)
- Options are different for each question
- Example: BDI-PC

### Format 2: Likert-Style (GAD-7 style)
- All questions share the same set of options
- Simpler format
- Example: GAD-7

---

## Adding a Beck-Style Test (Like BDI-PC)

### Step 1: Create JSON file in `data/`

**File: `data/new-test.json`**

```json
{
  "id": "new-test",
  "title": "Test Full Name",
  "description": "Brief description",
  "citation": "Validation info (optional)",
  "reference": "Full academic reference (optional)",
  "instructions": "Detailed instructions for the test taker...",
  "questions": [
    {
      "id": 1,
      "title": "Question Title/Topic",
      "options": [
        {
          "value": 0,
          "text": "First option statement"
        },
        {
          "value": 1,
          "text": "Second option statement"
        },
        {
          "value": 2,
          "text": "Third option statement"
        },
        {
          "value": 3,
          "text": "Fourth option statement"
        }
      ]
    },
    {
      "id": 2,
      "title": "Second Question Title",
      "options": [
        {
          "value": 0,
          "text": "..."
        }
      ]
    }
  ],
  "scoring": {
    "min": 0,
    "max": 21,
    "ranges": [
      {
        "min": 0,
        "max": 5,
        "level": "Low",
        "description": "Description of this score range"
      }
    ]
  }
}
```

### Step 2: Copy HTML file

```bash
# Copy the BDI-PC test page
cp teste-bdi-pc.html teste-new-test.html
```

### Step 3: Copy JS file

```bash
# Copy the BDI-PC JavaScript
cp js/tests/bdi-pc.js js/tests/new-test.js
```

### Step 4: Update JS file

In `js/tests/new-test.js`, change line 6:

```javascript
// Change this:
const response = await fetch('data/bdi-pc.json');

// To this:
const response = await fetch('data/new-test.json');
```

### Step 5: Update HTML file

In `teste-new-test.html`, change the script reference at the bottom:

```html
<!-- Change this: -->
<script src="js/tests/bdi-pc.js"></script>

<!-- To this: -->
<script src="js/tests/new-test.js"></script>
```

### Step 6: Add to landing page

In `index.html`, add a new test card:

```html
<div class="test-card" onclick="window.location.href='teste-new-test.html'">
    <span class="test-tag">Category</span>
    <h4>Test Full Name</h4>
    <p>Brief description here...</p>
    <div class="test-meta">
        <span>⏱️ 5-10 min</span>
        <span>📊 21 questões</span>
    </div>
</div>
```

---

## Adding a Likert-Style Test (Like GAD-7)

Same steps as above, but JSON format is simpler:

```json
{
  "id": "new-likert-test",
  "title": "Test Name",
  "instructions": "Instructions...",
  "questions": [
    {
      "id": 1,
      "text": "Simple question text"
    },
    {
      "id": 2,
      "text": "Another question"
    }
  ],
  "options": [
    {
      "value": 0,
      "label": "Never"
    },
    {
      "value": 1,
      "label": "Sometimes"
    },
    {
      "value": 2,
      "label": "Often"
    },
    {
      "value": 3,
      "label": "Always"
    }
  ],
  "scoring": {
    "min": 0,
    "max": 21,
    "ranges": [...]
  }
}
```

Then copy `teste-gad7.html` and `js/tests/gad7.js` instead.

---

## Quick Checklist

- [ ] Create JSON file in `data/`
- [ ] Copy HTML file (BDI-PC or GAD-7 style)
- [ ] Copy JS file
- [ ] Update fetch URL in JS
- [ ] Update script src in HTML
- [ ] Add card to index.html
- [ ] Test locally
- [ ] Deploy

---

## JSON Field Reference

### Required Fields:
- `id` - Unique identifier (lowercase, no spaces)
- `title` - Full test name
- `instructions` - What the user reads before starting
- `questions` - Array of question objects
- `scoring` - Score ranges and interpretations

### Optional Fields:
- `description` - Short description
- `citation` - Validation/authorship info
- `reference` - Full academic citation

### Question Object (Beck-style):
```json
{
  "id": 1,
  "title": "Topic/Question",
  "options": [
    { "value": 0, "text": "Statement" }
  ]
}
```

### Question Object (Likert-style):
```json
{
  "id": 1,
  "text": "Question text"
}
```

---

## Tips

1. **Test IDs**: Use lowercase with hyphens: `bdi-pc`, `gad7`, `phq9`
2. **Scoring Ranges**: Make sure ranges cover all possible scores
3. **Max Score**: Should equal `(number of questions) × (highest option value)`
4. **Citation**: Include if test is validated/published
5. **Always test locally** before deploying

---

## Example: Adding PHQ-9

1. Create `data/phq9.json` with 9 questions
2. Copy `teste-gad7.html` → `teste-phq9.html`
3. Copy `js/tests/gad7.js` → `js/tests/phq9.js`
4. In `phq9.js`: Change to `fetch('data/phq9.json')`
5. In `teste-phq9.html`: Change script to `js/tests/phq9.js`
6. Add card to `index.html`
7. Done!

Total time: ~5-10 minutes per test
