"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function transform(file, api) {
  var j = api.jscodeshift;
  var root = j(file.source);
  root
    .find(j.ImportDeclaration)
    .filter(function (path) {
      return path.node.source.value === "@redwoodjs/router";
    })
    .forEach(function (path) {
      var specifiersToBeMoved = path.node.specifiers.filter(
        function (specifier) {
          return (
            specifier.type === "ImportSpecifier" &&
            specifier.imported.name === "Router"
          );
        },
      );
      var remainingSpecifiers = path.node.specifiers.filter(
        function (specifier) {
          return !(
            specifier.type === "ImportSpecifier" &&
            specifier.imported.name === "Router"
          );
        },
      );
      if (specifiersToBeMoved.length > 0) {
        // Create a new import for Router from '@redwoodjs/vite/Router'
        var newRouterImport = j.importDeclaration(
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
exports.default = transform;
