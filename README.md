# Study Tracker

A React + TypeScript + Vite app for keeping on top of assignments, deadlines, and to-dos across subjects. Originally exported from Figma Make.

## Running locally in VS Code

1. Install [Node.js](https://nodejs.org/) (v18 or newer) if you don't have it.
2. Open this folder in VS Code (`File → Open Folder…`).
3. When prompted, install the recommended extensions (ESLint, Prettier, Tailwind CSS IntelliSense). They're listed in `.vscode/extensions.json`.
4. Install dependencies:

   ```bash
   npm install
   ```

5. Start the dev server (hot-reloads as you edit):

   ```bash
   npm run dev
   ```

   Open the printed URL (default http://localhost:5173).

## Open it as a standalone file (no server)

Run the build once:

```bash
npm run build
```

This produces a single self-contained file at `dist/index.html` (all JS and CSS
inlined). Double-click that file — or drag it into any browser — to open the
fully working, interactive app without running a server. Re-run `npm run build`
whenever you change the code to refresh `dist/index.html`.

## Useful scripts

| Command            | What it does                                      |
| ------------------ | ------------------------------------------------- |
| `npm run dev`      | Start the Vite dev server with hot reload         |
| `npm run build`    | Build a single self-contained `dist/index.html`   |
| `npm run preview`  | Serve the production build locally                |
| `npm run typecheck`| Type-check the project with `tsc` (no output)     |

## Project layout

- `src/main.tsx` — app entry point
- `src/app/` — pages, components, and app logic
- `src/styles/` — Tailwind + theme CSS
- `vite.config.ts` — build config (path alias `@` → `src`)
- `tsconfig.json` — TypeScript config used by the editor and `npm run typecheck`
