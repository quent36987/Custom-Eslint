// eslint-disable-next-line no-undef
module.exports = {
  extends: ["plugin:vue/essential", "eslint:recommended", "@vue/prettier"],
  parserOptions: { project: "./tsconfig.json" },
  plugins: ["my-lint"],
  rules: {
    "my-lint/backspace-template": "error",
    "padding-line-between-statements": [
      "error",
      {
        blankLine: "always",
        next: "return",
        prev: "*",
      },
      {
        blankLine: "always",
        next: "*",
        prev: "block-like",
      },
      {
        blankLine: "always",
        next: "block-like",
        prev: "*",
      },
      {
        blankLine: "always",
        next: "*",
        prev: "multiline-expression",
      },
      {
        blankLine: "always",
        next: "multiline-expression",
        prev: "*",
      },
      {
        blankLine: "always",
        next: "*",
        prev: "multiline-const",
      },
      {
        blankLine: "always",
        next: "multiline-const",
        prev: "*",
      },
      {
        blankLine: "always",
        next: "*",
        prev: "multiline-let",
      },
      {
        blankLine: "always",
        next: "multiline-let",
        prev: "*",
      },
    ],
    "my-lint/css-order": [
      "error",
      {
        default: 4,
        defaultOrder: ["top", "right", "bottom", "left", "start", "end"],
        order: [
          ["--[a-z-]*"],
          ["display", "flex-direction", "justify-content", "align-items"],
          ["position", "top", "right", "bottom", "left", "z-index"],
          [
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
        ],
      },
    ],
    "my-lint/attribute-order-template": [
      "error",
      {
        order: [
          "CONDITIONALS",
          "DEFINITION",
          "LIST_RENDERING",
          "UNIQUE",
          ["TWO_WAY_BINDING", "OTHER_DIRECTIVES", "RENDER_MODIFIERS"],
          "BIND_ATTR",
          "OTHER_ATTR",
          "BOOL_ATTR",
          "EVENTS",
        ],
        alphabetical: true,
      },
    ],
  },
};
