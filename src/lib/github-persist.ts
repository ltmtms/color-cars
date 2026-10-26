import type { CarRecord, CarsIndex } from "./types";

const REPO = process.env.GITHUB_REPOSITORY ?? "ltmtms/color-cars";
const BRANCH = process.env.GITHUB_BRANCH ?? "main";

function token() {
  return process.env.GITHUB_TOKEN;
}

export function githubPersistEnabled() {
  return Boolean(token() && process.env.VERCEL);
}

async function ghApi(path: string, init?: RequestInit) {
  const t = token();
  if (!t) throw new Error("GITHUB_TOKEN required");
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${t}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text}`);
  }
  return res.json();
}

export async function githubReadIndex(): Promise<CarsIndex | null> {
  if (!githubPersistEnabled()) return null;
  const [owner, repo] = REPO.split("/");
  try {
    const data = await ghApi(
      `/repos/${owner}/${repo}/contents/data/cars.json?ref=${BRANCH}`
    );
    const content = Buffer.from(data.content, "base64").toString("utf-8");
    return JSON.parse(content) as CarsIndex;
  } catch {
    return null;
  }
}

export async function githubWriteIndex(index: CarsIndex) {
  const [owner, repo] = REPO.split("/");
  let sha: string | undefined;
  try {
    const existing = await ghApi(
      `/repos/${owner}/${repo}/contents/data/cars.json?ref=${BRANCH}`
    );
    sha = existing.sha;
  } catch {
    /* new file */
  }
  const body = JSON.stringify(index, null, 2);
  await ghApi(`/repos/${owner}/${repo}/contents/data/cars.json`, {
    method: "PUT",
    body: JSON.stringify({
      message: `chore: update cars index`,
      content: Buffer.from(body).toString("base64"),
      branch: BRANCH,
      sha,
    }),
  });
}

export async function githubWriteImage(
  filename: string,
  png: Buffer
): Promise<void> {
  const [owner, repo] = REPO.split("/");
  const path = `data/images/${filename}`;
  let sha: string | undefined;
  try {
    const existing = await ghApi(
      `/repos/${owner}/${repo}/contents/${path}?ref=${BRANCH}`
    );
    sha = existing.sha;
  } catch {
    /* new */
  }
  await ghApi(`/repos/${owner}/${repo}/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({
      message: `feat: add scanned car ${filename}`,
      content: png.toString("base64"),
      branch: BRANCH,
      sha,
    }),
  });
}

export async function githubReadImage(record: CarRecord): Promise<Buffer | null> {
  if (!githubPersistEnabled()) return null;
  const [owner, repo] = REPO.split("/");
  const path = `data/images/${record.filename}`;
  try {
    const data = await ghApi(
      `/repos/${owner}/${repo}/contents/${path}?ref=${BRANCH}`
    );
    return Buffer.from(data.content, "base64");
  } catch {
    return null;
  }
}
