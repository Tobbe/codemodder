import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
// Load environment variables (populate process.env from .env file)
import * as dotenv from "dotenv";
// Import the OpenAPI Large Language Model (you can import other models here
// eg. Cohere)
import { ChatOpenAI } from "@langchain/openai";

dotenv.config();

const systemTemplate = "Translate the following into {language}:";

const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", systemTemplate],
  ["user", "{text}"],
]);

const model = new ChatOpenAI({ temperature: 0.7 });
const parser = new StringOutputParser();
const chain = promptTemplate.pipe(model).pipe(parser);

const result = await chain.invoke({ language: "italian", text: "hi" });

console.log("result", result);
