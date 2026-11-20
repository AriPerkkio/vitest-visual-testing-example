// @ts-check
/**
 * Posts the visual differences of a PR run as a PR comment, with images.
 *
 * Runs in the `visual-diff-comment` job of .github/workflows/ci.yml through
 * actions/github-script. Reads `vrt-failures.json` from the downloaded Vitest
 * report (written by scripts/vrt-failures-reporter.ts), then:
 *
 * - With failures: pushes the reference/actual/diff images as a single orphan
 *   commit to the `vrt/pr-<number>` branch (force-pushed, so no history piles
 *   up), and creates or updates one PR comment that shows them through
 *   raw.githubusercontent.com URLs pinned to that commit.
 * - Without failures: deletes the branch and, if a comment exists, updates it
 *   to say there are no differences.
 *
 * The cleanup-visual-diffs workflow deletes the branch when the PR closes.
 */
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const MARKER = "<!-- vitest-visual-regression -->";

/** GitHub comments are limited to 65536 characters. */
const MAX_FAILURES_SHOWN = 30;

/**
 * @typedef {{ test: string, file: string, message: string, images: Array<{ name: string, path: string }> }} VisualFailure
 *
 * @param {object} options
 * @param {any} options.github Octokit client from actions/github-script
 * @param {any} options.context Workflow context from actions/github-script
 * @param {any} options.core @actions/core from actions/github-script
 * @param {string} options.reportDir Directory of the downloaded Vitest report
 * @param {string} options.token Token that can push to the repository
 * @param {(stagingDir: string, branch: string) => string} [options.pushImages] Pushes the staged images and returns the commit SHA (overridable for local testing)
 */
export default async function run({ github, context, core, reportDir, token, pushImages }) {
  const { owner, repo } = context.repo;
  const pr = context.payload.pull_request;
  const branch = `vrt/pr-${pr.number}`;
  const headSha = pr.head.sha.slice(0, 7);
  const repoUrl = `${context.serverUrl}/${owner}/${repo}`;
  const runUrl = `${repoUrl}/actions/runs/${context.runId}`;

  const resultsPath = join(reportDir, "vrt-failures.json");
  if (!existsSync(resultsPath)) {
    core.warning(
      `${resultsPath} not found: the tests probably didn't run. Leaving the PR comment unchanged.`,
    );
    return;
  }

  /** @type {{ failures: VisualFailure[] }} */
  const { failures } = JSON.parse(readFileSync(resultsPath, "utf8"));
  const existing = await findComment(github, owner, repo, pr.number);

  if (failures.length === 0) {
    await deleteBranch(github, owner, repo, branch);
    if (existing) {
      await updateComment(
        github,
        owner,
        repo,
        existing.id,
        `${MARKER}\n### 📸 Visual differences\n\n✅ No visual differences as of \`${headSha}\` ([workflow run](${runUrl})).`,
      );
    }
    core.info("No visual differences.");
    return;
  }

  // Stage the images as <nn>-<test-name>/<reference|actual|diff>.png
  const shown = failures.slice(0, MAX_FAILURES_SHOWN);
  const stagingDir = mkdtempSync(join(tmpdir(), "vrt-images-"));
  const staged = shown.map((failure, index) => {
    const dir = `${String(index + 1).padStart(2, "0")}-${slug(failure.test)}`;
    const images = failure.images.map((image) => {
      const file = `${dir}/${slug(image.name)}.png`;
      cpSync(join(reportDir, image.path), join(stagingDir, file));
      return { name: image.name, file };
    });
    return { failure, images };
  });

  const push =
    pushImages ??
    ((dir, ref) =>
      pushOrphanCommit(
        dir,
        ref,
        `https://x-access-token:${token}@github.com/${owner}/${repo}.git`,
        {
          message: `Visual differences of #${pr.number} at ${headSha}`,
        },
      ));
  const commitSha = push(stagingDir, branch);
  const imageUrl = (/** @type {string} */ file) =>
    `https://raw.githubusercontent.com/${owner}/${repo}/${commitSha}/${file}`;

  const lines = [
    MARKER,
    "### 📸 Visual differences",
    "",
    `**${failures.length}** ${failures.length === 1 ? "screenshot doesn't match its reference" : "screenshots don't match their references"} in \`${headSha}\` ([workflow run](${runUrl})). The full Vitest report is in the run's **vitest-report** artifact.`,
    "",
    `If the changes are intentional, run the [Update Visual Regression Screenshots](${repoUrl}/actions/workflows/update-screenshots.yml) workflow on \`${pr.head.ref}\`.`,
  ];

  for (const { failure, images } of staged) {
    lines.push(
      "",
      "<details open>",
      `<summary><code>${escapeHtml(failure.test)}</code> · <code>${escapeHtml(failure.file)}</code></summary>`,
      "",
      ...failure.message
        .trim()
        .split("\n")
        .map((line) => `> ${line}`),
      "",
      `| ${images.map((image) => capitalize(image.name)).join(" | ")} |`,
      `| ${images.map(() => ":-:").join(" | ")} |`,
      `| ${images.map((image) => `![${image.name}](${imageUrl(image.file)})`).join(" | ")} |`,
      "",
      "</details>",
    );
  }

  if (failures.length > shown.length) {
    lines.push(
      "",
      `…and ${failures.length - shown.length} more. See the **vitest-report** artifact for all of them.`,
    );
  }

  const body = lines.join("\n");
  if (existing) {
    await updateComment(github, owner, repo, existing.id, body);
  } else {
    await github.rest.issues.createComment({ owner, repo, issue_number: pr.number, body });
  }
  await core.summary.addRaw(body).write();
  core.info(`Posted ${failures.length} visual difference(s).`);
}

/**
 * Commits the directory as the only commit of `branch` and force-pushes it.
 * @param {string} dir
 * @param {string} branch
 * @param {string} remote
 * @param {{ message: string }} options
 */
export function pushOrphanCommit(dir, branch, remote, { message }) {
  const git = (/** @type {string[]} */ ...args) =>
    execFileSync("git", ["-C", dir, ...args], { encoding: "utf8" }).trim();
  git("init", "-q", "-b", "vrt");
  git("add", "-A");
  git(
    "-c",
    "user.name=github-actions[bot]",
    "-c",
    "user.email=41898282+github-actions[bot]@users.noreply.github.com",
    "commit",
    "-q",
    "-m",
    message,
  );
  git("push", "-q", "--force", remote, `HEAD:refs/heads/${branch}`);
  return git("rev-parse", "HEAD");
}

/** @param {any} github @param {string} owner @param {string} repo @param {number} issue_number */
async function findComment(github, owner, repo, issue_number) {
  const comments = await github.paginate(github.rest.issues.listComments, {
    owner,
    repo,
    issue_number,
    per_page: 100,
  });
  return comments.find((/** @type {{ body?: string }} */ c) => c.body?.startsWith(MARKER));
}

/** @param {any} github @param {string} owner @param {string} repo @param {number} comment_id @param {string} body */
async function updateComment(github, owner, repo, comment_id, body) {
  await github.rest.issues.updateComment({ owner, repo, comment_id, body });
}

/** @param {any} github @param {string} owner @param {string} repo @param {string} branch */
async function deleteBranch(github, owner, repo, branch) {
  try {
    await github.rest.git.deleteRef({ owner, repo, ref: `heads/${branch}` });
  } catch (error) {
    // 404/422: the branch doesn't exist
    if (![404, 422].includes(/** @type {{ status?: number }} */ (error).status ?? 0)) throw error;
  }
}

/** @param {string} value */
function slug(value) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "screenshot"
  );
}

/** @param {string} value */
function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** @param {string} value */
function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
