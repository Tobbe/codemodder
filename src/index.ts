// Load environment variables (populate process.env from .env file)
import * as dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
// eslint-disable-next-line n/no-unsupported-features/node-builtins
import readline from "node:readline/promises";
import OpenAI from "openai";

import { getCodemodFolder } from "./codemodFolder.js";
import { runEslintFix } from "./eslint.js";
import { fixCodemod } from "./fixCodemod.js";
import { generateCodemod } from "./generateCodemod.js";
import { generateInputVariations } from "./generateInputVariations.js";
import { runPrettierWrite } from "./prettier.js";
import { readCodemodInputs } from "./readInputs.js";
import { runTsc } from "./tsc.js";

const openAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

dotenv.config();

const codemodFolder = getCodemodFolder();

const { codemodDescription, exampleInput, exampleOutput } =
  readCodemodInputs(codemodFolder);

const inputVariations = await generateInputVariations(exampleInput);

const inputVariationsString =
  "```ts\n" + inputVariations.join("\n```\n\n```ts\n") + "\n```";

fs.writeFileSync(
  path.join(codemodFolder, "input-variations.md"),
  inputVariationsString,
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log(
  "Input variations have been generated. Please take a look at " +
    "`input-variations.ts` and make any modifications you think are needed.",
);

await rl.question("Press Enter to continue...");
console.log();

const codemodPath = path.join(codemodFolder, "codemod.ts");

const codemod = await generateCodemod(
  openAi,
  codemodFolder,
  exampleInput,
  exampleOutput,
  codemodDescription,
);

fs.writeFileSync(codemodPath, codemod ?? "");

console.log("Initial codemod generated");
await rl.question("Press Enter to continue...");
console.log();
rl.close();

let previousEslintResult: string[] = [];
let previousTscResult: string[] = [];
let currentCodemodPath = codemodPath;

for (let i = 0; i < 5; ++i) {
  const eslintResult = await runEslintFix(currentCodemodPath);
  await runPrettierWrite(currentCodemodPath);
  const tscResult = await runTsc(currentCodemodPath);

  console.log("eslintResult", eslintResult);
  console.log("tscResult", tscResult);

  if (
    JSON.stringify(eslintResult) === JSON.stringify(previousEslintResult) &&
    JSON.stringify(tscResult) === JSON.stringify(previousTscResult)
  ) {
    console.log(
      "No changes in eslint and tsc results. This is as good as it gets.",
    );
    break;
  }

  previousEslintResult = eslintResult;
  previousTscResult = tscResult;

  if (eslintResult.length === 0 && tscResult.length === 0) {
    console.log("All checks passed!");
    break;
  } else {
    const newCodemod = await fixCodemod(
      openAi,
      currentCodemodPath,
      eslintResult,
      tscResult,
    );

    if (!newCodemod) {
      break;
    }

    currentCodemodPath = path.join(codemodFolder, `codemod-${i + 1}.ts`);

    fs.writeFileSync(currentCodemodPath, newCodemod);
  }
}
