import fs from "node:fs";
import path from "node:path";

export function getCodemodFolder() {
  const folderName = process.argv.at(-1);

  if (!folderName) {
    throw new Error("Please provide a folder name");
  }

  const codemodFolder = path.join("codemods", folderName);

  if (!fs.existsSync(codemodFolder)) {
    throw new Error(`Folder ${codemodFolder} does not exist`);
  }

  return codemodFolder;
}
