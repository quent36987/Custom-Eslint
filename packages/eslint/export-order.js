/* eslint-disable */

"use strict";

function create(context) {
  const code = context.getSourceCode();
  let lastExport = null;

  for (let i = code.ast.body.length - 1; i >= 0; i--) {
    const bodyNode = code.ast.body[i];

    if (
      bodyNode.type === "ExportNamedDeclaration" &&
      bodyNode.declaration === null &&
      bodyNode.specifiers.length >= 2
    ) {
      for (let i = 0; i < bodyNode.specifiers.length - 1; i++) {
        const name1 = bodyNode.specifiers[i].local;
        const name2 = bodyNode.specifiers[i + 1].local;

        if (name1.name.localeCompare(name2.name) > 0) {
          context.report({
            loc: {
              start: code.getLocFromIndex(name1.range[0]),
              end: code.getLocFromIndex(name1.range[1]),
            },
            message: "export should be order alphabetically",
            fix: function (fixer) {
              return fixer.replaceTextRange(
                [name1.range[0], name2.range[1]],
                `${name2.name}, ${name1.name}`
              );
            },
          });
        }
      }
    }
  }
  return {};
}

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce order of export",
    },
    fixable: "code",
  },
  create: create,
};
