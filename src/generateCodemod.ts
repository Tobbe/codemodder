// Load environment variables (populate process.env from .env file)
import * as dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const openAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function constructCodemodGenerationSystemMessage(
  exampleInput: string,
  exampleOutput: string,
  inputVariations: string,
  codemodDescription: string,
) {
  return `You're an expert TypeScript and React developer. You always practice
Test Driven Development, so you always write tests first, before writing any
code. Your job is to write a codemod using jscodeshift for the given input.
The codemod should be written in TypeScript and use generics where appropriate
for full type safety. Never use the \`any\` type in your codemod. Always
explicitly type input parameters to functions.

You will now be given an example of input that the codemod will need to handle
(enclosed in "--- BEGIN INPUT ---" and "--- END INPUT ---" markers):

--- BEGIN INPUT ---
${exampleInput}
--- END INPUT ---

The expected output for that input is (enclosed in "--- BEGIN OUTPUT ---" and
"--- END OUTPUT ---" markers):

--- BEGIN OUTPUT ---
${exampleOutput}
--- END OUTPUT ---

Here's some more example input variations that you need to handle (enclosed in
"--- BEGIN VARIATIONS ---" and "--- END VARIATIONS ---" and separated by
"--- SEPARATOR ---" markers):

--- BEGIN VARIATIONS ---
${inputVariations}
--- END VARIATIONS ---

Here's a description of the codemod that you need to implement (enclosed in
"--- BEGIN DESCRIPTION ---" and "--- END DESCRIPTION ---" markers):

--- BEGIN DESCRIPTION ---
${codemodDescription}
--- END DESCRIPTION ---

Reply with the code for the codemod. Please no preamble, no explanations, no code
markers and no other formatting. But do please also include helpful code
comments to explain the codemod. And remember to generate strictly type-safe
code.
`;
}

export async function generateCodemod(
  exampleInput: string,
  exampleOutput: string,
  inputVariations: string[],
  codemodDescription: string,
) {
  const chatCompletion = await openAi.chat.completions.create({
    messages: [
      {
        content: constructCodemodGenerationSystemMessage(
          exampleInput,
          exampleOutput,
          inputVariations.join("\n--- SEPARATOR ---\n"),
          codemodDescription,
        ),
        role: "user",
      },
    ],
    model: "gpt-3.5-turbo",
    n: 1,
    temperature: 1,
  });

  console.log("chatCompletion.choices", chatCompletion.choices);

  const codemod = chatCompletion.choices[0].message.content;

  return codemod;
}
