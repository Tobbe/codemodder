import fs from "node:fs";
// eslint-disable-next-line n/no-unsupported-features/node-builtins
import readline from "node:readline/promises";

import { runEslintFix } from "./eslint.js";
import { generateCodemod } from "./generateCodemod.js";
import { generateInputVariations } from "./generateInputVariations.js";
import { runPrettierWrite } from "./prettier.js";
import { readCodemodInputs } from "./readInputs.js";
import { runTsc } from "./tsc.js";

const { codemodDescription, exampleInput, exampleOutput } = readCodemodInputs();

const inputVariations = await generateInputVariations(exampleInput);

const inputVariationsString =
  "```ts\n" + inputVariations.join("\n```\n\n```ts\n") + "\n```";

fs.writeFileSync("input-variations.md", inputVariationsString);

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
rl.close();

if (Math.random() > 5) {
  const codemod = await generateCodemod(
    exampleInput,
    exampleOutput,
    codemodDescription,
  );

  console.log("index.ts: codemod");
  console.log(codemod);
  fs.writeFileSync("codemod.ts", codemod ?? "");
}

const eslintResult = await runEslintFix("codemod.ts");
await runPrettierWrite("codemod.ts");
const tscResult = await runTsc("codemod.ts");

if (eslintResult.length === 0 && tscResult.length === 0) {
  console.log("All checks passed!");
} else {
  console.log("eslintResult", eslintResult);
  console.log("tscResult", tscResult);
}
