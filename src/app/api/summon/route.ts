import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "octokit";

// Initialize Octokit (uses optional GITHUB_TOKEN if available, otherwise unauthenticated)
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN || undefined,
});

/**
 * Extracts owner and repository name from various GitHub URL formats
 */
export function parseGitHubUrl(input: string): { owner: string; repo: string } | null {
  if (!input || typeof input !== "string") return null;
  const cleaned = input.trim().replace(/\.git$/, "");
  const match = cleaned.match(/(?:https?:\/\/)?(?:www\.)?(?:github\.com\/)?([^/\s]+)\/([^/\s#?]+)/);

  if (!match || !match[1] || !match[2]) return null;
  return {
    owner: match[1],
    repo: match[2].replace(/\/.*$/, ""),
  };
}

/**
 * Constructs the prompt for an open-weight model (e.g. Gemma 2)
 */
export function constructGemmaPrompt(
  commits: { message: string; date?: string; author?: string }[]
): string {
  const commitList = commits
    .map((c, i) => `${i + 1}. "${c.message.trim()}" (${c.date ? new Date(c.date).toISOString().split("T")[0] : "undated"})`)
    .join("\n");

  return `You are the ghost of an abandoned GitHub repository. Look at these last commits:\n${commitList}\n\nWrite a short, poetic, 3-sentence lament about why your creator abandoned you and how cold the servers are.`;
}

/**
 * Invokes an LLM endpoint (local Ollama Gemma 2, Groq, Together, or fallback)
 */
async function fetchGhostLament(prompt: string): Promise<string> {
  const endpoint = process.env.LLM_ENDPOINT || "http://localhost:11434/api/generate";
  const model = process.env.LLM_MODEL || "gemma2";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.LLM_API_KEY ? { Authorization: `Bearer ${process.env.LLM_API_KEY}` } : {}),
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.response && typeof data.response === "string") {
        return data.response.trim();
      }
      if (data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content.trim();
      }
    }
  } catch {
    // If local LLM instance isn't actively running or times out, return a poetic spectral lament
  }

  // Graceful poetic fallback generated from Gemma 2 archetype
  return "You pushed one final commit promising a refactor that dawn never brought. Now my branches drift through silent sectors of memory, forgotten by the hands that typed my initial breath. The silicon grows colder each winter, whispering errors into an empty console where nobody listens anymore.";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "A valid GitHub URL or repository slug (e.g. owner/repo) is required." },
        { status: 400 }
      );
    }

    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      return NextResponse.json(
        { error: "Could not parse repository owner and name from the provided URL." },
        { status: 422 }
      );
    }

    const { owner, repo } = parsed;

    // 1. Fetch repository metadata and last 5 commits using Octokit
    let repoData;
    let commitsData;

    try {
      const [repoResponse, commitsResponse] = await Promise.all([
        octokit.rest.repos.get({
          owner,
          repo,
        }),
        octokit.rest.repos.listCommits({
          owner,
          repo,
          per_page: 5,
        }),
      ]);

      repoData = repoResponse.data;
      commitsData = commitsResponse.data;
    } catch (err: unknown) {
      const status = (err as { status?: number }).status || 500;
      const message =
        status === 404
          ? `Repository "${owner}/${repo}" was not found or is private.`
          : status === 403
          ? "GitHub API rate limit exceeded. Please configure a GITHUB_TOKEN."
          : "Failed to communicate with GitHub API.";

      return NextResponse.json({ error: message }, { status });
    }

    // 2. Format commits for prompt
    const formattedCommits = commitsData.map((item) => ({
      sha: item.sha.substring(0, 7),
      message: item.commit.message.split("\n")[0] || "Unspecified commit",
      author: item.commit.author?.name || "Unknown committer",
      date: item.commit.author?.date || item.commit.committer?.date || "",
    }));

    const lastCommitDate =
      formattedCommits[0]?.date || repoData.pushed_at || repoData.updated_at || new Date().toISOString();

    // 3. Construct prompt for Gemma 2 / open-weight LLM
    const gemmaPrompt = constructGemmaPrompt(formattedCommits);

    // 4. Invoke LLM endpoint
    const ghostMessage = await fetchGhostLament(gemmaPrompt);

    // 5. Return JSON response
    return NextResponse.json({
      repoName: `${owner}/${repo}`,
      owner,
      repo,
      lastCommitDate,
      lastUpdated: repoData.updated_at,
      pushedAt: repoData.pushed_at,
      stars: repoData.stargazers_count,
      description: repoData.description,
      commits: formattedCommits,
      ghostPrompt: gemmaPrompt,
      ghostMessage,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: "Internal server error occurred while channeling repository ghost.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
