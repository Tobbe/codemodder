import {
  API,
  Collection,
  FileInfo,
  ImportSpecifier,
  JSCodeshift,
} from "jscodeshift";

function transform(file: FileInfo, api: API): string {
  const j: JSCodeshift = api.jscodeshift;
  const root: Collection = j(file.source);

  root
    .find(j.ImportDeclaration)
    .filter((path) => path.node.source.value === "@redwoodjs/router")
    .forEach((path) => {
      const specifiers = path.node.specifiers;

      if (!specifiers) {
        // Ensure specifiers is not undefined
        return;
      }

      // Filter specifiers to find those to be moved to the new import
      const specifiersToBeMoved = (specifiers as ImportSpecifier[]).filter(
        (specifier) =>
          specifier.type === "ImportSpecifier" &&
          specifier.imported.name === "Router",
      );

      // Determine the remaining specifiers for the current import declaration
      const remainingSpecifiers = (specifiers as ImportSpecifier[]).filter(
        (specifier) =>
          !(
            specifier.type === "ImportSpecifier" &&
            specifier.imported.name === "Router"
          ),
      );

      if (specifiersToBeMoved.length > 0) {
        // Create a new import for Router from '@redwoodjs/vite/Router'
        const newRouterImport = j.importDeclaration(
          specifiersToBeMoved,
          j.literal("@redwoodjs/vite/Router"),
        );

        // Insert the new Router import before the current one
        j(path).insertBefore(newRouterImport);

        // Update the existing import declaration to exclude 'Router'
        if (remainingSpecifiers.length > 0) {
          path.node.specifiers = remainingSpecifiers;
        } else {
          j(path).remove(); // Remove the entire import if there are no remaining specifiers
        }
      }
    });

  return root.toSource();
}

export default transform;
