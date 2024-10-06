import { API, Collection, FileInfo, JSCodeshift } from "jscodeshift";

function transform(file: FileInfo, api: API): string {
  const j: JSCodeshift = api.jscodeshift;
  const root: Collection = j(file.source);

  root
    .find(j.ImportDeclaration)
    .filter((path) => path.node.source.value === "@redwoodjs/router")
    .forEach((path) => {
      const specifiersToBeMoved = path.node.specifiers.filter(
        (specifier) =>
          specifier.type === "ImportSpecifier" &&
          specifier.imported.name === "Router",
      );

      const remainingSpecifiers = path.node.specifiers.filter(
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
