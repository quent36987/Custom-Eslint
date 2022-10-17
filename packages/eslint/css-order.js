/* eslint-disable */

"use strict";

const rules = [
  ["--[a-z-]*"],
  ["display", "flex-direction", "justify-content", "align-items"],
  ["position", "top", "right", "margin[a-z-]*"],
  ["width", "opacity"],
];

function getPosition(value) {
  for (let level = 0; level < rules.length; level++) {
    for (let pos = 0; pos < rules[level].length; pos++) {
      const regexPrefix = `^[ \t]*${rules[level][pos]}:`;

      if (value.match(regexPrefix)) {
        return {
          level,
          position: pos,
        };
      }
    }
  }

  return {
    level: -1,
    position: -1,
  };
}

// objectA < objectB => -1 otherwise 1
function SortCssObjet(objectA, objectB) {
  if (objectA.level !== objectB.level) {
    return objectA.level < objectB.level ? -1 : 1;
  }

  if (objectA.position === objectB.position) {
    return objectA.value.localeCompare(objectB.value) === -1 ? -1 : 1;
  }

  return objectA.position < objectB.position ? -1 : 1;
}

// get ['  display:xx;','  flex:xxx;'] and return same sorted
function SortCssTab(cssTab) {
  const withoutBackSpace = cssTab.filter((value) => value !== "\n");

  const CssObjects = withoutBackSpace.map((value) => {
    return { ...getPosition(value), value };
  });

  const CssObjectsSorted = CssObjects.sort((obj1, obj2) => {
    return SortCssObjet(obj1, obj2);
  });

  // add \n between level
  const withBackSpace = [];

  for (let i = 0; i < CssObjectsSorted.length; i++) {
    withBackSpace.push(CssObjectsSorted[i].value);

    if (
      i < CssObjectsSorted.length - 1 &&
      CssObjectsSorted[i].level !== CssObjectsSorted[i + 1].level
    ) {
      withBackSpace.push("\n");
    }
  }

  return withBackSpace;
}

function ReportIssue(cssProperties, cssClass, sourceCode, context, message) {
  const cssPropertiesSorted = SortCssTab(cssProperties);
  const cssSortedText = cssPropertiesSorted.join("");

  const cssClassMatch = sourceCode.text.match(cssClass);

  let indexFirstProperties = 0;
  while (cssClassMatch[0][indexFirstProperties] !== "{") {
    indexFirstProperties += 1;
  }

  const regex = /\.[a-z- ]*{/;
  const cssClassName = cssClass.match(regex);

  let line = 0;
  while (
    line < sourceCode.lines.length &&
    sourceCode.lines[line].match(cssClassName[0]) === null
  ) {
    line += 0;
  }

  context.report({
    loc: {
      start: { line: line + 1, column: 3 },
      end: { line: line + 1, column: 20 },
    },
    message,
    fix(fixer) {
      return fixer.replaceTextRange(
        [
          cssClassMatch.index + indexFirstProperties + 2,
          cssClassMatch.index + cssClassMatch[0].length - 1,
        ],
        cssSortedText
      );
    },
  });
}

function isValidClass(cssClass, sourceCode, context) {
  const regexCssProperties = /[ \ta-z-]*:[ \n.()#,a-zA-Z0-9-]*;\n|\n/g;
  const cssProperties = cssClass.match(regexCssProperties);

  let level = -1;
  let position = 0;

  let index = 0;
  while (index < cssProperties.length) {
    const line = cssProperties[index];

    if (line === "\n" && index + 1 < cssProperties.length) {
      const nextLine = getPosition(cssProperties[index + 1]);

      if (level !== -1 && nextLine.level === level) {
        ReportIssue(cssProperties, cssClass, sourceCode, context, "backspace");
      }

      level = nextLine.level;
      position = nextLine.position;
      index += 1;
    } else {
      const linePos = getPosition(line);
      if (-1 === linePos.level || -1 === linePos.position) {
        console.log("unknow", index, line);
      } else if (level !== linePos.level || position > linePos.position) {
        ReportIssue(cssProperties, cssClass, sourceCode, context, "order");
      } else if (position === linePos.position && index > 1) {
        if (line.localeCompare(cssProperties[index - 1]) === -1) {
          ReportIssue(cssProperties, cssClass, sourceCode, context, "order");
        }
      }
      position = linePos.position;
    }
    index += 1;
  }
}

function create(context) {
  const sourceCode = context.getSourceCode();

  const regexCssCode = /<style scoped>\n((.*\n)*)<\/style>/;
  const sourceCodeCss = sourceCode.text.match(regexCssCode);

  if (sourceCodeCss === null) {
    return {};
  }

  const regexClassCss = /\.[ a-z-]*\{\n((([ a-z-]*:[ \n()a-z.0-9-]*;)*\n)*)}/g;
  const cssClasses = sourceCodeCss[0].match(regexClassCss);

  for (let i = 0; i < cssClasses.length; i++) {
    isValidClass(cssClasses[i], sourceCode, context);
  }

  return {};
}

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce order of css",
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        additionalProperties: false,
      },
    ],
  },
  create: create,
};
