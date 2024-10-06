import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
// Load environment variables (populate process.env from .env file)
import * as dotenv from "dotenv";
// Import the OpenAPI Large Language Model (you can import other models here
// eg. Cohere)
import { ChatOpenAI } from "@langchain/openai";

dotenv.config();

export const run = async () => {
  // Instantiate the OpenAI model
  // Pass the "temperature" parameter which controls the RANDOMNESS of the
  // model's output. A lower temperature will result in more predictable output,
  // while a higher temperature will result in more random output. The
  // temperature parameter is set between 0 and 1, with 0 being the most
  // predictable and 1 being the most random
  const model = new ChatOpenAI({ temperature: 0.7 });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const parser = new StringOutputParser();

  const messages = [
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    new SystemMessage(
      "You're a marketing consultant helping a client come " +
        "up with a name for their new company.",
    ),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    new HumanMessage(
      "What would be a good company name for a company that makes colorful " +
        "socks?",
    ),
  ];

  // // Calls out to the model's (OpenAI's) endpoint passing the prompt. This call
  // // returns a string
  // const res = await model.invoke(messages);

  // // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  // console.log("name", await parser.invoke(res));

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const chain = model.pipe(parser);
  const reply = await chain.invoke(messages);
  console.log("reply", reply);
};

await run();
