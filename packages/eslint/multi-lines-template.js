/* eslint-disable */

("use strict");
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

function isVBind(node) {
  return Boolean(node && node.directive && node.key.name.name === "bind");
}

function isVAttribute(node) {
  return Boolean(node && !node.directive);
}

function isVAttributeOrVBind(node) {
  return isVAttribute(node) || isVBind(node);
}

function isVBindObject(node) {
  return isVBind(node) && node.key.argument == null;
}

function createOrder(context) {
  function reportIssue(node) {
    context.report({
      node,
      message: `No multi-line TS code in html`,
    });
  }

  return defineTemplateBodyVisitor(context, {
    VStartTag(node) {
      const attributeAndPositions = getAttributeAndPositionList(node);

      for (let index = 0; index < attributeAndPositions.length; index++) {
        if (
          attributeAndPositions[index].attr.loc.start.line !==
          attributeAndPositions[index].attr.loc.end.line
        ) {
          reportIssue(attributeAndPositions[index].attr);
        }
      }

      if (attributeAndPositions.length <= 1) {
        return;
      }
    },
  });

  function getAttributeAndPositionList(node) {
    const attributes = node.attributes.filter((node, index, attributes) => {
      if (
        isVBindObject(node) &&
        (isVAttributeOrVBind(attributes[index - 1]) ||
          isVAttributeOrVBind(attributes[index + 1]))
      ) {
        return false;
      }
      return true;
    });

    const results = [];
    for (let index = 0; index < attributes.length; index++) {
      const attr = attributes[index];
      results.push({ attr });
    }

    return results;
  }
}

module.exports = {
  create: createOrder,
};
