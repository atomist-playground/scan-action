"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.inspect = exports.installSkopeo = void 0;
const core = require("@actions/core");
const exec = require("@actions/exec");
const stream = require("stream");
async function installSkopeo() {
    await exec.exec("sudo", ["apt-get", "-y", "update"]);
    await exec.exec("sudo", ["apt-get", "-y", "install", "skopeo"]);
}
exports.installSkopeo = installSkopeo;
async function inspect(image) {
    let stdout = "";
    const cmd = "skopeo";
    const args = ["inspect", `docker://${image}`];
    const outStream = new stream.Writable({
        write(buffer, encoding, next) {
            next();
        },
    });
    const exitCode = await core.group("Retrieving Docker image details", async () => exec.exec(cmd, args, {
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
        core.debug(`Skopeo stdout: ${stdout}`);
        throw new Error("An error occurred running Skopeo");
    }
    else {
        return stdout;
    }
}
exports.inspect = inspect;
async function config(image) {
    let stdout = "";
    const cmd = "skopeo";
    const args = ["inspect", `docker://${image}`, "--config"];
    const outStream = new stream.Writable({
        write(buffer, encoding, next) {
            next();
        },
    });
    const exitCode = await core.group("Retrieving Docker image history", async () => exec.exec(cmd, args, {
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
        core.debug(`Skopeo stdout: ${stdout}`);
        throw new Error("An error occurred running Skopeo");
    }
    else {
        return stdout;
    }
}
exports.config = config;
//# sourceMappingURL=docker.js.map