"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const fs = require("fs-extra");
const node_fetch_1 = require("node-fetch");
const util = require("util");
const zlib = require("zlib");
const docker_1 = require("./docker");
const sbom_1 = require("./sbom");
async function run() {
    try {
        await (0, docker_1.installSkopeo)();
        const name = core.getInput("image");
        const url = core.getInput("url");
        //const tags = core.getInput("tags");
        const sbom = JSON.parse(await (0, sbom_1.createSbom)(name));
        const payload = await compress(JSON.stringify({
            //inspect,
            //history,
            sbom,
            event: await fs.readJson(process.env.GITHUB_EVENT_PATH),
            path: "Dockerfile",
        }));
        console.log(payload);
        await (0, node_fetch_1.default)(url, { method: "post", compress: true, body: payload });
    }
    catch (error) {
        core.setFailed(error.message);
    }
}
async function compress(value) {
    return (await util.promisify(zlib.deflate)(value)).toString("base64");
}
void run();
//# sourceMappingURL=main.js.map