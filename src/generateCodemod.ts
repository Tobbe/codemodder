// Load environment variables (populate process.env from .env file)
import * as dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const openAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemMessage = `You're an expert TypeScript and React developer. Your
job is to write a codemod using jscodeshift for the given input.
The codemod should be written in TypeScript and use generics where appropriate
for full type safety. Never use the \`any\` type in your codemod. Don't do any
type casting (type asserting). Always explicitly type input parameters to all
functions.
`;

function composeInputOutputPart(exampleInput: string, exampleOutput: string) {
  return `You will now be given an example of input that the codemod will need
to handle. I use tripple backticks to enclose code blocks. The example input is

\`\`\`
${exampleInput}
\`\`\`

The expected output for that input is:

\`\`\`
${exampleOutput}
\`\`\`

`;
}

function composeVariationsPart(inputVariations?: string[]) {
  if (!inputVariations || inputVariations.length < 1) {
    return "";
  }

  const inputVariationsString = inputVariations.join("\n```\n\n```\n");

  return `Here are more example input variations that you need to handle:

\`\`\`
${inputVariationsString}
\`\`\`

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
  exampleInput: string,
  exampleOutput: string,
  inputVariations: string[],
  codemodDescription: string,
) {
  const userMessagePart1 = composeInputOutputPart(exampleInput, exampleOutput);
  const userMessagePart2 = composeVariationsPart(inputVariations);
  const userMessagePart3 = composeDescriptionPart(codemodDescription);
  const userMessage = userMessagePart1 + userMessagePart2 + userMessagePart3;

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

  console.log("chatCompletion.choices", chatCompletion.choices);

  const codemod = chatCompletion.choices[0].message.content;

  return codemod;
}
