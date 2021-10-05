"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs-extra");
const node_fetch_1 = require("node-fetch");
const util = require("util");
const zlib = require("zlib");
const docker_1 = require("./docker");
const sbom_1 = require("./sbom");
const util_1 = require("./util");
async function run() {
    try {
        const tags = await (0, util_1.getInputList)("tags");
        const url = core.getInput("url");
        const token = core.getInput("token");
        const dockerfile = core.getInput("dockerfile");
        const octokit = github.getOctokit(token);
        const file = (await octokit.rest.repos.getContent({
            repo: github.context.repo.repo,
            owner: github.context.repo.owner,
            path: dockerfile,
            ref: github.context.sha,
        })).data;
        const payload = await compress(JSON.stringify({
            inspect: JSON.parse(await (0, docker_1.inspect)(tags[0])),
            history: JSON.parse(await (0, docker_1.config)(tags[0])),
            sbom: JSON.parse(await (0, sbom_1.createSbom)(tags[0])),
            event: await fs.readJson(process.env.GITHUB_EVENT_PATH),
            file: { path: file.path, sha: file.sha },
            tags,
        }));
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