"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageName = exports.getInputList = void 0;
const core = require("@actions/core");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const csvparse = require("csv-parse/lib/sync");
async function getInputList(name, ignoreComma) {
    const res = [];
    const items = core.getInput(name);
    if (items === "") {
        return res;
    }
    const parsed = await csvparse(items, {
        columns: false,
        relax: true,
        relaxColumnCount: true,
        skipLinesWithEmptyValues: true,
    });
    for (const output of parsed) {
        if (output.length == 1) {
            res.push(output[0]);
            continue;
        }
        else if (!ignoreComma) {
            res.push(...output);
            continue;
        }
        res.push(output.join(","));
    }
    return res.filter(item => item).map(pat => pat.trim());
}
exports.getInputList = getInputList;
function imageName(tags) {
    return /([^:@]*)/.exec(tags[0])[0];
}
exports.imageName = imageName;
//# sourceMappingURL=util.js.map