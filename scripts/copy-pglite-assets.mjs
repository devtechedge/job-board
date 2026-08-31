import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const destDir = join(
  process.cwd(),
  ".vercel/output/functions/__server.func/_libs",
);
if (!existsSync(destDir)) process.exit(0);

const srcDir = join(process.cwd(), "node_modules/@electric-sql/pglite/dist");
mkdirSync(destDir, { recursive: true });
for (const file of ["pglite.data", "pglite.wasm", "initdb.wasm"]) {
  const src = join(srcDir, file);
  if (!existsSync(src)) continue;
  copyFileSync(src, join(destDir, file));
}
