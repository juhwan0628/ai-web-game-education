import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url);

for (let index = 1; index <= 12; index += 1) {
  const id = `team${String(index).padStart(2, "0")}`;
  const dir = join(root.pathname, "teams", id);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, ".gitkeep"), "", { flag: "a" });
  console.log(`ready ${id}`);
}
