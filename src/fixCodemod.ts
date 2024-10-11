import type OpenAI from "openai";

import fs from "node:fs";

const systemMessage = `You're an expert TypeScript and React developer. You
write codemods using jscodeshift.
The codemods should be written in TypeScript and use generics where appropriate
for full type safety. Never use the \`any\` type in your codemods. Don't do any
type casting (type asserting). Always explicitly type input parameters to all
functions.
`;

function composeCodemodeToFixPart(codemodPath: string) {
  const existingCodemod = fs.readFileSync(codemodPath, "utf-8");

  return `You will now be given an existing codemod inclosed in typescript code
blocks (\`\`\`ts).

\`\`\`ts
${existingCodemod}
\`\`\`

`;
}

function generateEslintPart(eslintResult: string[]) {
  if (eslintResult.length === 0) {
    return "";
  }

  return `The codemod has the following ESLint errors:
${eslintResult.join("\n")}

`;
}

function generateTscPart(eslintResult: string[], tscResult: string[]) {
  if (tscResult.length === 0) {
    return "";
  }

  const also = eslintResult.length > 0 ? "also " : "";

  return `The codemod ${also}has the following TypeScript errors:
${tscResult.join("\n")}

`;
}

function generateEndPart() {
  return `Please fix the listed errors. I want your reply to only include the
code for the fixed codemod; no preamble, no explanations, no code markers or
code blocks and no other formatting. But do please also include helpful code
comments to explain the codemod. And remember to generate strictly type-safe
code.
`;
}

export async function fixCodemod(
  openAi: OpenAI,
  codemodPath: string,
  eslintResult: string[],
  tscResult: string[],
) {
  const userMessage =
    composeCodemodeToFixPart(codemodPath) +
    generateEslintPart(eslintResult) +
    generateTscPart(eslintResult, tscResult) +
    generateEndPart();

  console.log(`Asking AI to fix the codemod at ${codemodPath}...`);
  console.log();

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
