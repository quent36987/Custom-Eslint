/* eslint-disable */

"use strict";

function createOrder(context) {
  const sourceCode = context.getSourceCode();

  console.log("sourceCode.ast");

  function reportIssue() {
    if (sourceCode.lines[17].startsWith("  display")) {
      context.report({
        loc: { start: { line: 18, column: 3 }, end: { line: 18, column: 20 } },
        message: `Attribute 4141 should go before 41414141.`,
        fix(fixer) {
          return fixer.replaceTextRange([281, 302], "COUCOU");
        },
      });
    }
  }
  reportIssue();

  return {};
}

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce order of attributes",
      categories: ["vue3-recommended", "recommended"],
      url: "https://eslint.vuejs.org/rules/attributes-order.html",
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        additionalProperties: false,
      },
    ],
  },
  create: createOrder,
};
