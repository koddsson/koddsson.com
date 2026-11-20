import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function hash(relativePath) {
  const contents = await fs.readFile(
    path.join(__dirname, "..", relativePath),
  );
  return crypto.createHash("sha256").update(contents).digest("hex").slice(0, 8);
}

export default async function () {
  const index = await hash("css/index.css");
  return { css: { index } };
}
