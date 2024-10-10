import { ESLint } from "eslint";

export async function runEslintFix(filename: string) {
  const eslint = new ESLint({ fix: true });

  const results = await eslint.lintFiles(filename);

  if (!results[0] || results.length !== 1) {
    throw new Error("Expected exactly one ESLint result");
  }

  await ESLint.outputFixes(results);

  const errorReport = results[0].messages.map((message) => {
    return (
      `${message.line}:${message.column} ` +
      `${message.message} ${message.ruleId}`
    );
  });

  return errorReport;
}
