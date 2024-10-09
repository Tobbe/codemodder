import * as dotenv from "dotenv";
import OpenAI from "openai";
import * as prettier from "prettier";

dotenv.config();

const openAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemMessage = `You're an expert TypeScript and React developer.
You always practice Test Driven Development, so you always write tests first,
before writing any code. Your job is to write a codemod using jscodeshift.
Example input code for the codemod will be enclosed in
"--- BEGIN INPUT ---" and "--- END INPUT ---" markers.
Please generate all different variations of the input code that we need to
test. We need to cover all possible ways users might have written their code.
All variations need to be valid TypeScript code.
Separate the variations with "--- SEPARATOR ---" between the variations. In
your answer, only include the code and the separator, no preamble, code
comments, explanations or other code markers.`;

const userMessageMore = `Now please generate some more variations (without
repeating any of the old ones). Be as creative as you can, while still
generating valid code. You can also try including some extra code in the
variations that a user might have in their code.`;

function wrapInput(exampleInput: string) {
  return "--- BEGIN INPUT ---\n" + exampleInput + "\n--- END INPUT ---\n";
}

/**
 * This function takes some example input and then it uses OpenAI to generate
 * variations of that code. After getting an initial list of variations, it
 * asks OpenAI again to generate more creative variations.
 *
 * @param exampleInput valid TypeScript code to generate variations for
 */
export async function generateInputVariations(exampleInput: string) {
  if (Math.random() < 5) {
    return [
      'import { Route } from "@redwoodjs/router";\nimport { Router } from "@redwoodjs/router";',
      'import { Router as RedwoodRouter, Route } from "@redwoodjs/router";',
      'import { Router, Route, navigate } from "@redwoodjs/router"',
      'import { Router, Route } from "@redwoodjs/router";\nimport { Link } from "@redwoodjs/router";',
      'import { Router, Route, Private } from "@redwoodjs/router";',
      'import { Router, Route } from "@redwoodjs/router";\nconst isLoggedIn = true;',
      'import { Router } from "@redwoodjs/router";\nimport { Route } from "@redwoodjs/router";\nimport Home from "./Home";\nimport About from "./About"',
      'import { Router } from "@redwoodjs/router";\nimport type { Route } from "@redwoodjs/router";',
    ];
  }

  const chatCompletion = await openAi.chat.completions.create({
    messages: [
      { content: systemMessage, role: "system" },
      { content: wrapInput(exampleInput), role: "user" },
      { content: userMessageMore, role: "user" },
    ],
    model: "gpt-4o",
    n: 1,
    temperature: 1,
  });

  const assistantMessage = chatCompletion.choices[0].message.content;

  const formattedInputVariations = await splitAndFormatInputVariations(
    assistantMessage ?? "",
  );

  return [...new Set(formattedInputVariations)].filter((v) => v.length > 0);
}

async function splitAndFormatInputVariations(inputVariations: string) {
  const splitInputVariations = inputVariations.split("\n--- SEPARATOR ---\n");

  const formattedInputVariations = await Promise.all(
    splitInputVariations.map(async (inputVariation: string) => {
      try {
        return await prettier.format(inputVariation, {
          filepath: "example.tsx",
        });
      } catch {
        return "";
      }
    }),
  );

  return formattedInputVariations;
}
