import * as dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const openAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const chatCompletion = await openAi.chat.completions.create({
  messages: [
    {
      content: "Please give me a list of 5 colors",
      role: "user",
    },
    {
      content:
        "Now give me a list of 5 more colors where each color is a lighter or darker version of the previous 5 colors you generated",
      role: "user",
    },
  ],
  model: "gpt-3.5-turbo",
  n: 1,
  temperature: 1,
});

const assistantMessage = chatCompletion.choices[0].message.content;

console.log("generateTestCaseTitles.ts: assistantMessage", assistantMessage);
