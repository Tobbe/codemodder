import { exec } from "node:child_process";

export async function runTsc(fileName: string) {
  return new Promise<string[]>((resolve) => {
    // const child = exec("tsc", (error, stdout, stderr) => {
    exec(
      `pnpm tsc ${fileName} --pretty false --noEmit --strict`,
      (error, stdout) => {
        let errorLines: string[] = [];

        if (error) {
          let stopCollecting = false;

          errorLines = stdout.split("\n").reduce<string[]>((acc, line) => {
            if (line.startsWith("codemods/") && acc.length === 0) {
              acc.push(line);
            } else if (acc.length > 0 && !stopCollecting) {
              if (line.includes("ELIFECYCLE")) {
                stopCollecting = true;
              } else {
                acc.push(line);
              }
            }

            return acc;
          }, []);
        }

        resolve(errorLines);
      },
    );
  });
}
