import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const target = process.argv[2];

if (!target) {
  console.error("Usage: node scripts/check-submissions.mjs <team-folder>");
  process.exit(2);
}

const requiredEntries = [
  { path: "README.md", type: "file" },
  { path: "SPEC.md", type: "file" },
  { path: "index.html", type: "file" },
  { path: "assets/images", type: "dir" },
  { path: "assets/audio", type: "dir" }
];

const blockedPatterns = [
  { label: "external URL", regex: /https?:\/\/(?!www\.w3\.org\/1999\/xhtml)/i },
  { label: "external script src", regex: /<script[^>]+src=["']https?:\/\//i },
  { label: "external link href", regex: /<link[^>]+href=["']https?:\/\//i },
  { label: "fetch call", regex: /fetch\s*\(/i }
];

const textExtensions = new Set([".html", ".htm", ".css", ".js", ".md", ".json", ".txt"]);
const allowedVendorFiles = new Set(["assets/js/three.min.js"]);
const errors = [];

async function exists(path, type) {
  try {
    const info = await stat(path);
    return type === "dir" ? info.isDirectory() : info.isFile();
  } catch {
    return false;
  }
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(path));
    } else if (entry.isFile()) {
      files.push(path);
    }
  }
  return files;
}

function isTextFile(path) {
  return [...textExtensions].some((ext) => path.toLowerCase().endsWith(ext));
}

for (const entry of requiredEntries) {
  const path = join(target, entry.path);
  if (!await exists(path, entry.type)) {
    errors.push(`missing ${entry.path}`);
  }
}

let files = [];
try {
  files = await walk(target);
} catch (error) {
  console.error(`Cannot read ${target}: ${error.message}`);
  process.exit(2);
}

for (const file of files.filter(isTextFile)) {
  const relativePath = relative(target, file);
  if (allowedVendorFiles.has(relativePath)) continue;
  const content = await readFile(file, "utf8");
  for (const pattern of blockedPatterns) {
    if (pattern.regex.test(content)) {
      errors.push(`${relativePath}: blocked ${pattern.label}`);
    }
  }
}

if (errors.length > 0) {
  console.error("FAIL");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("PASS");
