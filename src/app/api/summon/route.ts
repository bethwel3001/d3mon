import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN || undefined,
});

export function parseGitHubUrl(input: string): { owner: string; repo: string } | null {
  if (!input || typeof input !== "string") return null;
  const cleaned = input.trim().replace(/\.git$/, "");
  const match = cleaned.match(/(?:https?:\/\/)?(?:www\.)?(?:github\.com\/)?([^/\s]+)\/([^/\s#?]+)/);
  if (!match || !match[1] || !match[2]) return null;
  return { owner: match[1], repo: match[2].replace(/\/.*$/, "") };
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json().catch(() => ({}));
    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 });
    }

    const { owner, repo } = parsed;
    const [repoResponse, commitsResponse] = await Promise.all([
      octokit.rest.repos.get({ owner, repo }),
      octokit.rest.repos.listCommits({ owner, repo, per_page: 5 }),
    ]);

    const formattedCommits = commitsResponse.data.map((c) => ({
      sha: c.sha.substring(0, 7),
      message: c.commit.message.split("\n")[0] || "",
      author: c.commit.author?.name || "Unknown",
      date: c.commit.author?.date || "",
    }));

    return NextResponse.json({
      repoName: `${owner}/${repo}`,
      owner,
      repo,
      lastCommitDate: formattedCommits[0]?.date || repoResponse.data.pushed_at,
      commits: formattedCommits,
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to fetch GitHub commits" }, { status: 500 });
  }
}
