module.exports = {
  extends: ["plugin:vue/essential", "eslint:recommended"],
  parserOptions: { project: "./tsconfig.json" },
  plugins: ["my-lint"],
  rules: {
    "no-undef": 0,
    "my-lint/css-order": "error",
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
