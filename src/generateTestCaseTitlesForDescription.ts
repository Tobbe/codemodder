import * as dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const openAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemMessage = `You're an expert TypeScript and React developer talking
to another expert TypeScript and React developer.
You always practice Test Driven Development, so you always write tests first,
before writing any code. Your job is to write a codemod and the tests for that
codemod.
You will be presented with one example input code for the codemod with matching
output. The example input will be wrapped in "--- BEGIN INPUT ---" and
"--- END INPUT ---" markers. You will also be presented with different
variations of example input code that will be enclosed in
"--- BEGIN VARIATIONS ---" and "--- END VARIATIONS ---" markers, and separated
by "--- SEPARATOR ---" markers.
`;

const systemMessageTask = `
You can assume that there is a function called \`transform\` that already
implements the correct codemod.
Please generate test cases for all those variations using vitest. Reply with
the code only. No explanations, code comments code markers or anything like that is needed`;

function wrapVariationsInput(exampleInput: string) {
  return (
    "--- BEGIN VARIATIONS ---\n" + exampleInput + "\n--- END VARIATIONS ---\n"
  );
}

function wrapExampleInput(exampleInput: string) {
  return "--- BEGIN INPUT ---\n" + exampleInput + "\n--- END INPUT ---\n";
}

export async function generateTestCaseTitles(
  exampleInput: string,
  codemodDescription: string,
  inputVariations: string[],
) {
  const chatCompletion = await openAi.chat.completions.create({
    messages: [
      {
        content:
          systemMessage + "\n" + codemodDescription + "\n" + systemMessageTask,
        role: "system",
      },
      {
        content:
          wrapExampleInput(exampleInput) +
          wrapVariationsInput(inputVariations.join("--- SEPARATOR ---")),
        role: "user",
      },
    ],
    model: "gpt-4o",
    n: 1,
    temperature: 1,
  });

  const assistantMessage = chatCompletion.choices[0].message.content;

  console.log("generateTestCaseTitles.ts: assistantMessage", assistantMessage);

  return assistantMessage?.split("\n").map((line) => line.trim()) ?? [];
}
