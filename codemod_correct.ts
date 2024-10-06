import { API, FileInfo } from "jscodeshift";

const transformer = (fileInfo: FileInfo, api: API) => {
  const j = api.jscodeshift;

  // Parse the source code
  const root = j(fileInfo.source);

  // Find all import declarations from '@redwoodjs/router'
  const importDeclarations = root.find(j.ImportDeclaration, {
    source: { value: "@redwoodjs/router" },
  });

  // Iterate over each import declaration to process it
  importDeclarations.forEach((path) => {
    const specifiers = path.node.specifiers;

    // Check if there's an import for 'Router'
    const routerSpecifier = specifiers?.find(
      (spec) =>
        j.ImportSpecifier.check(spec) && spec.imported.name === "Router",
    );

    // If the 'Router' specifier exists, we'll create a new import declaration for it
    if (routerSpecifier) {
      // Remove 'Router' from the original specifiers
      path.node.specifiers = specifiers?.filter(
        (spec) => spec !== routerSpecifier,
      );

      // Create a new import declaration for 'Router' from '@redwoodjs/vite/Router'
      const newImport = j.importDeclaration(
        [routerSpecifier],
        j.literal("@redwoodjs/vite/Router"),
      );

      // Insert the new import declaration before the current one
      j(path).insertBefore(newImport);
    }

    // Remove the import declaration if it has no specifiers left
    if (path.node.specifiers?.length === 0) {
      j(path).remove();
    }
  });

  // Return the modified source code
  return root.toSource();
};

export default transformer;
