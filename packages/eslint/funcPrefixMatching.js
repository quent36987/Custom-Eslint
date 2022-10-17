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

function ReportIssue() {
  const sorted = SortCssTab(cssProperties);

  const classstring = sorted.join("");

  const debut = sourceCode.text.match(test1[0]);
  console.log("where", sourceCode.text.match(test1[0]));
  let finddebut = 0;
  while (debut[0][finddebut] !== "{") {
    finddebut += 1;
  }

  console.log("placec:", [
    debut.index + finddebut + 1,
    debut.index + debut[0].length,
  ]);

  if (sourceCode.lines[18].startsWith("  display")) {
    context.report({
      loc: { start: { line: 18, column: 3 }, end: { line: 18, column: 20 } },
      message: `Attribute 4141 should go before 41414141.`,
      fix(fixer) {
        return fixer.replaceTextRange(
          [debut.index + finddebut + 2, debut.index + debut[0].length - 1],
          classstring
        );
      },
    });
  }
}

function isValidClass(cssClass) {
  const regexCssProperties = /[ \ta-z-]*:[ \n.()a-z0-9-]*;\n|\n/g;
  const cssProperties = cssClass.match(regexCssProperties);

  let level = -1;
  let position = 0;

  let index = 0;
  while (index < cssProperties.length) {
    const line = cssProperties[index];

    if (line === "\n" && index + 1 < cssProperties.length) {
      const nextLine = getPosition(cssProperties[index + 1]);

      if (level !== -1 && nextLine.level === level) {
        console.log("error backspace", index);
      }

      level = nextLine.level;
      position = nextLine.position;
      index += 1;
    } else {
      const linePos = getPosition(line);
      if (-1 === linePos.level || -1 === linePos.position) {
        console.log("unknow", index, line);
      } else if (level !== linePos.level || position > linePos.position) {
        console.log("error strong place", index, line);
      } else if (position === linePos.position && index > 1) {
        if (line.localeCompare(cssProperties[index - 1]) === -1) {
          console.log("error strong place alphabetic", index, line);
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

  const regexClassCss = /\.[ a-z-]*\{\n((([ a-z-]*:[ \n()a-z.0-9-]*;)*\n)*)}/g;
  const cssClasses = sourceCodeCss[0].match(regexClassCss);

  for (let i = 0; i < cssClasses.length; i++) {
    isValidClass(cssClasses[i]);
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
