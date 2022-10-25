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

const ATTRS = {
  DEFINITION: "DEFINITION",
  LIST_RENDERING: "LIST_RENDERING",
  CONDITIONALS: "CONDITIONALS",
  RENDER_MODIFIERS: "RENDER_MODIFIERS",
  UNIQUE: "UNIQUE",
  TWO_WAY_BINDING: "TWO_WAY_BINDING",
  OTHER_DIRECTIVES: "OTHER_DIRECTIVES",
  BIND_ATTR: "BIND_ATTR", // :any-bound-prop="..."
  OTHER_ATTR: "OTHER_ATTR", // any-unbound-prop="..."
  BOOL_ATTR: "BOOL_ATTR", // any-boolean-prop
  EVENTS: "EVENTS",
};

function isVBind(node) {
  return Boolean(
    node &&
      node.directive &&
      node.key.name.name === "bind" &&
      node.key.argument !== null
  );
}

function getAttributeName(attribute, sourceCode) {
  if (attribute.directive) {
    if (isVBind(attribute)) {
      return attribute.key.argument
        ? sourceCode.getText(attribute.key.argument)
        : "";
    } else {
      return getDirectiveKeyName(attribute.key, sourceCode);
    }
  } else {
    return attribute.key.name;
  }
}

function getDirectiveKeyName(directiveKey, sourceCode) {
  let text = `v-${directiveKey.name.name}`;
  if (directiveKey.argument) {
    text += `:${sourceCode.getText(directiveKey.argument)}`;
  }
  for (const modifier of directiveKey.modifiers) {
    text += `.${modifier.name}`;
  }
  return text;
}

function getAttributeType(attribute) {
  let propName;
  if (attribute.directive) {
    if (!isVBind(attribute)) {
      const name = attribute.key.name.name;
      if (name === "for") {
        return ATTRS.LIST_RENDERING;
      } else if (
        name === "if" ||
        name === "else-if" ||
        name === "else" ||
        name === "show" ||
        name === "cloak"
      ) {
        return ATTRS.CONDITIONALS;
      } else if (name === "pre" || name === "once") {
        return ATTRS.RENDER_MODIFIERS;
      } else if (name === "model") {
        return ATTRS.TWO_WAY_BINDING;
      } else if (name === "on") {
        return ATTRS.EVENTS;
      } else if (name === "is") {
        return ATTRS.DEFINITION;
      } else {
        return ATTRS.OTHER_DIRECTIVES;
      }
    }
    propName =
      attribute.key.argument && attribute.key.argument.type === "VIdentifier"
        ? attribute.key.argument.rawName
        : "";
  } else {
    propName = attribute.key.name;
  }
  if (propName === "is") {
    return ATTRS.DEFINITION;
  } else if (propName === "key") {
    return ATTRS.UNIQUE;
  } else if (propName === "slot" || propName === "slot-scope") {
    return ATTRS.SLOT;
  } else {
    if (attribute.value === null) {
      return ATTRS.BOOL_ATTR;
    }
    if (attribute.key.type === "VDirectiveKey") {
      return ATTRS.BIND_ATTR;
    }
    return ATTRS.OTHER_ATTR;
  }
}

function getPosition(attribute, attributePosition) {
  const attributeType = getAttributeType(attribute);
  return attributePosition[attributeType] != null
    ? attributePosition[attributeType]
    : null;
}

function isAlphabetical(prevNode, currNode, sourceCode) {
  const prevName = getAttributeName(prevNode, sourceCode);
  const currName = getAttributeName(currNode, sourceCode);
  if (prevName === currName) {
    const prevIsBind = isVBind(prevNode);
    const currIsBind = isVBind(currNode);
    return prevIsBind <= currIsBind;
  }
  return prevName < currName;
}

function createOrder(context) {
  const sourceCode = context.getSourceCode();

  let attributeOrder = [
    ATTRS.CONDITIONALS,
    ATTRS.DEFINITION,
    ATTRS.LIST_RENDERING,
    ATTRS.UNIQUE,
    [ATTRS.TWO_WAY_BINDING, ATTRS.OTHER_DIRECTIVES, ATTRS.RENDER_MODIFIERS],
    ATTRS.BIND_ATTR, // :any-bound-prop="..."
    ATTRS.OTHER_ATTR, // any-bound-prop="..."
    ATTRS.BOOL_ATTR, // any-boolean-prop
    ATTRS.EVENTS,
  ];
  if (context.options[0] && context.options[0].order) {
    attributeOrder = context.options[0].order;
  }
  const alphabetical = Boolean(
    context.options[0] && context.options[0].alphabetical
  );

  const attributePosition = {};
  attributeOrder.forEach((item, i) => {
    if (Array.isArray(item)) {
      for (const attr of item) {
        attributePosition[attr] = i;
      }
    } else attributePosition[item] = i;
  });

  function reportIssue(node, previousNode) {
    const currentNode = sourceCode.getText(node.key);
    const prevNode = sourceCode.getText(previousNode.key);
    context.report({
      node,
      message: `Attribute "${currentNode}" should go before "${prevNode}".`,
      data: {
        currentNode,
      },

      fix(fixer) {
        const attributes = node.parent.attributes;

        const previousNodes = attributes.slice(
          attributes.indexOf(previousNode),
          attributes.indexOf(node)
        );
        const moveNodes = [node];
        for (const node of previousNodes) {
          moveNodes.push(node);
        }

        return moveNodes.map((moveNode, index) => {
          const text = sourceCode.getText(moveNode);
          return fixer.replaceText(previousNodes[index] || node, text);
        });
      },
    });
  }

  return defineTemplateBodyVisitor(context, {
    VStartTag(node) {
      const attributeAndPositions = getAttributeAndPositionList(node);
      if (attributeAndPositions.length <= 1) {
        return;
      }

      let { attr: previousNode, position: previousPosition } =
        attributeAndPositions[0];
      for (let index = 1; index < attributeAndPositions.length; index++) {
        const { attr, position } = attributeAndPositions[index];
        let valid = previousPosition <= position;
        if (valid && alphabetical && previousPosition === position) {
          valid = isAlphabetical(previousNode, attr, sourceCode);
        }
        if (valid) {
          previousNode = attr;
          previousPosition = position;
        } else {
          reportIssue(attr, previousNode);
        }
      }
    },
  });

  function getAttributeAndPositionList(node) {
    const attributes = node.attributes;

    const results = [];
    for (let index = 0; index < attributes.length; index++) {
      const attr = attributes[index];
      const position = getPositionFromAttrIndex(index);
      if (position == null) {
        // The omitted order is skipped.
        continue;
      }
      results.push({ attr, position });
    }

    return results;

    function getPositionFromAttrIndex(index) {
      const node = attributes[index];

      return getPosition(node, attributePosition);
    }
  }
}

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce order of attributes",
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          order: {
            type: "array",
            items: {
              anyOf: [
                { enum: Object.values(ATTRS) },
                {
                  type: "array",
                  items: {
                    enum: Object.values(ATTRS),
                    uniqueItems: true,
                    additionalItems: false,
                  },
                },
              ],
            },
            uniqueItems: true,
            additionalItems: false,
          },
          alphabetical: { type: "boolean" },
        },
        additionalProperties: false,
      },
    ],
  },
  create: createOrder,
};
