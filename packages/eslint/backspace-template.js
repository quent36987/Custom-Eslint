/* eslint-disable */
"use strict";
const path = require("path");

function defineTemplateBodyVisitor(
  context,
  templateBodyVisitor,
  scriptVisitor,
  options
) {
  if (context.parserServices.defineTemplateBodyVisitor == null) {
    const filename = context.getFilename();
    if (path.extname(filename) === ".vue") {
      context.report({
        loc: { line: 1, column: 0 },
        message:
          "Use the latest vue-eslint-parser. See also https://eslint.vuejs.org/user-guide/#what-is-the-use-the-latest-vue-eslint-parser-error.",
      });
    }
    return {};
  }
  return context.parserServices.defineTemplateBodyVisitor(
    templateBodyVisitor,
    scriptVisitor,
    options
  );
}

function createOrder(context) {
  const sourceCode = context.getSourceCode();

  return defineTemplateBodyVisitor(context, {
    VStartTag(node) {
      if (!node.parent.children) {
        return {};
      }

      // if juste 2 big childs
      if (node.parent.children.length === 5) {
        const prev = node.parent.children[1];
        const next = node.parent.children[3];
        if (
          (!prev.value && prev.loc.start.line !== prev.loc.end.line) ||
          (!next.value && next.loc.start.line !== next.loc.end.line)
        ) {
          const mid = node.parent.children[2];
          if (!mid.value || !mid.value.match(/\n[ \t]*\n/)) {
            context.report({
              node: prev,
              message: "backSpace after block",
              fix(fixer) {
                return fixer.insertTextAfter(prev, "\n");
              },
            });
          }
        }
      }

      //other case
      for (let i = 2; i < node.parent.children.length - 2; i++) {
        const child = node.parent.children[i];

        if (!child.value && child.loc.start.line !== child.loc.end.line) {
          const prev = node.parent.children[i - 1];
          if (!prev.value || !prev.value.match(/\n[ \t]*\n/)) {
            context.report({
              node: child,
              message: "backSpace before block",
              fix(fixer) {
                return fixer.insertTextBefore(child, "\n");
              },
            });
          }

          const next = node.parent.children[i + 1];
          if (!next.value || !next.value.match(/\n[ \t]*\n/)) {
            context.report({
              node: child,
              message: "backSpace after block",
              fix(fixer) {
                return fixer.insertTextAfter(child, "\n");
              },
            });
          }
        }
      }
    },
  });
}

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce order of attributes",
    },
    fixable: "code",
  },
  create: createOrder,
};
