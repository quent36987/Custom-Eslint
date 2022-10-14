/* eslint-disable */

const { onFuncPrefixMatchingCreate } = require("./funcPrefixMatching");

module.exports = {
    rules: {
        "attribute-order-template": require("./attribute-order-template"),
        "func-prefix-matching": require("./funcPrefixMatching")
    },
};
