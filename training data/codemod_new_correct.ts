import {
  API,
  Collection,
  FileInfo,
  ImportDeclaration,
  JSCodeshift,
} from "jscodeshift";

// A helper function to check if a specific specifier is present in an import declaration.
function hasSpecifier(
  importDeclaration: ImportDeclaration,
  specifierName: string,
): boolean {
  return (
    importDeclaration.specifiers?.some(
      (specifier) =>
        specifier.type === "ImportSpecifier" &&
        specifier.imported.name === specifierName,
    ) ?? false
  );
}

export default function transformer(file: FileInfo, api: API): string {
  const j: JSCodeshift = api.jscodeshift;
  const root: Collection = j(file.source);

  // Find all import declarations that import from '@redwoodjs/router'
  root
    .find(j.ImportDeclaration, { source: { value: "@redwoodjs/router" } })
    .forEach((declarationPath) => {
      const node = declarationPath.node;

      // If the import declaration includes 'Router', handle it accordingly
      if (hasSpecifier(node, "Router")) {
        // Remove 'Router' from the initial import declaration
        node.specifiers = node.specifiers?.filter((specifier) => {
          return !(
            specifier.type === "ImportSpecifier" &&
            specifier.imported.name === "Router"
          );
        });

        // Add a new import declaration for 'Router' from '@redwoodjs/vite/Router'
        const newImport = j.importDeclaration(
          [j.importSpecifier(j.identifier("Router"))],
          j.literal("@redwoodjs/vite/Router"),
        );

        // Insert the new import declaration before the current import statement
        j(declarationPath).insertBefore(newImport);
      }

      // If there are no more specifiers left in the import, remove the import statement
      if (node.specifiers?.length === 0) {
        j(declarationPath).remove();
      }
    });

  return root.toSource();
}
