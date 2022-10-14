module.exports = {
  extends: ["plugin:vue/essential", "eslint:recommended"],
  parserOptions: { project: "./tsconfig.json" },
  plugins: ["my-lint"],
  rules: {
    "no-undef": 0,
    "my-lint/func-prefix-matching": [
      "error",
      {
        include: [],
        exclude: ["excludeSomeFunction"],
        message: "",
      },
    ],
    "my-lint/order-test": [
      "error",
      {
        order: [
          "CONDITIONALS",
          "DEFINITION",
          "LIST_RENDERING",
          "UNIQUE",
          ["TWO_WAY_BINDING", "OTHER_DIRECTIVES", "RENDER_MODIFIERS"],
          "BIND_ATTR", // :any-bound-prop="..."
          "OTHER_ATTR", // any-bound-prop="..."
          "BOOL_ATTR", // any-boolean-prop
          "EVENTS",
        ],
        alphabetical: false,
      },
    ],
  },
};
