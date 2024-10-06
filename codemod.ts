import { API, FileInfo } from "jscodeshift";

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.ImportDeclaration, {
      source: { value: "@redwoodjs/router" },
    })
    .forEach((path) => {
      const specifiers = path.node.specifiers.map((specifier) => {
        if (specifier.local.name === "Router") {
          return j.importSpecifier(
            j.identifier(specifier.local.name),
            j.identifier("Router"),
          );
        } else {
          return j.importSpecifier(
            j.identifier(specifier.local.name),
            j.identifier(specifier.local.name),
          );
        }
      });

      const newRouterImport = j.importDeclaration(
        [specifiers[0]],
        j.stringLiteral("@redwoodjs/vite/Router"),
      );

      const newRouteImport = j.importDeclaration(
        [specifiers[1]],
        j.stringLiteral("@redwoodjs/router"),
      );

      j(path).replaceWith([newRouterImport, newRouteImport]);
    })
    .toSource();
}
