import fs from "node:fs/promises";
import prettier from "prettier";

export async function runPrettierWrite(filename: string) {
  const sourceCode = await fs.readFile(filename, "utf-8");

  const formattedCode = await prettier.format(sourceCode, {
    parser: "typescript",
  });

  await fs.writeFile(filename, formattedCode, "utf-8");
}
