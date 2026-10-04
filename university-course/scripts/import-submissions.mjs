import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile
} from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, "..");
const teamsDir = join(rootDir, "teams");
const dataPath = join(rootDir, "data", "teams.json");
const importDir = join(rootDir, ".imports");

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const keep = args.includes("--keep");
const inputPath = args.find((arg) => !arg.startsWith("--"));

if (!inputPath || args.includes("--help")) {
  console.log(`Usage:
  node scripts/import-submissions.mjs submissions.tsv
  node scripts/import-submissions.mjs submissions.tsv --apply

TSV/CSV columns:
  team title intro zipUrl

Example row:
  5팀\t화살 피하기 게임\t마우스로 구슬을 먹어서 버티는 게임입니다\thttps://drive.google.com/open?id=...

Options:
  --apply  실제로 teams/teamXX와 data/teams.json에 반영
  --keep   다운로드/압축해제 임시 파일 보존
`);
  process.exit(args.includes("--help") ? 0 : 2);
}

function parseDelimited(text) {
  const rows = text.split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("#"));
  return rows.map((line) => {
    const delimiter = line.includes("\t") ? "\t" : ",";
    return line.split(delimiter).map((part) => part.trim());
  });
}

function isHeaderRow(cols) {
  const [team, title, intro, url] = cols.map((col) => col.toLowerCase());
  return (
    ["팀", "team"].includes(team) &&
    ["게임제목", "title"].includes(title) &&
    ["한줄소개", "intro"].includes(intro) &&
    ["zip링크", "zipurl", "url"].includes(url)
  );
}

function parseTeamId(value) {
  const match = String(value).match(/(\d{1,2})(?:\s*[-_]\s*(\d{1,2}))?/);
  if (!match) throw new Error(`팀 번호를 찾을 수 없음: ${value}`);
  const number = Number(match[1]);
  if (number < 1 || number > 99) throw new Error(`팀 번호 범위 오류: ${value}`);
  const suffix = match[2] ? `-${Number(match[2])}` : "";
  return `team${String(number).padStart(2, "0")}${suffix}`;
}

function teamLabel(teamId) {
  const match = teamId.match(/^team0?(\d+)(?:-(\d+))?$/);
  if (!match) return teamId;
  return `${Number(match[1])}${match[2] ? `-${match[2]}` : ""}팀`;
}

function googleDriveFileId(url) {
  const text = String(url);
  const patterns = [
    /[?&]id=([^&]+)/,
    /\/file\/d\/([^/]+)/,
    /\/d\/([^/]+)/
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return decodeURIComponent(match[1]);
  }
  return null;
}

async function download(url, outPath) {
  if (!/^https?:\/\//i.test(url)) {
    await cp(resolve(rootDir, url), outPath);
    return;
  }

  const id = googleDriveFileId(url);
  const firstUrl = id
    ? `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`
    : url;
  const cookieJar = [];

  let response = await fetch(firstUrl, { redirect: "follow" });
  const cookie = response.headers.get("set-cookie");
  if (cookie) cookieJar.push(cookie.split(";")[0]);

  const contentType = response.headers.get("content-type") || "";
  if (id && contentType.includes("text/html")) {
    const html = await response.text();
    const token =
      html.match(/confirm=([0-9A-Za-z_=-]+)/)?.[1] ||
      html.match(/name="confirm"\s+value="([^"]+)"/)?.[1];
    if (token) {
      response = await fetch(`${firstUrl}&confirm=${encodeURIComponent(token)}`, {
        redirect: "follow",
        headers: cookieJar.length ? { cookie: cookieJar.join("; ") } : {}
      });
    } else {
      throw new Error("Google Drive 확인 토큰을 찾지 못함. 공유 권한 또는 파일 크기 확인 필요.");
    }
  }

  if (!response.ok) throw new Error(`다운로드 실패 HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(outPath, buffer);
}

async function unzip(zipPath, outDir) {
  const code = `
import sys, zipfile, pathlib
zip_path = pathlib.Path(sys.argv[1])
out_dir = pathlib.Path(sys.argv[2])
target_root = out_dir.resolve()
with zipfile.ZipFile(zip_path) as zf:
    for info in zf.infolist():
        target = (out_dir / info.filename).resolve()
        if target != target_root and target_root not in target.parents:
            print(f"unsafe zip path: {info.filename}", file=sys.stderr)
            sys.exit(1)
    zf.extractall(out_dir)
`;
  const result = spawnSync("python3", ["-c", code, zipPath, outDir], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(result.stderr || "압축 해제 실패");
  }
}

async function contentRoot(dir) {
  let current = dir;
  while (true) {
    const entries = (await readdir(current, { withFileTypes: true }))
      .filter((entry) => !entry.name.startsWith("__MACOSX"));
    const dirs = entries.filter((entry) => entry.isDirectory());
    const files = entries.filter((entry) => entry.isFile());
    if (dirs.length !== 1 || files.length !== 0) return current;
    current = join(current, dirs[0].name);
  }
}

async function hashFile(path) {
  const content = await readFile(path);
  return createHash("sha1").update(content).digest("hex").slice(0, 10);
}

async function ensureLooksLikeSubmission(dir) {
  const required = ["README.md", "SPEC.md", "index.html", "assets/images", "assets/audio"];
  for (const name of required) {
    const path = join(dir, name);
    if (!existsSync(path)) throw new Error(`압축 안에 ${name} 없음`);
  }
}

function checkSubmission(dir) {
  const result = spawnSync("node", [join(scriptDir, "check-submissions.mjs"), dir], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`제출 검수 실패:\n${result.stderr || result.stdout}`);
  }
}

async function loadTeamsJson() {
  return JSON.parse(await readFile(dataPath, "utf8"));
}

async function saveTeamsJson(data) {
  await writeFile(dataPath, `${JSON.stringify(data, null, 2)}\n`);
}

async function replaceDirectory(sourceDir, targetDir) {
  const nextDir = `${targetDir}.next-${Date.now()}`;
  const backupDir = `${targetDir}.backup-${Date.now()}`;

  await cp(sourceDir, nextDir, { recursive: true });
  let hasBackup = false;
  try {
    if (existsSync(targetDir)) {
      await rename(targetDir, backupDir);
      hasBackup = true;
    }
    await rename(nextDir, targetDir);
    if (hasBackup) await rm(backupDir, { recursive: true, force: true });
  } catch (error) {
    await rm(nextDir, { recursive: true, force: true });
    if (hasBackup && !existsSync(targetDir)) {
      await rename(backupDir, targetDir);
    }
    throw error;
  }
}

function upsertTeam(data, row) {
  let team = data.activeTeams.find((item) => item.id === row.teamId);
  if (!team) {
    team = { id: row.teamId, label: teamLabel(row.teamId), status: "empty", title: "", intro: "" };
    data.activeTeams.push(team);
  }
  team.status = "submitted";
  team.title = row.title;
  team.intro = row.intro;
}

async function saveSortedTeams(data) {
  data.activeTeams.sort((a, b) => a.id.localeCompare(b.id));
  await saveTeamsJson(data);
}

async function main() {
  const rows = parseDelimited(await readFile(inputPath, "utf8"))
    .filter((cols, index) => index !== 0 || !isHeaderRow(cols))
    .map((cols, index) => {
      if (cols.length < 4) throw new Error(`${index + 1}행: team/title/intro/url 네 칸 필요`);
      return {
        teamRaw: cols[0],
        teamId: parseTeamId(cols[0]),
        title: cols[1],
        intro: cols[2],
        url: cols.slice(3).join(cols.length > 4 ? "," : "")
      };
    });

  await mkdir(importDir, { recursive: true });
  const data = await loadTeamsJson();

  for (const row of rows) {
    const tempDir = await mkdtemp(join(importDir, `${row.teamId}-`));
    const zipPath = join(importDir, `${row.teamId}-${Date.now()}-${basename(row.url).replace(/[^a-zA-Z0-9._-]/g, "") || "submission.zip"}`);
    const extractDir = join(tempDir, "extract");
    try {
      await mkdir(extractDir, { recursive: true });

      console.log(`\n${row.teamId} ${row.title}`);
      await download(row.url, zipPath);
      console.log(`downloaded ${zipPath} ${await hashFile(zipPath)}`);
      await unzip(zipPath, extractDir);
      const sourceDir = await contentRoot(extractDir);
      await ensureLooksLikeSubmission(sourceDir);
      checkSubmission(sourceDir);

      const targetDir = join(teamsDir, row.teamId);
      if (apply) {
        await replaceDirectory(sourceDir, targetDir);
        upsertTeam(data, row);
        await saveSortedTeams(data);
        console.log(`applied ${relative(rootDir, targetDir)}`);
      } else {
        const info = await stat(sourceDir);
        console.log(`dry-run ok ${info.isDirectory() ? sourceDir : zipPath}`);
      }
    } finally {
      if (!keep) {
        await rm(tempDir, { recursive: true, force: true });
        await rm(zipPath, { force: true });
      }
    }
  }

  if (apply) {
    console.log(`\nupdated ${dataPath}`);
  } else {
    console.log("\ndry-run only. 실제 반영은 --apply 붙여서 실행.");
  }
}

main().catch((error) => {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
});
