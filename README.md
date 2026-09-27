# AI learning experience studio

A simple [Next.js](https://nextjs.org) site that hosts interactive learning
exercises. Each exercise lives at its own address (`/<slug>`) so it can be
embedded on its own in a Canvas course via an `<iframe>`. The home page is a
menu of every exercise.

This project is written in **JavaScript** (never TypeScript) and styles
everything with **Tailwind CSS** utility classes used inline, so that each
exercise component matches the format used in the institutional system and can
be migrated across with little or no change.

## Running locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Other scripts:

- `npm run build` – production build
- `npm run start` – serve the production build
- `npm run lint` – run ESLint

## How it is organised

```
app/
  layout.js            Root layout (minimal, no site-wide chrome)
  globals.css          Tailwind import + full-height document
  page.js              Home page menu (reads the exercise list)
  history-of-ai/
    page.js            Server wrapper: sets the page title/metadata
    exercise.js        The exercise itself ("use client" component)
  knowledge-check/
    page.js
    exercise.js
lib/
  exercises.js         The list of exercises the menu is built from
```

Each exercise is split into two files:

- **`exercise.js`** is the self-contained exercise component. It starts with
  `"use client";` and has a default export. This is the file you paste an
  exercise into, and the file you would migrate to the institutional system.
- **`page.js`** is a tiny server component that sets the page title and renders
  the exercise. Titles live here because Next.js only lets server components
  export `metadata`, which keeps `exercise.js` clean.

## Adding a new exercise

1. Pick a URL-friendly slug, e.g. `prompt-engineering`.
2. Create `app/prompt-engineering/exercise.js` and paste in your exercise
   component (a `"use client"` React component with a default export).
3. Create `app/prompt-engineering/page.js` by copying an existing wrapper and
   changing the slug passed to `getExercise`.
4. Add an entry to `lib/exercises.js` with the same `slug`, a `title` and a
   `description`. The home page updates automatically.

## Conventions for exercises

Exercises follow the house style so they migrate cleanly:

- Start every exercise file with `"use client";` (double quotes).
- JavaScript only, never TypeScript.
- Style with Tailwind utility classes inline. No shadcn components; other
  imports such as `lucide-react` icons are fine.
- Use `min-h-full`, never `min-h-screen`.
- Use single-column layouts (`grid grid-cols-1`) unless a two-column layout is
  specifically wanted.
- No external assets (images, audio). Use a plain grey box of sensible
  dimensions as a placeholder instead. No `api/` style paths.
- Meet WCAG AA: works on mobile and desktop, sufficient colour contrast, fully
  keyboard navigable and usable with a screen reader.
- User-facing text uses British English spellings (`-ise`, `colour`), sentence
  case, single quote marks and no serial (Oxford) commas.

## Embedding in Canvas

Deploy the site (for example to Vercel or Netlify) and embed an exercise with an
iframe pointing at its slug, for example:

```html
<iframe
  src="https://your-deployment.example.com/history-of-ai"
  title="History of AI"
  width="100%"
  height="800"
  style="border: 0;"
></iframe>
```

The app sends a `Content-Security-Policy: frame-ancestors *` header (see
`next.config.mjs`) so pages can be framed. You can tighten this to your
institution's Canvas domain(s) once known.

### Auto-resizing the iframe to fit the content

A cross-origin iframe never grows to fit its content, so a fixed height is
either too tall (empty space) or too short (the content scrolls inside the
iframe). This is awkward for exercises whose height changes — for example a poll
that reveals a long block of feedback after the student submits.

Every page reports its true content height to the parent window via
`postMessage` (see `app/iframe-auto-height.js`). To make the iframe resize to
match, the **embedding page needs a small one-time listener**. In Canvas this
goes in the global theme JavaScript (Admin → Themes → your theme → Upload →
Custom JavaScript), so it applies to every embedded exercise:

```js
// Resize embedded learning-experience iframes to fit their content.
window.addEventListener("message", function (event) {
  var data = event.data;
  if (!data || data.type !== "ai-studio:resize") return;
  var iframes = document.getElementsByTagName("iframe");
  for (var i = 0; i < iframes.length; i++) {
    if (iframes[i].contentWindow === event.source) {
      iframes[i].style.height = data.height + "px";
      iframes[i].style.minHeight = "0";
    }
  }
});
```

With that in place, embed the iframe with a small starting height (a placeholder
until the first resize message arrives) and no fixed height:

```html
<iframe
  src="https://your-deployment.example.com/bpes-income-and-demand"
  title="Income and demand"
  style="display: block; width: 100%; min-height: 300px; border: 0;"
  loading="lazy"
></iframe>
```

The listener matches messages to the iframe by `contentWindow`, so it only
resizes our own exercises and ignores messages from anything else. If the
listener is not present the exercises still work — the iframe just keeps
whatever height you set, as before.
