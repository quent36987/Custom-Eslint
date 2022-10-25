/* eslint-disable */

const { reactive } = require("vue");
module.exports = {
  rules: {
    "attribute-order-template": require("./attribute-order-template"),
    "css-order": require("./css-order"),
    "backspace-template": require("./backspace-template"),
    "multi-lines-template": require("./multi-lines-template"),
    "export-order": require("./export-order"),
    "export-unique": require("./export-unique"),
  },
};
