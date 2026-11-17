# [Company Name] — Electronics Website

A clean, modern, responsive website for an electronics sales and maintenance company.
Built with plain HTML, CSS, JavaScript, and a lightweight Node.js/Express server.

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or later

### Install and run

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start
```

The server starts on **http://localhost:3000** by default.

To use a different port, create a `.env` file (see below) and add `PORT=8080`.

---

## File Structure

```
project-root/
│
├── index.html          Home page
├── about.html          About the company
├── services.html       Repair & maintenance services
├── products.html       Product catalogue (filterable)
├── exchange.html       Old-for-new exchange programme
├── contact.html        Contact details & message form
│
├── css/
│   └── styles.css      All styles (design tokens, layout, components, responsive)
│
├── js/
│   └── main.js         Navigation, scroll animations, form handling, product filter
│
├── images/             Place your product/team photos here
│
├── server.js           Express dev server + contact form API endpoint
├── package.json        Dependencies and npm scripts
└── README.md           This file
```

---

## Replacing Placeholders

Search the project for each placeholder and replace it with real content:

| Placeholder           | Replace with                                      |
|-----------------------|---------------------------------------------------|
| `[Company Name]`      | Your actual company name                          |
| `[Phone Number]`      | Your phone number (also update `href="tel:..."`)  |
| `[WhatsApp Number]`   | Your WhatsApp number (digits only, e.g. 263771234567) |
| `[Email Address]`     | Your email (also update `href="mailto:..."`)      |
| `[Address]`           | Your physical address                             |
| `[Business Hours]`    | E.g. "Mon–Fri 8am–5pm, Sat 8am–1pm"              |
| `[Social Media Links]`| Your Facebook/Instagram/etc. URLs                 |
| `[YOUR_WEBSITE_URL]`  | Your live URL (in `<head>` OG tags)               |
| `[YOUR_OG_IMAGE_URL]` | URL to a social sharing preview image             |

Run a find-and-replace across all `.html` files in your editor to catch every instance.

---

## Adding Images

Place image files in the `images/` folder, then replace the placeholder `<div class="img-placeholder">` blocks in the HTML with real `<img>` tags:

```html
<!-- Before (placeholder) -->
<div class="img-placeholder">
  <svg>…</svg>
  <span>Replace with a team or shop image</span>
</div>

<!-- After (real image) -->
<img src="images/your-photo.jpg" alt="Descriptive alt text" />
```

Always provide meaningful `alt` text for accessibility.

---

## Contact Form

### Demo mode (default)

Out of the box the form works in demo mode — submissions are logged to the server console but no email is sent. A polite message is shown to the visitor directing them to use the phone/email links.

### Live email mode

1. Create a `.env` file in the project root (it is already in `.gitignore`):

```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-char-app-password
EMAIL_TO=receiving-email@example.com
PORT=3000
```

2. For Gmail, generate an **App Password** (requires 2FA):
   Settings → Security → 2-Step Verification → App passwords.

3. For other providers, change the `service` in `server.js`:
   ```js
   service: 'hotmail',  // or 'yahoo', 'SendGrid', etc.
   ```

Restart the server after editing `.env`.

---

## Embedding a Map

On `contact.html`, replace the map placeholder `<div>` with an embedded Google Maps iframe:

```html
<iframe
  src="https://www.google.com/maps/embed?pb=YOUR_EMBED_PARAMS"
  width="100%"
  height="300"
  style="border:0;border-radius:12px;"
  allowfullscreen=""
  loading="lazy"
  referrerpolicy="no-referrer-when-downgrade"
  title="[Company Name] location map"
></iframe>
```

Get the embed code from Google Maps → Share → Embed a map.

---

## Customising the Design

All colours, spacing, typography, and shadows are CSS custom properties in the `:root` block at the top of `css/styles.css`. Change them there to reskin the entire site:

```css
:root {
  --clr-primary:       #1a3a5c;   /* Main navy blue */
  --clr-accent:        #f0a500;   /* Amber / gold highlights */
  /* … */
}
```

---

## Accessibility Notes

- Semantic HTML (`<header>`, `<main>`, `<nav>`, `<article>`, `<aside>`, `<footer>`)
- All interactive elements are keyboard-navigable with visible `:focus-visible` outlines
- Images require meaningful `alt` text (placeholders use `aria-hidden`)
- Form fields have `<label>` associations and `aria-describedby` for errors
- Animations respect `prefers-reduced-motion`
- Color contrast meets WCAG AA for text on backgrounds (verify with a contrast checker after updating brand colors)

---

## Production Checklist

Before going live:

- [ ] Replace all `[Placeholder]` values
- [ ] Add real product images with alt text
- [ ] Add team photos and bios on About page
- [ ] Configure `.env` for email (or note that form is demo-only)
- [ ] Embed a Google Map on the Contact page
- [ ] Update `og:image` and `og:url` in all `<head>` sections
- [ ] Add a `favicon.ico` (place in project root)
- [ ] Test on mobile, tablet, and desktop
- [ ] Run a contrast checker on brand colors
- [ ] Verify all links work (no `href="#"` remaining)
