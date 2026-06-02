# Tech stack icons

**Edit icons here only:** `public/assets/tech/`

The app serves them at `/assets/tech/<filename>`. URL helpers live in `src/techAssets.ts`.

## Do not use `dist/assets/tech/`

`dist/` is Vite build output (gitignored). Files under `dist/assets/tech/` are copied from this folder on `npm run build`. Adding icons only under `dist/` will not work in `npm run dev` and may disappear on the next build.

## After adding or replacing an icon

1. Save the PNG or GIF in this folder.
2. Bump `VERSION` in `src/techAssets.ts` so browsers pick up the new file.

## Expected stack icons (examples)

- Core: `python.png`, `docker.png`, `kubernetes.png`, `aws.png`, `azure.png`
- Data: `postgresql.png`, `redis.png`, `mongodb.png`, `snowflake.png`, `dbt.png`
- Observability: `prometheus.png`, `grafana.png`
- Agents: `langchain.png`, `langgraph.png`, `claude.png`
- Pokeball animation: `ball open (closed).png`, `ball open (semi open).png`, `ball open (opened).png`

If a local file is missing, the UI falls back to a CDN icon defined in `src/techStackData.ts`.
