import fs from "node:fs";

import { generateInputVariations } from "./generateInputVariations.js";
// import { generateTestCaseTitles } from "./generateTestCaseTitlesForDescription.js";
// import { generateTests } from "./generateTests.js";
import { generateCodemod } from "./generateCodemod.js";

const exampleInput = "import { Router, Route } from '@redwoodjs/router'";
const exampleOutput = `import { Router } from '@redwoodjs/vite/Router'
import { Route } from '@redwoodjs/router'`;
const codemodDescription =
  "The codemod should change all `Router` imports from " +
  "`@redwoodjs/router` to import from `@redwoodjs/vite/Router` instead. For " +
  "the example input code it should split the import statement into two " +
  "separate import statements. The first import statement should import the " +
  "'Router' from '@redwoodjs/vite/Router' and the second import statement should import the 'Route' from '@redwoodjs/router'.";

const inputVariations = await generateInputVariations(exampleInput);

// Creating the titles at this point only seemed to confuse the model
// It was better to just generate the tests straight away
// const testCaseTitles = await generateTestCaseTitles(
//   exampleInput,
//   codemodDescription,
//   inputVariations,
// );

// const tests = await generateTests(
//   exampleInput,
//   exampleOutput,
//   inputVariations,
//   codemodDescription,
// );

// console.log("index.ts: tests", tests);

// fs.writeFileSync("tests.ts", tests);

const codemod = await generateCodemod(
  exampleInput,
  exampleOutput,
  inputVariations,
  codemodDescription,
);

console.log("index.ts: codemod", codemod);
fs.writeFileSync("codemod.ts", codemod ?? "");
