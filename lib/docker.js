"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installSkopeo = void 0;
const exec = require("@actions/exec");
async function installSkopeo() {
    await exec.exec("sudo", ["apt-get", "-y", "update"]);
    await exec.exec("sudo", ["apt-get", "-y", "install", "skopeo"]);
}
exports.installSkopeo = installSkopeo;
//# sourceMappingURL=docker.js.map