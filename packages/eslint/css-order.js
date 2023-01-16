"use strict";

let defaultLevel = 4;

let rules = [
  ["--[a-z-]*"],
  ["display", "flex-direction", "justify-content", "align-items"],
  ["position", "top", "right", "bottom", "left", "z-index"],
  [
    "top",
    "min-height",
    "height",
    "max-height",
    "min-width",
    "width",
    "max-width",
    "margin[a-z-]*",
    "padding[a-z-]*",
  ],
  [],
  ["flex", "grid-column-start", "grid-column-end", "justify-self"],
];

let defaultOrder = ["top", "right", "bottom", "left", "start", "end"];

const REGEX_CSS_BALISE = /<style (scoped)?>\n((.*\n)*)<\/style>/;
const REGEX_CSS_PROPERTIES = /[ \ta-z-]*:[^;{}]*;\n|\n/g;
const REGEX_CLASS_CSS = /[ \t]*[.#@][^\n{]*\{\n((([ a-z-]*:[^;}]*;)*\n)*)[ \t]*}/g;
const REGEX_CSS_CLASS_NAME = /[ \t]*[.#@][^\n{]*\{/;

// return { position, value } in default order if match with one
// example : getDefaultPos(margin-top) => { 0, "margin-" }
function getDefaultPos(value) {
  for (let i = 0; i < defaultOrder.length; i++) {
    if (value.match(defaultOrder[i])) {
      return {
        position: i,
        value: value
          .substring(0, value.match(defaultOrder[i]).index)
          .replace(/[ \t]*/, ""),
      };
    }
  }

  return { position: -1 };
}

// return {level, position } if match with rules {defaultLevel, 0} otherwise
function getPosition(value) {
  if (!value) {
    return {
      level: defaultLevel,
      position: 0,
    };
  }

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
    level: defaultLevel,
    position: 0,
  };
}

// return objectA < objectB
function SortCssObjet(objectA, objectB) {
  if (objectA.level !== objectB.level) {
    return objectA.level < objectB.level;
  }

  if (objectA.position !== objectB.position) {
    return objectA.position < objectB.position;
  }

  const defaultObjA = getDefaultPos(objectA.value);
  const defaultObjB = getDefaultPos(objectB.value);

  if (defaultObjA.position !== -1 && defaultObjB.position !== -1) {
    if (defaultObjA.value === defaultObjB.value) {
      return defaultObjA.position < defaultObjB.position;
    }
  }

  return (
    objectA.value
      .replace(":", " ")
      .localeCompare(objectB.value.replace(":", " ")) === -1
  );
}

// get ['  display:xx;','  flex:xxx;'] and return same sorted with backspace between level
function SortCssTab(cssTab) {
  const withoutBackSpace = cssTab.filter((value) => value !== "\n");

  const CssObjects = withoutBackSpace.map((value) => {
    return { ...getPosition(value), value };
  });

  const CssObjectsSorted = CssObjects.sort((obj1, obj2) => {
    return SortCssObjet(obj1, obj2) ? -1 : 1;
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
  // we create a string with all the property in the right order
  const cssPropertiesSorted = SortCssTab(cssProperties);
  const cssSortedText = cssPropertiesSorted.join("");

  // we need to find the range of the css class to replace all the property by "cssSortedText"
  const cssClassName = cssClass.match(REGEX_CSS_CLASS_NAME);

  if (!cssClassName) {
    return;
  }

  const ClassName = cssClassName[0].replace(/([*+])/, "\\$1");

  // check if only one class has this name in the file
  const regex = new RegExp(ClassName, "g");
  const isCssClassSolo = sourceCode.text.match(regex);

  if (isCssClassSolo !== null && isCssClassSolo.length > 1) {
    return;
  }

  const cssClassNameIndex = sourceCode.text.match(ClassName);

  if (!cssClassNameIndex) {
    return;
  }

  let indexFirstProperties = cssClassName[0].length;

  // we need to find the line of the css class declaration to put a error message
  let line = 0;

  while (
    line < sourceCode.lines.length &&
    sourceCode.lines[line].match(cssClassName[0]) === null
    ) {
    line += 1;
  }

  // send the error with a fix
  context.report({
    loc: {
      start: { line: line + 1, column: 5 },
      end: { line: line + 1, column: 25 },
    },
    message,
    fix(fixer) {
      return fixer.replaceTextRange(
        [
          cssClassNameIndex.index + indexFirstProperties + 1,
          cssClassNameIndex.index + cssClass.length - 1,
        ],
        cssSortedText
      );
    },
  });
}

// get the property name : getPropertyName("bla-bla:xxxx") => "bla-bla:"
function getPropertyName(value) {
  const name = value.match(/[^:]*:/);
  return name ? name[0].replace(/[ \t]*/, "") : value;
}

// verify all property, if one is not in the right order, send an error
function isValidClass(cssClass, sourceCode, context) {
  const cssProperties = cssClass.match(REGEX_CSS_PROPERTIES);

  if (cssProperties === null || cssProperties.length <= 1) {
    return {};
  }

  let level = -1;
  let position = 0;

  let index = 0;

  while (index < cssProperties.length) {
    const line = cssProperties[index];

    if (line === "\n") {
      if (index + 1 === cssProperties.length) {
        ReportIssue(
          cssProperties,
          cssClass,
          sourceCode,
          context,
          "backspace"
        );
      }

      const nextLine = getPosition(cssProperties[index + 1]);

      if (level !== -1 && nextLine.level <= level) {
        const message = `backspace [${getPropertyName(
          cssProperties[index + 1]
        )}}]`;

        ReportIssue(
          cssProperties,
          cssClass,
          sourceCode,
          context,
          message
        );
      }

      level = nextLine.level;
      position = nextLine.position;
      index += 1;
    } else {
      const linePos = getPosition(line);

      if (level !== linePos.level || position > linePos.position) {
        const message = `order [${getPropertyName(line)}]`;
        ReportIssue(
          cssProperties,
          cssClass,
          sourceCode,
          context,
          message
        );
      } else if (position === linePos.position && index > 1) {
        const ObjetA = {
          ...getPosition(cssProperties[index - 1]),
          value: cssProperties[index - 1],
        };

        const ObjetB = { ...linePos, value: line };

        if (!SortCssObjet(ObjetA, ObjetB)) {
          const message = `order [${getPropertyName(line)}]`;
          ReportIssue(
            cssProperties,
            cssClass,
            sourceCode,
            context,
            message
          );
        }
      }

      position = linePos.position;
    }

    index += 1;
  }
}

function create(context) {
  const sourceCode = context.getSourceCode();

  if (context.options[0]) {
    if (context.options[0].order) {
      rules = context.options[0].order;
    }

    if (context.options[0].default) {
      defaultLevel = context.options[0].default;
    }

    if (context.options[0].defaultOrder) {
      defaultOrder = context.options[0].defaultOrder;
    }
  }

  const sourceCodeCss = sourceCode.text.match(REGEX_CSS_BALISE);

  if (sourceCodeCss === null) {
    return {};
  }

  const cssClasses = sourceCodeCss[0].match(REGEX_CLASS_CSS);

  if (cssClasses === null) {
    return {};
  }

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
        properties: {
          default: {
            type: "number",
          },
          defaultOrder: {
            type: "array",
            uniqueItems: true,
            additionalItems: true,
          },
          order: {
            type: "array",
            uniqueItems: true,
            additionalItems: true,
          },
        },
      },
    ],
  },
  create: create,
};
