import { execFileSync } from "node:child_process";

const git = process.platform === "win32" ? "git.exe" : "git";
const diff = execFileSync(git, ["diff", "--cached", "--no-color", "--unified=0", "--diff-filter=ACMR"], { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
const added = diff.split(/\r?\n/).filter((line) => line.startsWith("+") && !line.startsWith("+++")).join("\n");
const patterns = [
  /ghp_[A-Za-z0-9]{30,}/,
  /github_pat_[A-Za-z0-9_]{40,}/,
  /sb_secret_[A-Za-z0-9_-]{20,}/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
];

if (patterns.some((pattern) => pattern.test(added))) {
  console.error("Commit blocked: staged additions contain a likely secret. Revoke it, remove it from the index and use a secret store.");
  process.exit(1);
}
