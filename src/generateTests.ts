// Load environment variables (populate process.env from .env file)
import * as dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const openAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function constructTestImplementationsSystemMessage(
  exampleInput: string,
  exampleOutput: string,
  inputVariations: string,
  codemodDescription: string,
) {
  return `You're an expert TypeScript and React developer. You always practice
Test Driven Development, so you always write tests first, before writing any
code. Your job is to write a codemod for the given input.

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

Assuming there is a function called \`transform\` that already implements the
correct codemod, can you please write the implementation of the tests for the
codemod? Use vitest for testing.
Reply with the code for the test cases only, no explanations, no imports,
no code comments, no code markers and no other formatting. Don't try to
import the \`transform\` function or anything else, just write the tests.`;
}

export async function generateTests(
  exampleInput: string,
  exampleOutput: string,
  inputVariations: string[],
  codemodDescription: string,
) {
  const chatCompletion = await openAi.chat.completions.create({
    messages: [
      {
        content: constructTestImplementationsSystemMessage(
          exampleInput,
          exampleOutput,
          inputVariations.join("\n--- SEPARATOR ---\n"),
          codemodDescription,
        ),
        role: "user",
      },
    ],
    model: "gpt-4o",
    n: 1,
    temperature: 1,
  });

  console.log("chatCompletion.choices", chatCompletion.choices);

  const tests = chatCompletion.choices[0].message.content;
  if (tests) {
    const vitestImports = [];

    if (tests.includes("test(")) {
      vitestImports.push("test");
    }

    if (tests.includes("expect(")) {
      vitestImports.push("expect");
    }

    if (tests.includes("describe(")) {
      vitestImports.push("describe");
    }

    if (tests.includes("it(")) {
      vitestImports.push("it");
    }

    const vitestImport = `import { ${vitestImports.join(", ")} } from "vitest";\n`;

    return (
      vitestImport +
      "\n" +
      "function transform(input: string) {\n" +
      "  return input;\n" +
      "}\n\n" +
      tests
    );
  }

  return "";
}
