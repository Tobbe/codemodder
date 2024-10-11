import { API, FileInfo, JSCodeshift, Collection } from "jscodeshift";

// Type definitions for import specifiers and their names
type ImportSpecifier = {
  imported: string;
  local: string;
};

// Retrieve import specifiers for a specific source module
function getImportSpecifiers(
  root: Collection,
  j: JSCodeshift,
  source: string,
): ImportSpecifier[] {
  const importDeclarations = root.find(j.ImportDeclaration, {
    source: { value: source },
  });

  const specifiers: ImportSpecifier[] = [];
  importDeclarations.forEach((path) => {
    path.node.specifiers?.forEach((specifier) => {
      if (specifier.type === "ImportSpecifier") {
        specifiers.push({
          imported: specifier.imported.name,
          local: specifier.local.name,
        });
      }
    });
  });

  return specifiers;
}

// Main function to transform the code
function transformer(file: FileInfo, api: API): string {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Get all specifiers for the '@redwoodjs/router' module
  const specifiers = getImportSpecifiers(root, j, "@redwoodjs/router");

  if (specifiers.length === 0) return file.source;

  // Separate Router and non-Router specifiers
  const routerSpecifiers = specifiers.filter((s) => s.imported === "Router");
  const nonRouterSpecifiers = specifiers.filter((s) => s.imported !== "Router");

  // Remove old imports
  root
    .find(j.ImportDeclaration, { source: { value: "@redwoodjs/router" } })
    .remove();

  // Add import for Router from the new module if there's any Router specifier
  routerSpecifiers.forEach((routerSpecifier) => {
    root
      .get()
      .node.program.body.unshift(
        j.importDeclaration(
          [
            j.importSpecifier(
              j.identifier(routerSpecifier.imported),
              j.identifier(routerSpecifier.local),
            ),
          ],
          j.literal("@redwoodjs/vite/Router"),
        ),
      );
  });

  // Add non-Router imports back to '@redwoodjs/router'
  if (nonRouterSpecifiers.length > 0) {
    root.get().node.program.body.unshift(
      j.importDeclaration(
        nonRouterSpecifiers.map((specifier) =>
          j.importSpecifier(
            j.identifier(specifier.imported),
            j.identifier(specifier.local),
          ),
        ),
        j.literal("@redwoodjs/router"),
      ),
    );
  }

  return root.toSource();
}

export default transformer;
