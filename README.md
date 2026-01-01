# master-academicsupervision — Root Overview

This repository contains two frontend projects managed as npm workspaces.

## Projects

- **SCHOOL-TIME-TABLE-MANAGEMENT-b** — "edusched school timetable system"
  - Path: `SCHOOL-TIME-TABLE-MANAGEMENT-b/`
  - Dev: `npm run dev:schedule`
  - Build: `npm run build:schedule`
  - Preview: `npm run preview:schedule`

- **academic-assessment-b** — "edutrack academic assessment monitor"
  - Path: `academic-assessment-b/`
  - Dev: `npm run dev:assessment`
  - Build: `npm run build:assessment`
  - Preview: `npm run preview:assessment`

## Useful commands

- Install all dependencies (root + workspaces):

```bash
npm install
```

- Run either dev server:

```bash
npm run dev:schedule
npm run dev:assessment
```

- Run both dev servers in parallel (requires root dev deps installed):

```bash
npm run dev:all
```

- Build both projects:

```bash
npm run build:all
```

## Notes

- This repo uses npm workspaces; if you don't have npm v7+ please upgrade.
- If you prefer not to add `concurrently`, remove the `dev:all` script and run the dev scripts in separate terminals.

---

If you'd like, I can also:
- Add a `.vscode/tasks.json` to run each dev server from the editor.
- Add CI steps to install and build workspaces.
