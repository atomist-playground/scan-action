"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const util = require("util");
const zlib = require("zlib");
const sbom_1 = require("./sbom");
async function run() {
    try {
        const name = core.getInput("image");
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Docker = require("dockerode");
        const dc = new Docker();
        const c = await dc.getImage(name);
        const inspect = await c.inspect();
        const history = await c.history();
        const sbom = await (0, sbom_1.createSbom)(name);
        const payload = await compress(JSON.stringify({
            inspect,
            history,
            sbom,
        }));
        core.debug(payload);
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