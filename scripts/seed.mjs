import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const res = spawnSync("npx", ["tsx", "scripts/seed-run.ts"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});
process.exit(res.status ?? 1);
