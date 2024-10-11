import fs from "node:fs";
import path from "node:path";

export function readCodemodInputs(codemodFolder: string) {
  const exampleInput = fs.readFileSync(
    path.join(codemodFolder, "example-input.ts"),
    "utf-8",
  );
  const exampleOutput = fs.readFileSync(
    path.join(codemodFolder, "example-output.ts"),
    "utf-8",
  );
  const codemodDescription = fs.readFileSync(
    path.join(codemodFolder, "description.md"),
    "utf-8",
  );

  return {
    codemodDescription,
    exampleInput,
    exampleOutput,
  };
}
