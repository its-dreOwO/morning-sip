// NOTE: Unauthenticated GitHub API is limited to 60 requests/hour per IP.
// We cache responses for 10 minutes in localStorage to stay well under that.
// To raise the limit later, send an "Authorization: Bearer <token>" header.

export interface GitHubData {
  totalCommits: number;
  perDay: { day: string; commits: number }[];
}

const CACHE_KEY = "github.cache";
const TTL_MS = 10 * 60 * 1000;

export async function fetchGitHubActivity(user: string): Promise<GitHubData> {
  const cached = readCache(user);
  if (cached) return cached;

  const res = await fetch(`https://api.github.com/users/${user}/events/public?per_page=100`);
  if (res.status === 403) throw new Error("GitHub rate limit reached. Try again later.");
  if (!res.ok) throw new Error(`GitHub request failed: ${res.status}`);
  const events: any[] = await res.json();

  const days: { day: string; commits: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({ day: d.toLocaleDateString(undefined, { weekday: "short" }), commits: 0 });
  }
  let total = 0;
  for (const e of events) {
    if (e.type !== "PushEvent") continue;
    const created = new Date(e.created_at);
    const idx = days.findIndex(
      (_, i) => sameDay(created, daysAgo(6 - i))
    );
    const n = e.payload?.commits?.length ?? 0;
    if (idx >= 0) {
      days[idx].commits += n;
      total += n;
    }
  }
  const data: GitHubData = { totalCommits: total, perDay: days };
  writeCache(user, data);
  return data;
}

function daysAgo(n: number): Date { const d = new Date(); d.setDate(d.getDate() - n); return d; }
function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function readCache(user: string): GitHubData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { user: u, at, data } = JSON.parse(raw);
    if (u === user && Date.now() - at < TTL_MS) return data;
  } catch { /* ignore */ }
  return null;
}
function writeCache(user: string, data: GitHubData): void {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ user, at: Date.now(), data })); } catch { /* ignore */ }
}
