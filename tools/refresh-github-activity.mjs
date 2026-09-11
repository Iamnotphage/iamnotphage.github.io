import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const username = "Iamnotphage";
const source = `https://github.com/users/${username}/contributions`;
const output = new URL("../data/github-activity.json", import.meta.url);
const DAY_MS = 86_400_000;

function attributes(markup) {
  return Object.fromEntries(
    [...markup.matchAll(/([\w-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]),
  );
}

export function parseContributions(html) {
  const tooltips = new Map(
    [...html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g)].map(
      (match) => [attributes(match[1]).for, match[2].replace(/<[^>]+>/g, "").trim()],
    ),
  );

  const days = [...html.matchAll(/<td\b([^>]*)>/g)].flatMap((match) => {
    const attrs = attributes(match[1]);
    if (!attrs["data-date"]) return [];

    const date = attrs["data-date"];
    const level = Number(attrs["data-level"]);
    const label = tooltips.get(attrs.id);
    const countMatch = label?.match(/^(No|[\d,]+) contributions? on /);
    const count = countMatch?.[1] === "No" ? 0 : Number(countMatch?.[1].replaceAll(",", ""));
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(Date.parse(`${date}T00:00:00Z`)) ||
      attrs["data-level"] === undefined ||
      !Number.isInteger(level) || level < 0 || level > 4 ||
      !countMatch || !Number.isInteger(count) || count < 0
    ) {
      throw new Error(`Invalid contribution data for ${date}`);
    }
    return [{ date, count, level }];
  }).sort((a, b) => a.date.localeCompare(b.date));

  if (days.length < 350 || days.length > 371) {
    throw new Error("Expected a full year of contribution data");
  }
  for (let i = 1; i < days.length; i++) {
    if (Date.parse(days[i].date) - Date.parse(days[i - 1].date) !== DAY_MS) {
      throw new Error("Contribution dates must be unique and consecutive");
    }
  }
  const total = days.reduce((sum, day) => sum + day.count, 0);
  const heading = html.match(/<h2\b[^>]*id="js-contribution-activity-description"[^>]*>([\s\S]*?)<\/h2>/);
  const reportedTotal = heading?.[1].match(/([\d,]+)\s+contributions?\b/);
  if (!reportedTotal || Number(reportedTotal[1].replaceAll(",", "")) !== total) {
    throw new Error("Daily contribution counts do not match GitHub's total");
  }
  return { username, source, total, days };
}

async function refresh() {
  try {
    const response = await fetch(source, {
      headers: { Accept: "text/html", "Accept-Language": "en-US", "User-Agent": "Neuromancer-Portfolio" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`GitHub returned HTTP ${response.status}`);
    const snapshot = { ...parseContributions(await response.text()), updatedAt: new Date().toISOString() };
    await mkdir(new URL("../data/", import.meta.url), { recursive: true });
    const temporaryOutput = new URL(`${output.href}.tmp`);
    await writeFile(temporaryOutput, `${JSON.stringify(snapshot, null, 2)}\n`);
    await rename(temporaryOutput, output);
    console.log(`GitHub Activity: ${snapshot.total} contributions across ${snapshot.days.length} days.`);
  } catch (error) {
    const cached = await readFile(output, "utf8").then(JSON.parse).catch(() => null);
    if (!cached?.days?.length) throw error;
    console.warn(`GitHub Activity: using the saved snapshot (${cached.updatedAt}). ${error.message}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await refresh();
}
