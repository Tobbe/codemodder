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

const userMessageMore = `Please generate some more variations (without
repeating any of the old ones). Now be as creative as you can, while still
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
  const chatCompletion = await openAi.chat.completions.create({
    messages: [
      { content: systemMessage, role: "system" },
      { content: wrapInput(exampleInput), role: "user" },
    ],
    model: "gpt-3.5-turbo",
    n: 1,
    temperature: 1,
  });

  const assistantMessage = chatCompletion.choices[0].message.content;

  const chatCompletionMore = await openAi.chat.completions.create({
    messages: [
      { content: systemMessage, role: "system" },
      { content: wrapInput(exampleInput), role: "user" },
      { content: assistantMessage, role: "assistant" },
      { content: userMessageMore, role: "user" },
    ],
    model: "gpt-3.5-turbo",
    n: 1,
    temperature: 1,
  });

  const assistantMessageMore = chatCompletionMore.choices[0].message.content;

  const formattedInputVariations = await splitAndFormatInputVariations(
    (assistantMessage ?? "") +
      "\n--- SEPARATOR ---\n" +
      (assistantMessageMore ?? ""),
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
