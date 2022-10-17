/* eslint-disable */

"use strict";

const rules = [
  ["--[a-z-]*"],
  ["display", "flex-direction", "justify-content", "align-items"],
  ["position", "top", "right", "margin[a-z-]*"],
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

// objectA < objectB => true
function sortClass(objectA, objectB) {
  if (objectA.level !== objectB.level) {
    return objectA.level < objectB.level ? -1 : 1;
  }

  if (objectA.position === objectB.position) {
    return objectA.value.localeCompare(objectB.value) === -1 ? -1 : 1;
  }

  return objectA.position < objectB.position ? -1 : 1;
}

function getTabSorted(tab) {
  const tabfilter = tab.filter((value) => value !== "\n");

  const objetTab = tabfilter.map((value) => {
    return { ...getPosition(value), value };
  });

  const sorted = objetTab.sort((obj1, obj2) => {
    return sortClass(obj1, obj2);
  });

  console.log("sorted", sorted);
}

function createOrder(context) {
  const sourceCode = context.getSourceCode();

  // console.log("sourceCode.ast",sourceCode);
  const regex = /<style scoped>\n((.*\n)*)<\/style>/;
  const test = sourceCode.text.match(regex);
  //console.log("test",test[0]);
  const regex1 = /\.[ a-z-]*\{\n((([ a-z-]*:[ \n()a-z.0-9-]*;)*\n)*)}/g;
  const test1 = test[0].match(regex1);

  //console.log(test1);

  //console.log('where',sourceCode.text.match(test1[0]));

  const myclass = [];

  const regex_attribu = /[ \ta-z-]*:[ \n.()a-z0-9-]*;\n|\n/g;

  const classTab = test1[0].match(regex_attribu);
  console.log(classTab);

  // trie le tab => si pas de modif, suivant, sinon error + fix :}

  let level = -1;
  let position = 0;

  let index = 0;

  getTabSorted(classTab);
  return {};

  while (index < classTab.length) {
    const line = classTab[index];

    if (line === "\n" && index + 1 < classTab.length) {
      const nextLine = getPosition(classTab[index + 1]);

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
        if (line.localeCompare(classTab[index - 1]) === -1) {
          console.log("error strong place alphabetic", index, line);
        }
      }
      position = linePos.position;
    }
    index += 1;
  }

  /*function reportIssue() {
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
  reportIssue();*/

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
