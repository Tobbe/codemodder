import * as dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const openAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemMessage = `You're an expert TypeScript and React developer.
You always practice Test Driven Development, so you always write tests first,
before writing any code. Your job is to write a codemod using jscodeshift.
You will be presented with one example input code for the codemod with matching
output. The example input will be wrapped in "--- BEGIN INPUT ---" and
"--- END INPUT ---" markers, and the expected output will be wrapped in
"--- BEGIN OUTPUT ---" and "--- END OUTPUT ---" markers. You will also be
presented with different variations of example input code that will be enclosed
in "--- BEGIN VARIATIONS ---" and "--- END VARIATIONS ---" markers, and separated
by "--- SEPARATOR ---" markers.
Please generate test case names for tests that would be needed to test the
codemod with all those different input variations.
Reply with just a list of test case names, nothing more. No list markers and
no separators. Just the test case names.`;

function wrapVariationsInput(exampleInput: string) {
  return (
    "--- BEGIN VARIATIONS ---\n" + exampleInput + "\n--- END VARIATIONS ---\n"
  );
}

function wrapExampleInputAndOutput(
  exampleInput: string,
  exampleOutput: string,
) {
  return (
    "--- BEGIN INPUT ---\n" +
    exampleInput +
    "\n--- END INPUT ---\n\n--- BEGIN OUTPUT ---\n" +
    exampleOutput +
    "\n--- END OUTPUT ---\n"
  );
}

export async function generateTestCaseTitles(
  exampleInput: string,
  exampleOutput: string,
  inputVariations: string[],
) {
  const chatCompletion = await openAi.chat.completions.create({
    messages: [
      { content: systemMessage, role: "system" },
      {
        content:
          wrapExampleInputAndOutput(exampleInput, exampleOutput) +
          wrapVariationsInput(inputVariations.join("--- SEPARATOR ---")),
        role: "user",
      },
    ],
    model: "gpt-3.5-turbo",
    n: 1,
    temperature: 1,
  });

  const assistantMessage = chatCompletion.choices[0].message.content;

  console.log("generateTestCaseTitles.ts: assistantMessage", assistantMessage);

  return assistantMessage?.split("\n").map((line) => line.trim()) ?? [];
}
