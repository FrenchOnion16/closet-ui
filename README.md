# Closet UI — Demo Login

This is a tiny vanilla HTML/CSS/JS login screen demo.

Files:
- `index.html` — markup
- `styles.css` — styling
- `script.js` — client-side behavior (demo credentials, validation, remember me)

Demo credentials:
- Email: user@example.com
- Password: password123

How to run locally:
Open `index.html` in your browser. For a simple local server (recommended) run:

```bash
# from project root
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

Notes:
- This is a client-side demo only. Do not use demo credentials in production.
- Accessibility: form uses labels, aria-live for error/result messages, and focus styles.
