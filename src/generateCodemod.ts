import type OpenAI from "openai";

import fs from "node:fs";
import path from "node:path";

const systemMessage = `You're an expert TypeScript and React developer. Your
job is to write a codemod using jscodeshift for the given input.
The codemod should be written in TypeScript and use generics where appropriate
for full type safety. Never use the \`any\` type in your codemod. Don't do any
type casting (type asserting). Always explicitly type input parameters to all
functions.
`;

function composeInputOutputPart(exampleInput: string, exampleOutput: string) {
  return `You will now be given an example of input that the codemod will need
to handle. I use typescript code blocks (\`\`\`ts) to enclose the example input.
The example input is:

\`\`\`ts
${exampleInput}
\`\`\`

The expected output for that input is:

\`\`\`ts
${exampleOutput}
\`\`\`

`;
}

function generateVariationsPart(codemodFolder: string) {
  // Need to read this from file because the user might have modified it since
  // we wrote it to the file
  const inputVariations = fs.readFileSync(
    path.join(codemodFolder, "input-variations.md"),
    "utf-8",
  );

  if (!inputVariations || inputVariations.length < 1) {
    return "";
  }

  return `Here are more example input variations that you need to handle:

${inputVariations}

That was the end of all examples.

`;
}

function composeDescriptionPart(codemodDescription: string) {
  return `Here's a description of the codemod that you need to implement (enclosed in
"--- BEGIN DESCRIPTION ---" and "--- END DESCRIPTION ---" markers):

--- BEGIN DESCRIPTION ---
${codemodDescription}
--- END DESCRIPTION ---

Reply with the code for the codemod. Please no preamble, no explanations, no code
markers or code blocks and no other formatting. But do please also include helpful code
comments to explain the codemod. And remember to generate strictly type-safe
code.
`;
}

export async function generateCodemod(
  openAi: OpenAI,
  codemodFolder: string,
  exampleInput: string,
  exampleOutput: string,
  codemodDescription: string,
) {
  const userMessagePart1 = composeInputOutputPart(exampleInput, exampleOutput);
  const userMessagePart2 = generateVariationsPart(codemodFolder);
  const userMessagePart3 = composeDescriptionPart(codemodDescription);
  const userMessage = userMessagePart1 + userMessagePart2 + userMessagePart3;

  console.log("Asking AI to generate codemod...");

  const chatCompletion = await openAi.chat.completions.create({
    messages: [
      {
        content: systemMessage,
        role: "system",
      },
      {
        content: userMessage,
        role: "user",
      },
    ],
    model: "gpt-4o",
    n: 1,
    temperature: 1,
  });

  const codemod = chatCompletion.choices[0].message.content;

  return codemod;
}
