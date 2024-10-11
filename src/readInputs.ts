import fs from "node:fs";
import path from "node:path";

export function readCodemodInputs() {
  console.log("argv", process.argv);
  console.log("folder", process.argv.at(-1));

  const codemodFolder = process.argv.at(-1);

  if (!codemodFolder) {
    throw new Error("Please provide a folder name");
  }

  const exampleInput = fs.readFileSync(
    path.join("codemods", codemodFolder, "example-input.ts"),
    "utf-8",
  );
  const exampleOutput = fs.readFileSync(
    path.join("codemods", codemodFolder, "example-output.ts"),
    "utf-8",
  );
  const codemodDescription = fs.readFileSync(
    path.join("codemods", codemodFolder, "description.md"),
    "utf-8",
  );

  return {
    codemodDescription,
    exampleInput,
    exampleOutput,
  };
}
