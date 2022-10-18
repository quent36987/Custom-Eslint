module.exports = {
  extends: ["plugin:vue/essential", "eslint:recommended"],
  parserOptions: { project: "./tsconfig.json" },
  plugins: ["my-lint"],
  rules: {
    "no-undef": 0,
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
          ["flex", "grid-column-start", "justify-self"],
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
