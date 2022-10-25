/* eslint-disable */

"use strict";

function addExport(code, fixer, lastExport, names) {
  if (lastExport === null) {
    return fixer.insertTextAfter(
      code.ast.body[code.ast.body.length - 1],
      `\n\nexport {${names}}`
    );
  }
  return fixer.insertTextAfter(getFirstValue(code, lastExport, "{"), names);
}

function create(context) {
  const code = context.getSourceCode();
  let lastExport = null;
  let isLastNode = true;

  for (let i = code.ast.body.length - 1; i >= 0; i--) {
    const bodyNode = code.ast.body[i];

    if (bodyNode.type === "ExportNamedDeclaration") {
      if (bodyNode.declaration !== null) {
        handleDirect(context, code, bodyNode, lastExport);
      } else if (bodyNode.source !== null) {
        handleFrom(context, code, bodyNode, lastExport);
      } else {
        if (bodyNode.specifiers.length === 0) {
          handleUseless(context, code, bodyNode);
        } else if (lastExport === null) {
          if (!isLastNode) {
            handleLast(context, code, bodyNode);
          } else {
            lastExport = bodyNode;
          }
        } else {
          handleMultiple(context, code, bodyNode, lastExport);
        }
      }
    }
    isLastNode = false;
  }
  return {};
}

function getFirstValue(code, node, value) {
  return code.getFirstToken(node, {
    skip: 0,
    includeComments: false,
    filter: (token) => {
      return token.value === value;
    },
  });
}

function getDeclarationName(node) {
  switch (node.type) {
    case "ClassDeclaration":
    case "FunctionDeclaration":
    case "TSEnumDeclaration":
    case "TSInterfaceDeclaration":
    case "TSTypeAliasDeclaration":
      return ` ${node.id.name},`;
    case "VariableDeclaration":
      let names = "";

      for (const declaration of node.declarations) {
        names = names.concat(` ${declaration.id.name},`);
      }

      return names;
    default:
      console.log("new type declaration =[", node.type, "]");
      return null;
  }
}

function getSpecifierNames(node) {
  let names = "";

  for (const specifier of node.specifiers) {
    names = names.concat(` ${specifier.local.name},`);
  }

  return names;
}

function handleDirect(context, code, node, lastExport) {
  context.report({
    node: node,
    message: "no direct export allowed",
    *fix(fixer) {
      const EXPORT_TOKEN = getFirstValue(code, node, "export");
      const NAME = getDeclarationName(node.declaration);

      if (NAME === null) {
        return;
      }

      yield fixer.remove(EXPORT_TOKEN);

      yield addExport(code, fixer, lastExport, NAME);
    },
  });
}

function handleFrom(context, code, node, lastExport) {
  context.report({
    node: node,
    message: "no export from allowed",
    *fix(fixer) {
      const EXPORT_TOKEN = getFirstValue(code, node, "export");

      yield fixer.replaceText(EXPORT_TOKEN, "import");

      yield addExport(code, fixer, lastExport, getSpecifierNames(node));
    },
  });
}

function handleLast(context, code, node) {
  context.report({
    node: node,
    message: "export should always be at the end",
    *fix(fixer) {
      yield fixer.remove(node);

      yield fixer.insertTextAfter(
        code.ast.body[code.ast.body.length - 1],
        `\n\n${code.getText(node)}`
      );
    },
  });
}

function handleMultiple(context, code, node, lastExport) {
  context.report({
    node: node,
    message: "only one export per file",
    *fix(fixer) {
      yield fixer.remove(node);

      yield fixer.insertTextAfter(
        getFirstValue(code, lastExport, "{"),
        getSpecifierNames(node)
      );
    },
  });
}

function handleUseless(context, node) {
  context.report({
    node: node,
    message: "no useless export",
    fix: function (fixer) {
      return fixer.remove(node);
    },
  });
}

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce order of css",
    },
    fixable: "code",
  },
  create: create,
};
