"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSyftCommand = exports.downloadSyft = exports.SYFT_VERSION = exports.SYFT_BINARY_NAME = exports.createSbom = void 0;
const core = require("@actions/core");
const exec = require("@actions/exec");
const cache = require("@actions/tool-cache");
const stream = require("stream");
async function createSbom(image) {
    let stdout = "";
    const cmd = await getSyftCommand();
    const env = {
        SYFT_CHECK_FOR_APP_UPDATE: "false",
    };
    const args = [image, "-o", "json"];
    const outStream = new stream.Writable({
        write(buffer, encoding, next) {
            next();
        },
    });
    const exitCode = await core.group("Creating Docker image SBOM", async () => exec.exec(cmd, args, {
        env,
        outStream,
        listeners: {
            stdout(buffer) {
                stdout += buffer.toString();
            },
            stderr(buffer) {
                core.info(buffer.toString());
            },
            debug(message) {
                core.debug(message);
            },
        },
    }));
    if (exitCode > 0) {
        core.debug(`Syft stdout: ${stdout}`);
        throw new Error("An error occurred running Syft");
    }
    else {
        return stdout;
    }
}
exports.createSbom = createSbom;
exports.SYFT_BINARY_NAME = "syft";
exports.SYFT_VERSION = "v0.21.0";
async function downloadSyft() {
    const name = exports.SYFT_BINARY_NAME;
    const version = exports.SYFT_VERSION;
    const url = `https://raw.githubusercontent.com/anchore/${name}/main/install.sh`;
    const installPath = await cache.downloadTool(url);
    const outStream = new stream.Writable({
        write(buffer, encoding, next) {
            next();
        },
    });
    await exec.exec(`chmod +x ${installPath}`, [], {
        outStream,
    });
    const cmd = `${installPath} -b ${installPath}_${name} ${version}`;
    await exec.exec(cmd, [], {
        outStream,
    });
    return `${installPath}_${name}/${name}`;
}
exports.downloadSyft = downloadSyft;
async function getSyftCommand() {
    const name = exports.SYFT_BINARY_NAME;
    const version = exports.SYFT_VERSION;
    let syftPath = cache.find(name, version);
    if (!syftPath) {
        syftPath = await downloadSyft();
        syftPath = await cache.cacheFile(syftPath, name, name, version);
    }
    core.addPath(syftPath);
    return name;
}
exports.getSyftCommand = getSyftCommand;
//# sourceMappingURL=sbom.js.map