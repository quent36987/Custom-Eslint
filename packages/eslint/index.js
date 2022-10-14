/* eslint-disable */

const { onFuncPrefixMatchingCreate } = require("./funcPrefixMatching");

module.exports = {
    rules: {
        "order-test": require("./orderTest"),
        "func-prefix-matching": {
            create: onFuncPrefixMatchingCreate,
        },
    },
};
